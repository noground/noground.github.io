const service=process.env.NEXT_PUBLIC_ORDER_API_ORIGIN||'https://feifei-tuntun-table.wudi0971.chatgpt.site';
const tokenKey='ft-github-nickname-session';
let memoryToken:string|undefined;
export const isGithubSite=()=>typeof window!=='undefined'&&window.location.hostname==='noground.github.io';
export async function menuSnapshot(){
 const response=await fetch('/menu-snapshot.json',{cache:'no-store',signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('菜单副本暂时无法读取');
 const data:any=await response.json();
 if(!Array.isArray(data.shops)||!Array.isArray(data.dishes)||!data.content)throw new Error('菜单副本不完整');
 return {...data,user:null,canManage:false};
}
function token(){try{return localStorage.getItem(tokenKey)||memoryToken;}catch{return memoryToken;}}
function saveToken(value?:string){memoryToken=value;try{if(value)localStorage.setItem(tokenKey,value);else localStorage.removeItem(tokenKey);}catch{}}
function linkedPhotos(value:any):any{
 if(typeof value==='string'&&value.startsWith('/api/photo/'))return service+value;
 if(Array.isArray(value))return value.map(linkedPhotos);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,linkedPhotos(item)]));
 return value;
}
export async function api(path:string,body?:unknown,method='POST'):Promise<any>{
 const remote=isGithubSite();let response:Response;
 try{
  // Plain text POST is a CORS simple request, avoiding third-party cookies and
  // preflight dependencies. Session tokens travel in the HTTPS body, never URLs.
  response=remote?await fetch(service+'/api/github',{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain'},signal:AbortSignal.timeout(15000),body:JSON.stringify({path,method:body===undefined?'GET':method,body,token:token()})}):await fetch('/api/'+path,body===undefined?{cache:'no-store'}:{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 }catch{throw new Error('暂时连接不到小店，请检查网络后重试；昵称和订单需要联网才能保存。');}
 let data:any;try{data=await response.json();}catch{throw new Error('小店后台暂时无法访问，请稍后重试或换个网络。');}
 if(!response.ok){if(remote&&response.status===401)saveToken();throw new Error(data.error||'暂时没能完成，请再试一次');}
 if(remote){if(path==='auth'){saveToken(data.token);delete data.token;}if(path==='logout')saveToken();return linkedPhotos(data);}
 return data;
}
