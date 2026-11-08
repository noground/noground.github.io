import {GET as handleApi} from '../app/api/[...path]/route';
export default {
 async fetch(request:Request,environment:Cloudflare.Env){
  const path=new URL(request.url).pathname;
  if(path==='/health')return Response.json({service:'two-little-shops',database:!!environment.DB});
  if(path.startsWith('/api/')){
   const headers=new Headers(request.headers);
   for(const name of [...headers.keys()])if(name.startsWith('oai-authenticated-'))headers.delete(name);
   return handleApi(new Request(request,{headers}));
  }
  return environment.ASSETS!.fetch(request);
 }
};
