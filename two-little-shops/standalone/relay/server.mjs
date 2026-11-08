import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';

const visitorOrigin='https://noground.github.io';
const upstream='https://two-little-shops.wudi09711-shops.workers.dev/api/github';
const photoOrigin=new URL(upstream).origin;
const maxBodyBytes=300000;

export function createRelay(send=fetch){
 return createServer(async(request,response)=>{
  const headers={
   'Cache-Control':'no-store',
   'Content-Type':'application/json; charset=utf-8',
   'X-Content-Type-Options':'nosniff',
   'Vary':'Origin'
  };
  const reply=(status,data)=>{
   response.writeHead(status,headers);
   response.end(JSON.stringify(data));
  };
  if(request.url==='/health'&&request.method==='GET')return reply(200,{service:'two-little-shops-relay'});
  if(request.method==='GET'&&/^\/api\/photo\/[a-z0-9-]+$/.test(request.url||'')){
   try{
    const picture=await send(photoOrigin+request.url,{method:'GET',signal:AbortSignal.timeout(20000),redirect:'error'});
    if(picture.status===404)return reply(404,{error:'图片不存在'});
    const type=picture.headers.get('content-type')?.split(';')[0];
    if(!picture.ok||!['image/jpeg','image/png','image/webp'].includes(type))return reply(502,{error:'图片暂时无法读取'});
    const bytes=await picture.arrayBuffer();
    response.writeHead(200,{...headers,'Content-Type':type,'Cache-Control':'no-cache'});
    return response.end(Buffer.from(bytes));
   }catch{return reply(502,{error:'图片暂时无法读取'});}
  }
  if(request.url!=='/api/github')return reply(404,{error:'没有找到这个操作'});
  if(request.headers.origin!==visitorOrigin)return reply(403,{error:'请从点餐页操作'});
  headers['Access-Control-Allow-Origin']=visitorOrigin;
  if(request.method==='OPTIONS'){
   response.writeHead(204,{...headers,'Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'Content-Type'});
   return response.end();
  }
  if(request.method!=='POST')return reply(405,{error:'请从点餐页提交'});
  if(Number(request.headers['content-length']||0)>maxBodyBytes)return reply(413,{error:'提交内容太大'});
  try{
   const chunks=[];let bytes=0;
   for await(const chunk of request){
    bytes+=chunk.length;
    if(bytes>maxBodyBytes){reply(413,{error:'提交内容太大'});request.resume();return;}
    chunks.push(chunk);
   }
   const result=await send(upstream,{
    method:'POST',
    headers:{Origin:visitorOrigin,'Content-Type':'text/plain'},
    body:Buffer.concat(chunks),
    signal:AbortSignal.timeout(20000),
    redirect:'error'
   });
   if(!result.headers.get('content-type')?.includes('application/json'))return reply(502,{error:'小店后台暂时无法访问，请稍后重试'});
   const body=await result.arrayBuffer();
   response.writeHead(result.status,headers);
   response.end(Buffer.from(body));
  }catch{
   if(!response.headersSent)reply(502,{error:'暂时连接不到小店后台，请稍后重试'});
  }
 });
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const server=createRelay();
 server.requestTimeout=30000;
 server.listen(Number(process.env.PORT)||10000,'0.0.0.0',()=>console.log('Ordering relay ready'));
}
