# 运行时之下

Hexo 站点源码。线上：https://wlmosv-png.github.io

这个仓库**只存源码**。`public/` 与 `node_modules/` 已 gitignore，渲染产物由
GitHub Actions 构建后作为 Pages artifact 上传，绝不提交回仓库。
（上一站就是这么丢的源码：Pages 仓库里全是 index.html，`_config.yml` 在人电脑上。）

## 本地跑

```sh
node -v            # 需要 >= 20，实测 24 可用
npm ci             # 版本由 package-lock.json 锁死
npm run dev        # http://127.0.0.1:4000 预览
npm run build      # 产出 public/，与 CI 完全同一条命令
```

## 两个坑（都在这份 package.json 里，别删）

**一、插件必须装在 `dependencies`，不能是 `devDependencies`。**

`hexo/dist/hexo/load_plugins.js` 第 18 行只读 `json.dependencies`。装成 dev 依赖时
Hexo 不加载它，而现场表现是：`npx hexo generate` 只打一句 usage，
退出码 0，没有报错，`public/` 里只有主题的 css/js，Markdown 原样被拷进去当静态文件。
看起来像"命令用错了"，其实是插件全没生效。

**二、`package.json` 里必须有 `hexo` 这个对象字段。**

```json
"hexo": { "version": "8.1.2" }
```

`hexo-cli` 靠 `typeof json.hexo === 'object'` 判断当前目录是不是一个 Hexo 站点
（`hexo-cli/dist/find_pkg.js`）。没有这个字段，它**静默**退回内置的
help/init/version 三个命令，`generate` 不存在——同样不报错。
`hexo init` 生成的脚手架会写这一行，手写 package.json 时最容易漏。

## 结构

```text
_config.yml                  站点配置。换域名只改 url/root 两行
_config.butterfly.yml        主题配置单独一份，升级主题不会覆盖自己的改动
source/_posts/               文章
source/about.md              关于页（page，不进归档）
source/tags/index.md         标签页骨架（butterfly 菜单需要，缺了就 404）
source/categories/index.md   分类页骨架
source/img/                  图片，按文章名建子目录，站内相对路径引用
scaffolds/post.md            新文章模板，含写作约束
.github/workflows/deploy.yml 构建 + 部署到 Pages
```

主题配置从 `node_modules/hexo-theme-butterfly/_config.yml` 复制而来，
并把行尾统一成 LF。升级主题时**不要**直接覆盖 `_config.butterfly.yml`，
用 `diff` 挑新键。

## 发布

`git push origin main` 之后看 Actions。

Pages 侧设置：Settings → Pages → Build and deployment → **Source: GitHub Actions**。
选错成 `Deploy from a branch` 的话，Pages 会去找 `gh-pages` 分支然后 404，
而 Actions 那边一切正常——这个坑看起来像构建失败，其实是设置项。

构建红了自己看日志。不要为了让它变绿去改 `scaffolds` 或者把文章挪进 `_drafts`。

## 依赖

9 个：hexo 本体、marked/pug/stylus 三个渲染器、searchdb/sitemap/feed 三个生成器、
hexo-server（本地预览）、butterfly 主题。没有评论系统，没有统计脚本，没有第三方 CDN。
站内搜索是 `local_search`，产物 `/local-search.xml`，全部在同源上。

## 实测环境

本目录在这台手机的 Linux 环境里构建通过（2026-09-10）：

- Node 24.18.1，`npx hexo clean && npx hexo generate` → 32 files，无 error
- hexo 8.1.2 / hexo-cli 4.3.2 / hexo-theme-butterfly 5.7.0
- 产物齐全：`index.html`、`archives/index.html`、`archives/2026/09/index.html`、
  `posts/<slug>/index.html` ×3、6 个标签页、分类页、`about/index.html`、`404.html`、
  `sitemap.xml`、`atom.xml`、`local-search.xml`
- 首页内链逐条核过，均有对应文件；代码块由 Hexo 服务端着色（`class="highlight python"`），
  复制按钮由 butterfly 的 `js/main.js` 注入
