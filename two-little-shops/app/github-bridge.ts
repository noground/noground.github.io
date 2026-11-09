export const GITHUB_ORIGIN='https://noground.github.io';
const nicknameToken=/^nickname\.[a-f0-9-]{72}$/;
const visitorActions=new Set(['GET boot','GET profiles','GET orders','GET order-query','POST auth','POST logout','POST orders','PATCH order']);

// The bridge accepts visitor actions only. It never forwards platform identity
// or incoming cookies, so a GitHub visitor cannot inherit a store owner's role.
export async function githubBridge(req:Request,handle:(request:Request)=>Promise<Response>):Promise<Response>{
 const origin=req.headers.get('origin');
 if(origin!==GITHUB_ORIGIN)return Response.json({error:'请从已发布的小店页面访问'}, {status:403});
 const headers={'Access-Control-Allow-Origin':GITHUB_ORIGIN,'Vary':'Origin','Cache-Control':'no-store'};
 const reply=(data:unknown,status=200)=>Response.json(data,{status,headers});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'Content-Type'}});
 if(req.method!=='POST')return reply({error:'请使用点餐页面操作'},405);
 try{
  if(Number(req.headers.get('content-length')||0)>300000)return reply({error:'提交内容太大'},413);
  const raw=await req.text();if(raw.length>300000)return reply({error:'提交内容太大'},413);
  const message=JSON.parse(raw);
  if(!message||typeof message!=='object'||Array.isArray(message))return reply({error:'提交内容有误'},400);
  const {path,method,body,token}=message;
  if(!visitorActions.has(`${method} ${path}`))return reply({error:'此入口支持点餐和订单查询'},403);
  if(token!==undefined&&(typeof token!=='string'||!nicknameToken.test(token)))return reply({error:'昵称已失效，请重新选择'},401);
  const url=new URL('/api/'+path,req.url);
  const visitorHeaders=new Headers({'Content-Type':'application/json','Origin':url.origin});
  if(token)visitorHeaders.set('Cookie','table_session='+token);
  const ip=req.headers.get('cf-connecting-ip');if(ip)visitorHeaders.set('cf-connecting-ip',ip);
  const result=await handle(new Request(url,{method,headers:visitorHeaders,...(method==='GET'?{}:{body:JSON.stringify(body??{})})}));
  const data=await result.json() as Record<string,unknown>;
  if(path==='auth'&&result.ok){
   const session=result.headers.get('set-cookie')?.match(/(?:^|;\s*)table_session=([^;]+)/)?.[1];
   if(!session||!nicknameToken.test(session))return reply({error:'暂时没能保存昵称，请重试'},500);
   data.token=session;
  }
  return reply(data,result.status);
 }catch{return reply({error:'提交内容有误，请重新操作'},400);}
}
