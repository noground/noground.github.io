import {defaultContent,normalizeContent,type SiteContent} from '../../content';
import { env } from 'cloudflare:workers';
import {githubBridge} from '../../github-bridge';
import { dishes as defaults, shops as defaultShops, buildCartLine, retiredDishIds, type Dish, type Shop, type User } from '../../data';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200,headers:Record<string,string>={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
const fail=(message:string,status=400):never=>{throw Object.assign(new Error(message),{status});};
const str=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
async function hash(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),v=>v.toString(16).padStart(2,'0')).join('');}
// Only Sites' authenticated owner may gain management from a nickname session.
const ownerEmailFingerprint='43dd2970d17b0084b41836f725a338608dd67f27f8ed069b1f5961f682017afd';
async function siteOwner(req:Request){const email=req.headers.get('oai-authenticated-user-email');return !!req.headers.get('oai-authenticated-user-id')&&!!email&&await hash(email.trim().toLowerCase())===ownerEmailFingerprint;}
async function visibleUser(req:Request,account:User,profileOnly:boolean):Promise<User>{return {id:account.id,nickname:account.nickname,role:await siteOwner(req)||(!profileOnly&&account.role==='owner')?'owner':'guest'};}
function cookie(req:Request,token:string,age:number){return `table_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${new URL(req.url).protocol==='https:'?'; Secure':''}`;}
async function userFor(req:Request):Promise<User|null>{const token=req.headers.get('cookie')?.match(/(?:^|;\s*)table_session=([^;]+)/)?.[1];if(!token)return null;const account=await env.DB!.prepare('SELECT u.id,u.nickname,u.role FROM sessions s JOIN users u ON s.user_id=u.id WHERE s.token=? AND s.expires>?').bind(await hash(token),Date.now()).first<User>();return account?visibleUser(req,account,token.startsWith('nickname.')):null;}
async function menu(){const rows=await env.DB!.prepare("SELECT id,data FROM overrides WHERE id != 'site-content' AND id NOT LIKE 'content-photo-%'").all<{id:string;data:string}>();const edits=new Map(rows.results.map(r=>{const d=JSON.parse(r.data);if(d.image?.startsWith('data:'))d.image='/api/photo/'+r.id;return [r.id,d];}));// ponytail: store photo bytes once in D1; use R2 if the image library grows.
return {shops:defaultShops.map(s=>({...s,...edits.get('shop-'+s.id)})) as Shop[],dishes:[...defaults.map(d=>({...d,...edits.get(d.id)})),...rows.results.filter(r=>!r.id.startsWith('shop-')&&!retiredDishIds.has(r.id)&&!defaults.some(d=>d.id===r.id)&&(edits.get(r.id).shop!=='feifei'||edits.get(r.id).catalogRevision===2)).map(r=>edits.get(r.id))] as Dish[]};}
async function contentState(){
 const row=await env.DB!.prepare("SELECT data FROM overrides WHERE id='site-content'").first<{data:string}>();
 const saved=row?JSON.parse(row.data):null,content=normalizeContent(saved?.content??defaultContent);
 if(!saved){for(const key of ['feifei','tuntun'] as const){const legacy=await env.DB!.prepare('SELECT data FROM overrides WHERE id=?').bind('shop-'+key).first<{data:string}>();if(legacy){const image=JSON.parse(legacy.data).image;if(image&&image!==defaultShops.find(s=>s.id===key)!.image)content.rooms[key].coverImage=image.startsWith('data:')?'/api/photo/shop-'+key:image;}}}
 return {content,revision:saved?.revision??0,raw:row?.data??null};
}
async function resolvePhoto(value:string,key:string){if(value==='/api/photo/'+key){const row=await env.DB!.prepare('SELECT data FROM overrides WHERE id=?').bind(key).first<{data:string}>();return row?JSON.parse(row.data).image:value;}return value;}
function imageValid(value:string){return value.length<=240000&&(/^(\/images\/[a-z0-9-]+\.(?:jpg|jpeg|png|webp|svg)|https:\/\/[^\s]+)$/.test(value)||/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(value));}
async function handle(req:Request){if(new URL(req.url).pathname==='/api/github')return githubBridge(req,handle);try{
 if(!env.DB)return json({error:'数据服务暂时不可用，请稍后重试'},503);
 const path=new URL(req.url).pathname.replace('/api/','');
 if(req.method!=='GET'){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)fail('请从小店页面内操作',403);if(Number(req.headers.get('content-length')||0)>300000)fail('图片太大，请选择更小的图片',413);}
 const user=await userFor(req),canManage=await siteOwner(req)||user?.role==='owner';
 if(req.method==='GET'&&path.startsWith('photo/')){const id=path.slice(6);const row=await env.DB.prepare('SELECT data FROM overrides WHERE id=?').bind(id).first<{data:string}>();if(!row)return new Response(null,{status:404});const pic=JSON.parse(row.data).image as string;if(!pic?.startsWith('data:image/'))return new Response(null,{status:404});const [header,encoded]=pic.split(',');return new Response(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),{headers:{'Content-Type':header.slice(5).split(';')[0],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});}
 if(req.method==='GET'&&path==='profiles'){const rows=await env.DB.prepare('SELECT id,nickname FROM users ORDER BY nickname COLLATE NOCASE LIMIT 200').all<{id:string;nickname:string}>();return json(rows.results);}
 if(req.method==='GET'&&path==='boot'){const m=await menu(),state=await contentState();return json({...m,shops:m.shops.map(s=>({...s,name:state.content.rooms[s.id as 'feifei'|'tuntun'].name,english:state.content.rooms[s.id as 'feifei'|'tuntun'].english,tagline:state.content.rooms[s.id as 'feifei'|'tuntun'].tagline,image:state.content.rooms[s.id as 'feifei'|'tuntun'].coverImage||state.content.rooms[s.id as 'feifei'|'tuntun'].image})),user,canManage,content:state.content,contentRevision:state.revision});}
 if(req.method==='GET'&&path==='orders'){const all=new URL(req.url).searchParams.get('all')==='1';if(all&&!canManage)fail('只有店主可以查看全部订单',403);if(!all&&!user)fail('先选个昵称吧',401);const rows=await env.DB.prepare(`SELECT * FROM orders ${all?'':'WHERE user_id=?'} ORDER BY created_at DESC LIMIT 200`).bind(...(all?[]:[user!.id])).all<{items:string}>();return json(rows.results.map(r=>({...r,items:JSON.parse(r.items)})));}
 let body:any={};if(req.method!=='GET'){const raw=await req.text();if(raw.length>300000)fail('内容太大',413);try{body=raw?JSON.parse(raw):{};}catch{fail('提交内容有误');}if(!body||typeof body!=='object'||Array.isArray(body))fail('提交内容有误');}
 if(req.method==='POST'&&path==='auth'){
  const nickname=typeof body.nickname==='string'?body.nickname.normalize('NFKC').trim():'';
  if(!nickname||nickname.length>20||/[\u0000-\u001f\u007f]/.test(nickname))fail('昵称请填写 1–20 个字');
  const now=Date.now(),limitKey=await hash((req.headers.get('cf-connecting-ip')||'local')+nickname.toLocaleLowerCase());
  const rate=await env.DB.prepare('SELECT attempts,reset FROM limits WHERE key=?').bind(limitKey).first<{attempts:number;reset:number}>();if(rate&&rate.reset>now&&rate.attempts>=60)fail('操作较频繁，稍后再试',429);
  await env.DB.prepare('INSERT INTO limits(key,attempts,reset) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN reset<? THEN 1 ELSE attempts+1 END, reset=CASE WHEN reset<? THEN ? ELSE reset END').bind(limitKey,now+60000,now,now,now+60000).run();
  // ponytail: these are shared name labels, not password-protected accounts.
  // Keep existing IDs and order history. Every newly created profile is a guest.
  await env.DB.prepare("INSERT INTO users(id,nickname,salt,pin_hash,role) VALUES(?,?,'','','guest') ON CONFLICT(nickname) DO NOTHING").bind(crypto.randomUUID(),nickname).run();
  const account=await env.DB.prepare('SELECT id,nickname,role FROM users WHERE nickname=?').bind(nickname).first<User>();if(!account)fail('暂时没能选好昵称，请再试一次',503);
  // Prefix is covered by the stored token hash; removing it invalidates the session.
  const token='nickname.'+crypto.randomUUID()+crypto.randomUUID();await env.DB.prepare('INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)').bind(await hash(token),account!.id,now+2592000000).run();
  return json({user:await visibleUser(req,account!,true)},200,{'Set-Cookie':cookie(req,token,2592000)});
 }
 if(req.method==='POST'&&path==='logout'){const t=req.headers.get('cookie')?.match(/(?:^|;\s*)table_session=([^;]+)/)?.[1];if(t)await env.DB.prepare('DELETE FROM sessions WHERE token=?').bind(await hash(t)).run();return json({ok:true},200,{'Set-Cookie':cookie(req,'',0)});}
 if(req.method==='POST'&&path==='content-photo'){
  if(!canManage)fail('只有店主可以修改页面',403);
  const key=str(body.key,120),image=str(body.image,240000);if(!/^[a-z0-9-]{1,120}$/.test(key)||!/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(image)||image.length>230000)fail('上传的图片格式或大小不正确');
  // New immutable keys keep an unsuccessful save from changing the live images.
  const id='content-photo-'+key+'-'+crypto.randomUUID();await env.DB.prepare('INSERT INTO overrides(id,data) VALUES(?,?)').bind(id,JSON.stringify({image})).run();return json({url:'/api/photo/'+id});
 }
 if(req.method==='POST'&&path==='content'){
  if(!canManage)fail('只有店主可以修改页面',403);
  const state=await contentState();if(body.revision!==state.revision)fail('另一个页面已经保存了新内容，请重新载入后再修改',409);
  let clean:SiteContent;try{clean=normalizeContent(body.content);}catch(e:any){fail(e.message);}
  const revision=state.revision+1,data=JSON.stringify({revision,content:clean!});
  const result=state.raw?await env.DB.prepare("UPDATE overrides SET data=? WHERE id='site-content' AND data=?").bind(data,state.raw).run():await env.DB.prepare("INSERT OR IGNORE INTO overrides(id,data) VALUES('site-content',?)").bind(data).run();
  if(result.meta.changes!==1)fail('另一个页面已经保存了新内容，请重新载入后再修改',409);
  return json({content:clean!,revision});
 }
 if(!user&&!canManage)fail('先选个昵称，再继续操作',401);
 if(req.method==='POST'&&path==='orders'){
  if(!user)fail('先选个点餐昵称吧',401);
  if(!Array.isArray(body.items)||!body.items.length||body.items.length>50)fail('购物袋里需要有 1–50 种餐品');
  const requestId=str(body.requestId,80);if(!/^[a-f0-9-]{36}$/.test(requestId))fail('订单请求无效，请重新提交');
  const existing=await env.DB.prepare('SELECT id,user_id FROM orders WHERE request_id=?').bind(requestId).first<any>();if(existing){if(existing.user_id!==user!.id)fail('订单请求无效',403);return json({id:existing.id});}
  const m=await menu();const items=body.items.map((line:any)=>{const dish=m.dishes.find(d=>d.id===line.id);if(!dish)fail('菜单已经更新，请重新选餐');return buildCartLine(dish!,line.quantity,line.options||{});});
  const total=items.reduce((n:number,i:any)=>n+Math.round(i.price*100)*i.quantity,0);const id=crypto.randomUUID();const note=str(body.note,200);
  try{await env.DB.prepare("INSERT INTO orders(id,user_id,nickname,items,total,note,status,created_at,request_id) VALUES(?,?,?,?,?,?,'pending',?,?)").bind(id,user!.id,user!.nickname,JSON.stringify(items),total,note,new Date().toISOString(),requestId).run();}catch(e){const duplicate=await env.DB.prepare('SELECT id FROM orders WHERE request_id=? AND user_id=?').bind(requestId,user!.id).first<any>();if(duplicate)return json({id:duplicate.id});throw e;}
  return json({id});
 }
 if(req.method==='PATCH'&&path==='order'){
  const o=await env.DB.prepare('SELECT user_id,status FROM orders WHERE id=?').bind(str(body.id,80)).first<any>();if(!o)fail('没有找到这个订单',404);if(o.user_id!==user?.id&&!canManage)fail('不能修改别人的订单',403);
  if(body.rating!==undefined){if(o.user_id!==user?.id)fail('只能评价自己的订单',403);if(o.status!=='completed')fail('确认吃好后再评价吧');if(!Number.isInteger(body.rating)||body.rating<1||body.rating>5)fail('请选择 1–5 颗星');await env.DB.prepare('UPDATE orders SET rating=?,review=? WHERE id=?').bind(body.rating,str(body.review,500),body.id).run();}
  else {const transitions:Record<string,string>={pending:'cooking',cooking:'ready',ready:'completed'};if(body.status!=='completed'&&(!canManage||transitions[o.status]!==body.status))fail('无效的订单状态');await env.DB.prepare('UPDATE orders SET status=? WHERE id=?').bind(body.status,body.id).run();}return json({ok:true});
 }
 if(req.method==='POST'&&path==='menu'){
  if(!canManage)fail('只有店主可以编辑菜单',403);
  if(body.type==='shop'){const id=str(body.id,30);if(!defaultShops.some(s=>s.id===id))fail('小店不存在');const image=await resolvePhoto(str(body.image,240000),'shop-'+id);if(!imageValid(image))fail('请上传图片或填写有效的 HTTPS 图片地址');await env.DB.prepare('INSERT INTO overrides(id,data) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').bind('shop-'+id,JSON.stringify({image})).run();return json({ok:true});}
  const d=body.dish;if(!d||!defaultShops.some(s=>s.id===d.shop))fail('请选择有效的小店');const id=str(d.id,60)||'dish-'+crypto.randomUUID();if(!/^[a-z0-9-]+$/.test(id))fail('菜品编号无效');if(retiredDishIds.has(id))fail('这款已从菜单移除，请新建菜品');
  const name=str(d.name,30),category=str(d.category,20),description=str(d.description,300),image=await resolvePhoto(str(d.image,240000),id);if(!name||!category||!description)fail('请填写名称、分类和简介');if(!Number.isFinite(d.price)||d.price<0||d.price>9999)fail('价格需在 0–9999 之间');if(!imageValid(image))fail('请上传图片或填写有效的 HTTPS 图片地址');
  if(!Array.isArray(d.ingredients)||d.ingredients.length>30)fail('配料过多');const options:Record<string,string[]>={};if(d.options&&typeof d.options==='object'){for(const [key,values] of Object.entries(d.options).slice(0,8)){if(!Array.isArray(values)||!values.length||values.length>12)fail('口味选项不正确');options[str(key,20)]=(values as unknown[]).map(v=>str(v,20)).filter(Boolean);if(!options[str(key,20)].length)fail('口味选项不能为空');}}
  const clean:Dish={id,shop:d.shop,name,category,description,image,price:Math.round(d.price*100)/100,ingredients:d.ingredients.map((v:any)=>str(v,30)).filter(Boolean),tag:str(d.tag,15),available:d.available!==false,options};
  await env.DB.prepare('INSERT INTO overrides(id,data) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').bind(id,JSON.stringify({...clean,catalogRevision:2})).run();return json({ok:true});
 }
 return json({error:'没有找到这个操作'},404);
 }catch(e:any){if(!e.status)console.error('Shop API:',e);return json({error:e.status?e.message:(e.message?.includes('份数')||e.message?.includes('口味')?e.message:'暂时没能完成，请稍后再试')},e.status||400);}}
export const GET=handle;export const POST=handle;export const PATCH=handle;export const OPTIONS=handle;
