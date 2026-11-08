# 免费点餐访问入口

只中转 GitHub 点餐页的 `/api/github` 访客接口。订单和昵称写入现有 Cloudflare D1，邮件由现有后台处理。

在 Render 创建 Web Service，选择仓库 `noground/noground.github.io` 的 `main` 分支。

| 项目 | 设置 |
| --- | --- |
| Root Directory | `two-little-shops/standalone/relay` |
| Runtime | Node |
| Region | Singapore |
| Build Command | `node --check server.mjs` |
| Start Command | `node server.mjs` |
| Instance Type | Free |
| Health Check Path | `/health` |

根目录 `render.yaml` 提供同一份 Blueprint 配置。此服务无需数据库或邮件密钥。

部署后需在使用者的网络关闭代理，验证 `/health` 和 GitHub 昵称、下单、订单记录及邮件提醒，再切换点餐页的 `ORDER_API_ORIGIN`。免费服务闲置后会休眠，首次唤醒可能耗时约一分钟。

本地检查可在项目根目录运行 `node tests/order-relay.mjs`。
