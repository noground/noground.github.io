import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const base=process.env.TEST_URL||'http://127.0.0.1:8789';
assert(['127.0.0.1','localhost'].includes(new URL(base).hostname),'Fixtures must stay in a local database.');
const users=[randomUUID(),randomUUID()],orders=[randomUUID(),randomUUID()];
const names=users.map(id=>'查询验收'+id.slice(0,8));
function sql(command){const result=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','standalone/wrangler.jsonc','--persist-to','.wrangler/order-query-test','--command',command],{encoding:'utf8'});assert.equal(result.status,0,result.stderr||result.stdout);}
async function call(path,body,cookie='',method='POST'){const response=await fetch(base+'/api/'+path,{method:body===undefined?'GET':method,headers:{Origin:base,'Content-Type':'application/json',Cookie:cookie},...(body===undefined?{}:{body:JSON.stringify(body)})});return {response,data:await response.json()};}
try{
 sql(users.map((id,index)=>`INSERT INTO users(id,nickname,salt,pin_hash,role) VALUES('${id}','${names[index]}','','','guest'); INSERT INTO orders(id,user_id,nickname,items,total,note,status,created_at,request_id) VALUES('${orders[index]}','${id}','${names[index]}','[]',0,'测试留言','pending','2026-11-09T00:00:0${index}Z','${randomUUID()}');`).join('\n'));
 const query=await call('order-query');assert.equal(query.response.status,200);
 const rows=query.data.filter(order=>orders.includes(order.id));assert.equal(rows.length,2);assert.equal(rows[0].id,orders[1]);assert(Array.isArray(rows[0].items));assert.equal(rows.filter(order=>order.user_id===users[0]).length,1);
 assert.deepEqual(Object.keys(rows[0]).sort(),['id','user_id','nickname','items','total','note','status','created_at','rating','review'].sort());
 const bridge=await fetch(base+'/api/github',{method:'POST',headers:{Origin:'https://noground.github.io','Content-Type':'text/plain'},body:JSON.stringify({path:'order-query',method:'GET'})});assert.equal(bridge.status,200);assert.equal((await bridge.json()).filter(order=>orders.includes(order.id)).length,2);
 assert.equal((await call('orders')).response.status,401);
 const login=await call('auth',{nickname:names[0]});const cookie=login.response.headers.get('set-cookie').split(';')[0];
 assert.equal((await call('orders',undefined,cookie)).data.length,1);
 assert.equal((await call('order',{id:orders[1],status:'completed'},cookie,'PATCH')).response.status,403);
 assert.equal((await call('order',{id:orders[1],rating:5,review:'test'},cookie,'PATCH')).response.status,403);
 console.log('PASS: shared order query, all nicknames, public field list, GitHub bridge, existing own orders, and cross-user write restrictions.');
}finally{sql(`DELETE FROM orders WHERE id IN ('${orders.join("','")}'); DELETE FROM sessions WHERE user_id IN ('${users.join("','")}'); DELETE FROM users WHERE id IN ('${users.join("','")}');`);}
