# 独立后台

Cloudflare Worker 提供点餐接口、店主管理页和静态网站，D1 保存菜单、图片、昵称和订单。

## 构建和发布

在项目根目录运行。此配置连接已有的生产数据库。

```sh
ORDER_API_ORIGIN=https://two-little-shops.wudi09711-shops.workers.dev node scripts/build-github-pages.mjs
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js deploy --config standalone/wrangler.jsonc
```

将生成的 `work/github-pages-live/dist` 发布到 GitHub Pages 后，它通过访客接口连接同一个后台。店主管理入口为后台地址的 `/manage?look=cute`。

## 受保护配置

以下值通过 Wrangler secrets 配置，配置值应留在受保护存储中。

- `OWNER_PASSWORD_HASH` 为 16 字节随机盐和 PBKDF2-SHA256 派生值，十六进制格式 `salt:hash`，迭代 100000 次，派生长度 32 字节。
- `OWNER_SESSION_KEY` 为独立生成的随机签名密钥。
- `EMAILJS_SERVICE_ID`、`EMAILJS_TEMPLATE_ID`、`EMAILJS_PUBLIC_KEY`、`EMAILJS_PRIVATE_KEY` 连接已有邮件服务。
- `ORDER_MAIL_FROM`、`ORDER_MAIL_TUNTUN_TO`、`ORDER_MAIL_FEIFEI_TO` 设置发件地址和两家店的收件地址。

普通食客选择昵称。管理操作需要店主口令。原站通过自己的身份系统管理，独立后台使用签名 Cookie。

原站数据通过其店主专用 `/api/migration-export` 导出，迁入独立 D1 后保留原用户编号、订单编号和图片。更换后台后需要重新选择昵称。每个部署拥有自己的数据库，后续修改分别保存。
