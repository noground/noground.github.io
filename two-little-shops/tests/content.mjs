// Local-only contract check and one-use browser login for the content editor.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import {createServer} from 'node:http';
const base=process.env.TEST_URL||'http://127.0.0.1:5173';
assert(['localhost','127.0.0.1'].includes(new URL(base).hostname),'Only local test databases are allowed.');
const sql=command=>{const r=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--command',command],{encoding:'utf8'});assert.equal(r.status,0,r.stderr||r.stdout);};
const ownerId=randomUUID(),token=randomUUID()+randomUUID(),nickname='本地页面管理员'+Date.now().toString().slice(-6);
sql(`INSERT INTO users(id,nickname,salt,pin_hash,role) VALUES('${ownerId}','${nickname}','fixture','fixture','owner'); INSERT INTO sessions(token,user_id,expires) VALUES('${createHash('sha256').update(token).digest('hex')}','${ownerId}',${Date.now()+3600000});`);
if(process.argv.includes('--preview')){
 const server=createServer((req,res)=>{if(req.url!=='/open-local-admin'){res.writeHead(404).end();return;}res.writeHead(302,{'Set-Cookie':`table_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`,Location:base+'/manage?look=cute'}).end();server.close();});
 server.listen(0,'127.0.0.1',()=>console.log(`Local-only preview: http://${new URL(base).hostname}:${server.address().port}/open-local-admin`));
}else{
 const request=async(path,body,cookie='')=>{const r=await fetch(base+'/api/'+path,{method:body===undefined?'GET':'POST',headers:{origin:base,'Content-Type':'application/json',...(cookie?{cookie}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};};
 const owner=(path,body)=>request(path,body,'table_session='+token),uploaded=[],guestIds=[];
 const before=(await request('boot')).data;let revision=before.contentRevision,changed=false;
 try{
  assert.equal(before.dishes.length,9);assert.equal(before.canManage,false);assert.equal(before.content.series.length,7);assert.equal((await owner('boot')).data.canManage,true);
  const mailSettings=await owner('mail-settings');assert.equal(mailSettings.status,200);assert.equal(mailSettings.data.enabled,false);assert.equal((await owner('mail-test',{})).status,502);
  assert.equal((await request('content',{content:before.content,revision})).status,403);
  const guest=await request('auth',{nickname:'页面访客验收'+Date.now().toString().slice(-6)});guestIds.push(guest.data.user.id);
  assert.equal((await request('content',{content:before.content,revision},guest.cookie)).status,403);
  const picked=await request('auth',{nickname});assert.equal((await request('boot',undefined,picked.cookie)).data.canManage,false);
  assert.equal((await request('content-photo',{key:'fake',image:'data:image/png;base64,AAAA'},picked.cookie)).status,403);
  const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jGZkAAAAASUVORK5CYII=';
  const upload=await owner('content-photo',{key:'test-content',image:png});assert.equal(upload.status,200);uploaded.push(upload.data.url.split('/').pop());
  assert.equal((await fetch(base+upload.data.url)).headers.get('content-type'),'image/png');
  const edit=structuredClone(before.content);delete edit.copyVersion;edit.rooms.feifei.tagline='三杯美式，三种好心情';edit.rooms.tuntun.tagline='自己的厨房介绍';edit.cinema.sofaText='小猫靠着卡皮巴拉，今晚哪儿也不去。';edit.home.title='页面管理持久化验收';edit.rooms.feifei.image=upload.data.url;edit.rooms.feifei.coverImage='';edit.series.push({...edit.series[0],id:'content-test-series',name:'自定义剧集',image:upload.data.url,showPin:false});
  const save=await owner('content',{content:edit,revision});assert.equal(save.status,200);changed=true;revision=save.data.revision;
  const fresh=(await request('boot')).data;assert.equal(fresh.content.home.title,edit.home.title);assert.equal(fresh.shops[0].image,upload.data.url);assert.equal(fresh.content.series.length,8);assert.equal(fresh.dishes.length,9,'Content/photos must not turn into dishes.');
  assert.equal(fresh.content.copyVersion,1);assert.equal(fresh.content.rooms.feifei.tagline,'popo特制，开启好心情');assert.equal(fresh.content.rooms.tuntun.tagline,'自己的厨房介绍');assert.equal(fresh.content.cinema.sofaText,'popo靠着屯屯，今晚哪儿也不去。');
  assert.equal((await owner('content',{content:before.content,revision:before.contentRevision})).status,409);
  const bad=structuredClone(edit);bad.rooms.cinema.image='javascript:alert(1)';assert.equal((await owner('content',{content:bad,revision})).status,400);
  const duplicate=structuredClone(edit);duplicate.series.push(duplicate.series[0]);assert.equal((await owner('content',{content:duplicate,revision})).status,400);
  const embedded=structuredClone(edit);embedded.rooms.cinema.image=png;assert.equal((await owner('content',{content:embedded,revision})).status,400);
  assert.equal((await request('boot')).data.contentRevision,revision,'Rejected edits must leave the saved page unchanged.');
  console.log('PASS: owner-only content/images, shared persistence, reserved-row isolation, custom series, stale-save rejection and image validation.');
 }finally{
  if(changed){const restored=await owner('content',{content:before.content,revision});assert.equal(restored.status,200);if(before.contentRevision===0)sql("DELETE FROM overrides WHERE id='site-content';");}
  for(const id of uploaded)sql(`DELETE FROM overrides WHERE id='${id}';`);
  sql(`DELETE FROM sessions WHERE user_id IN ('${ownerId}'${guestIds.map(id=>",'"+id+"'").join('')}); DELETE FROM users WHERE id IN ('${ownerId}'${guestIds.map(id=>",'"+id+"'").join('')});`);
 }
}
