# 两人一起 · 点餐网站

- GitHub 点餐地址：https://noground.github.io/?look=cute
- 原网站：https://feifei-tuntun-table.wudi0971.chatgpt.site/?look=cute
- 管理页：https://feifei-tuntun-table.wudi0971.chatgpt.site/manage?look=cute
- 完整源码：[two-little-shops](./two-little-shops/)

GitHub 页面已接入原站后台，支持昵称、多份下单、订单记录、确认吃好、评价及再来一单；菜单、文字及上传配图与原站共用。两个地址各选一次相同昵称即可查看同一组订单。管理只在原管理页开放。不能连接原后台时会提示网络错误，不能离线保存订单。国内直连效果仍需实测。

当前固定使用可爱外观，去掉外观选择，并更新 popo／屯屯的介绍及双人观影对话气泡。

## 源码备份

2026 年 11 月 5 日，Sites 第 10 版，源提交 dd11bfce361a8b55d219b5bbbe28e9a6e2925771。源码、项目配图和数据库迁移保存在 main 分支；网页产物从 gh-pages 分支发布。main 原有 index.html 保留。

线上用户、订单、评价、后台上传照片、登录会话及凭据不备份到 GitHub；这些数据仍存于原站 D1。

## 构建和验证

进入 two-little-shops，安装依赖后运行 node scripts/build-github-pages.mjs，发布 work/github-pages-live/dist 到 gh-pages。开发与测试见项目 README。
