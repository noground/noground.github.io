# 两家店订单邮件接入

规则：`tuntun` 餐品通知小厨房收件人，`feifei` 餐品通知饮品店收件人。混合订单发两封，每封只包含本店餐品和小计，昵称、订单编号与留言共用。发件人与收件人通过服务端受保护配置指定，访客不能指定邮箱。

## 当前状态

发送逻辑、独立的邮件状态、管理页连接检查及测试邮件入口已实现。没有配好全部发信参数时显示“还未连接邮件服务”，不会假装发送，也不影响订单保存。历史订单不会因为部署更新而补发。

## 邮件中转

Sites 目前的托管环境使用 HTTPS 外连，不能直接连接 163 SMTP。此实现通过 EmailJS HTTPS API 连接自己配置的 163 邮箱。EmailJS 会处理订单邮件并保存该邮箱的 SMTP 授权信息，必须先由邮箱所有者确认接入。

EmailJS 官方当前免费版为每月 200 次请求，测试邮件也计入；以其控制台实时规则为准。不自动购买或升级付费计划。

连接时，SMTP 主机为 `smtp.163.com`，SSL/TLS 端口为 `465`，用户名为完整邮箱地址，密码栏使用 163 客户端授权码。授权码由所有者直接填写到邮件服务的安全连接页面，不写入聊天、项目文件、GitHub 或网页代码。

## 邮件模板

在 EmailJS 建立一个模板：

- To Email：`{{to_email}}`（不能写死某个收件人，否则无法按店铺分流）
- From Email：`{{from_email}}`（必须与连接的 163 发件账号一致）
- From Name：`{{from_name}}`
- Subject：`{{subject}}`，正文标题也使用 `{{subject}}`
- 内容：使用 [order-email-template.html](./order-email-template.html)。动态内容必须保留双大括号，不能改成三大括号，防止用户留言被当作 HTML。
- 在账号安全设置允许服务端 API 调用，使用 Private Key。不要公开私钥。

## 运行配置

通过 Sites 运行环境的 secret 功能保存以下六项，所有值均不放进仓库：

```
EMAILJS_SERVICE_ID
EMAILJS_TEMPLATE_ID
EMAILJS_PUBLIC_KEY
EMAILJS_PRIVATE_KEY
ORDER_MAIL_FROM
ORDER_MAIL_TUNTUN_TO
ORDER_MAIL_FEIFEI_TO
```

从原站独立管理页进入“邮件提醒”，确认发件人与收件人正确，再分别点击“测试饮品店”和“测试小厨房”。测试邮件明确注明不是真实订单。只有收到测试邮件后才可确认收件成功。

## 状态与恢复

`orders.email_status` 记录 `not_requested`（部署前的历史订单）、`not_required`（仅饮品）、`not_configured`（服务未连接）、`pending`、`sending`、`sent`、`failed`、`unknown`。成功时保存发送时间。状态与尝试次数只记录在原站数据库，不含账号私钥和服务响应正文。

数据库原子状态认领与原有下单请求去重共同避免重复提交引发重复提醒。网络中断导致发送结果不明时记录 `unknown`，不自动重发，以免同一订单收到重复邮件。失败提醒不会撤销订单；店主仍可从管理页查看订单。

本地测试不连接真实邮箱，不发送真实邮件。

参考：

- https://www.emailjs.com/docs/rest-api/send/
- https://www.emailjs.com/docs/user-guide/connecting-email-services/
- https://www.emailjs.com/docs/user-guide/dynamic-variables-templates/
- https://www.emailjs.com/pricing/

## 按店铺分别发送

第 12 版起，原 `email_*` 字段保留小厨房状态；新增 `feifei_email_*` 字段记录饮品店的独立状态。两店各自原子认领，失败或结果不明时不会重发另一家已成功的邮件。仅饮品、仅厨房、混合订单分别触发一封、一封、两封；旧订单不会因为配置变化而补发。

通过已有 D1 limits 表预留发送时间，使两封邮件及不同订单的通知按至少 1.2 秒的间隔发送，适配 EmailJS 的每秒一请求限制。等待超过 15 秒时记录 mail_queue_busy，不影响下单。测试入口同样计入发信额度。
