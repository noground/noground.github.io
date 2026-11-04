# 两人一起 · GitHub 点餐站

https://noground.github.io/?look=cute

菜单、昵称、订单、评价及上传图片与原 Sites 网站共用 D1 数据。请选同一个昵称查看自己的记录。管理页继续在原网站。使用 app/shop-api.ts 连接受限访客接口，不依赖跨站 Cookie，不提供管理权限。网络无法连接原后台时会明确提示，不会把本地试选误作已保存订单。

构建：在源码目录安装依赖后运行 node scripts/build-github-pages.mjs，发布 work/github-pages-live/dist 到 gh-pages 分支。
