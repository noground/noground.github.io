import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const base=process.env.TEST_URL||'http://127.0.0.1:5173';
assert(['127.0.0.1','localhost'].includes(new URL(base).hostname),'Fixtures must stay in the local database.');
let token,userId;const nickname='跨站验收'+randomUUID().slice(0,8);
async function bridge(path,body,method='POST',origin='https://noground.github.io'){
 // Match the deployment hostname for Vinext's dev-only origin guard.
 const response=await fetch(base+'/api/github',{method:'POST',headers:{Origin:origin,'X-Forwarded-Host':'noground.github.io','Content-Type':'text/plain'},body:JSON.stringify({path,method:body===undefined?'GET':method,body,token})});
 const raw=await response.text();let data;try{data=JSON.parse(raw);}catch{data={error:raw};}return {response,data};
}
try{
 assert.equal((await bridge('boot',undefined,'GET','https://wrong.example')).response.status,403);
 const boot=await bridge('boot');assert.equal(boot.response.status,200);assert.equal(boot.data.canManage,false);
 assert.equal((await bridge('menu',{})).response.status,403);
 const auth=await bridge('auth',{nickname});assert.equal(auth.response.status,200);assert.equal(auth.data.user.role,'guest');assert.equal(auth.response.headers.get('Set-Cookie'),null);token=auth.data.token;userId=auth.data.user.id;
 assert.equal((await bridge('boot')).data.user.id,userId);
 const dish=boot.data.dishes.find(d=>d.id==='orange-americano');
 const order=await bridge('orders',{requestId:randomUUID(),items:[{id:dish.id,quantity:2,options:{温度:'冰',甜度:'微糖'}}],note:'本地 GitHub 跨站接口验收'});assert.equal(order.response.status,200);
 const rows=await bridge('orders');assert.equal(rows.data[0].id,order.data.id);assert.equal(rows.data[0].items[0].quantity,2);
 const original=await(await fetch(base+'/api/orders',{headers:{Cookie:'table_session='+token}})).json();assert.equal(original[0].id,order.data.id,'Both clients must read the same order.');
 assert.equal((await bridge('order',{id:order.data.id,status:'completed'},'PATCH')).response.status,200);
 assert.equal((await bridge('order',{id:order.data.id,rating:5,review:'本地跨站评价验收'},'PATCH')).response.status,200);
 const reviewed=await(await fetch(base+'/api/orders',{headers:{Cookie:'table_session='+token}})).json();assert.equal(reviewed[0].rating,5);
 assert.equal((await bridge('orders?all=1')).response.status,403);
 await bridge('logout',{});assert.equal((await bridge('orders')).response.status,401);
 console.log('PASS: GitHub nickname, shared original-site order/history, quantities, completion/reviews, visitor boundary, and logout revocation.');
}finally{
 if(userId){const limit=createHash('sha256').update('local'+nickname.toLocaleLowerCase()).digest('hex');const sql=`DELETE FROM orders WHERE user_id='${userId}'; DELETE FROM sessions WHERE user_id='${userId}'; DELETE FROM users WHERE id='${userId}'; DELETE FROM limits WHERE key='${limit}';`;
 const cleaned=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--command',sql],{encoding:'utf8'});assert.equal(cleaned.status,0,cleaned.stderr||cleaned.stdout);}
}
