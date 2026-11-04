import {cp,mkdir,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/postcss';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.join(project,'work/github-pages-live');
await mkdir(root,{recursive:true});
await cp(path.join(project,'app'),path.join(root,'app'),{recursive:true});
await cp(path.join(project,'public'),path.join(root,'public'),{recursive:true});
await writeFile(path.join(root,'main.tsx'),`import React from 'react';import{createRoot}from'react-dom/client';import OrderingApp from './app/ordering-app';import './app/globals.css';const url=new URL(location.href);if(url.searchParams.get('space')==='manage')location.replace('https://feifei-tuntun-table.wudi0971.chatgpt.site/manage?look=cute');else{if(!url.searchParams.has('look')){url.searchParams.set('look','cute');history.replaceState(null,'',url);}createRoot(document.getElementById('root')!).render(<OrderingApp/>);}`);
await writeFile(path.join(root,'index.html'),'<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="菲菲饮品店、屯屯小厨房和家庭观影角：选个昵称，一起点餐。"><title>两人一起 · 菲菲和屯屯</title><link rel="icon" href="/favicon.svg"></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>');
await writeFile(path.join(root,'public/.nojekyll'),'');
await writeFile(path.join(root,'public/CREDITS.md'),await readFile(path.join(project,'CREDITS.md')));
await writeFile(path.join(root,'public/README.md'),'# 两人一起 · GitHub 点餐站\n\nhttps://noground.github.io/?look=cute\n\n菜单、昵称、订单、评价及上传图片与原 Sites 网站共用 D1 数据。请选同一个昵称查看自己的记录。管理页继续在原网站。使用 app/shop-api.ts 连接受限访客接口，不依赖跨站 Cookie，不提供管理权限。网络无法连接原后台时会明确提示，不会把本地试选误作已保存订单。\n\n构建：在源码目录安装依赖后运行 node scripts/build-github-pages.mjs，发布 work/github-pages-live/dist 到 gh-pages 分支。\n');
await build({configFile:false,root,plugins:[react()],base:'/',css:{postcss:{plugins:[tailwind()]}},build:{outDir:'dist'}});
console.log(path.join(root,'dist'));
