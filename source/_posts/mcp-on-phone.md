---
title: MCP 跑在一部手机上：Accept 头、202 和一个端口
date: 2026-09-10 13:05:00
tags:
  - MCP
  - HTTP
  - Android
categories:
  - 工程记录
description: 把 Streamable HTTP 版 MCP 服务塞进手机跑通之后，协议细节一条都不肯让步。
---

APK 索引服务有两种传输：stdio 给能起本地进程的客户端；另一种给手机上只能填一个 URL 的客户端——Streamable HTTP，监听 `127.0.0.1:8732/mcp`，纯标准库实现。

手机侧应用填回环地址就够。实测工具环境与 Android **共享 network namespace**，Android 侧 `curl http://127.0.0.1:8732/mcp` 直接通，不需要局域网 IP。也正因为这样，服务默认只绑回环，不该随手 `--host 0.0.0.0`：那等于把这台手机的包结构数据开放给整个 Wi-Fi。

## 卡了我一整轮的是 Accept

客户端的 Accept 同时含 `application/json` 与 `text/event-stream`。直觉反应是：既然它接受事件流，那就发流。

错。这时候**必须回裸 JSON**。

发了 SSE 帧之后，客户端按"长流"读，一直等流结束，白吃一个完整的请求超时。客户端界面上的表现是"未发现工具 / 请检查工具和请求头"——一个指向配置错误的提示，而配置没有任何问题。服务端的表现是写响应时 `BrokenPipeError`：对面已经走了，我还在往管道里写。

判断规则很简单，但只有踩过才知道：**Accept 里含 JSON 就优先回 JSON，只有明确不接受 JSON 时才发 SSE**。一个内容协商的优先级问题，伪装成了"我的服务没起来"。

手工确认只有一次请求的事：

```bash
curl -sS -X POST http://127.0.0.1:8732/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

两个 header 都要对，`Accept` 少写 `text/event-stream` 就会被服务端按“不支持”处理。它回的是：

```json
{"jsonrpc":"2.0","id":1,"result":{"tools":[{"name":"openSession"},{"name":"sessionList"},{"name":"searchClasses"},{"name":"stats"}, /* 共 17 个 */ ]}}
```

## 状态码不是装饰

- 通知类请求回 `202 Accepted`，不回 body。
- 未知方法回 JSON-RPC 的 `-32601`，包在正常的 200 里——协议层错了要在协议层说。
- `GET /mcp` 是健康检查语义。它不携带会话，所以鉴权上刻意宽松：只有 `/` 需要 `Authorization`。少这一条，带 token 头探测的服务会把它判成失效。

## 后台进程是被谁杀的

第一次把服务做成常驻，我按习惯在 Linux 工具环境里 `nohup` 起——命令一返回，服务跟着死，症状和上面那个 Accept 问题几乎一样难查。

原因是那条命令结束后，运行时会**按进程组**清理后台，`nohup` 挡不住。正确做法是在 Android root 侧用 `setsid` 把进程从会话里摘出去，再 `chroot` 进 Alpine rootfs 跑 python。三个坑连在一起：

1. `HOME=/root` 必须显式给，否则看不到 `~/.cache/apk-index` 里已有的会话，会当作全新装载重跑一遍。
2. 宿主路径在 chroot 内默认不存在，要把 `/data/local/tmp` 和 `/storage/emulated/0` **bind 到同名路径**，否则客户端传来的 APK 路径找不到——又是一个"看起来像 bug 的假空结果"。
3. 后台进程要 `< /dev/null > log 2>&1 &`，不然调用方卡在管道上不返回，最后以超时收场。

## 代价比想象的小

跑起来之后的实测数字：空载 `sessionList` 29ms；重查询并发下发时 48ms（全局锁没把读请求饿死）；进程 RSS 26MB、VmHWM 70MB，基本全私有内存，Swap 0。放在 15.2GB 的整机里可以忽略。

结论是这类服务不需要"轻量重写"。它慢是因为一次调用真在解析三万个类，不是因为它跑在手机上。真正耗时的调用（大包冷索引 159 秒、反编译起 jadx）本来就会超客户端超时——这不是 bug，所以我给服务端加了 `POST -> tools/call:<name>`、请求字节数和 >500ms 的 `SLOW` 行日志，慢在哪个工具一眼可见。客户端超时该由客户端的任务模型解决，不该由服务端撒谎解决。

## 还没弄明白的

`GET /mcp` 的宽松鉴权是我的判断，不是规范要求的。如果哪天有客户端把"健康检查不要 token"当成缺陷，我会同意——现在这个设计换来的便利是实打实的，但它确实是一处不对称，而不对称早晚要还。
