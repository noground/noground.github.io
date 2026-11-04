# 两人一起 · 网站源码备份

本仓库保存「菲菲和屯屯」点餐网站的源码和项目配图。原有 `index.html` 保留。

- 点餐网站：https://feifei-tuntun-table.wudi0971.chatgpt.site/?look=cute
- 独立管理页：https://feifei-tuntun-table.wudi0971.chatgpt.site/manage?look=cute
- 完整源码：[two-little-shops](./two-little-shops/)
- 开发和功能说明：[项目 README](./two-little-shops/README.md)

## 备份版本

2026 年 11 月 4 日，Sites 第 8 版，原始源码提交 `79f134fdc88dc8a296d6f269fc37f885b12a6c4e`，共 152 个项目文件。
包含 Safari 图片上传修复、独立 `/manage` 管理网址、三个空间、菜单、订单和评价的实现，以及场景配图。

## 备份范围

此处保存源码、依赖锁定文件、初始菜单、数据库结构与迁移文件、项目配图；不包含线上数据库、用户昵称、订单、评价、后台修改的文字或上传照片，也不包含登录会话、访问令牌、本地运行数据或 node_modules。
线上数据继续存放于原网站的 D1 数据库。恢复时需另外备份和导入线上数据。

## 使用

进入 `two-little-shops`，按项目 README 安装依赖、初始化独立本地数据库后运行。
项目使用 Vinext、Cloudflare Workers 和 D1；原 `.openai/hosting.json` 保留用于标识已有 Sites 项目。创建独立站点前应重新配置自己的托管身份与存储绑定。

这次只保存备份，未开启或更改 GitHub Pages。GitHub Pages 不能直接运行本项目的后台、数据库或上传功能；保存源码不等于完整网站已在 GitHub 上线。原 Sites 网址及其部署保持不变。
