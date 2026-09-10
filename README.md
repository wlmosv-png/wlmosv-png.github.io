# 阳阳，我错了

一个只做认错记录的站点。Hexo 8 + Butterfly 5，push main 自动部署。

- 首页：一封逐条认领的信
- /sorry/ ：一整屏「我错了」，点一下加一句
- 原谅值只统计，不自动涨满

## 改文案

内容都在 source/ 下，改完推 main 即可。

## 部署

GitHub Actions：.github/workflows/deploy.yml 跑 hexo generate，产物发到 Pages。

整站对搜索引擎关闭收录（meta robots noindex）。
