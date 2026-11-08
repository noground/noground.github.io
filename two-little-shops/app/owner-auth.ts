const encoder=new TextEncoder();
function hex(bytes:ArrayBuffer){return Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');}
function fromHex(value:string){return Uint8Array.from(value.match(/../g)??[],byte=>parseInt(byte,16));}
async function signingKey(secret:string){return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function ownerSessionValid(request:Request,secret?:string){
 if(!secret)return false;
 const token=request.headers.get('cookie')?.match(/(?:^|;\s*)owner_session=([^;]+)/)?.[1]??'';
 const [expires,signature,...extra]=token.split('.');
 if(extra.length||!/^\d{13}$/.test(expires)||!/^[a-f0-9]{64}$/.test(signature??'')||Number(expires)<=Date.now())return false;
 return crypto.subtle.verify('HMAC',await signingKey(secret),fromHex(signature),encoder.encode(expires));
}
export async function ownerLogin(request:Request,password:unknown,environment:Cloudflare.Env){
 const failure=(message:string,status=400)=>Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}});
 if(!environment.OWNER_PASSWORD_HASH||!environment.OWNER_SESSION_KEY)return failure('店主登录尚未配置',503);
 if(typeof password!=='string'||password.length<12||password.length>128)return failure('店主口令不正确',401);
 const now=Date.now(),rateKey='owner-login-'+(request.headers.get('cf-connecting-ip')||'local');
 const limit=await environment.DB!.prepare("INSERT INTO limits(key,attempts,reset) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN reset<? THEN 1 ELSE attempts+1 END,reset=CASE WHEN reset<? THEN ? ELSE reset END RETURNING attempts").bind(rateKey,now+900000,now,now,now+900000).first<{attempts:number}>();
 if((limit?.attempts??0)>10)return failure('尝试较多，请 15 分钟后再试',429);
 const [salt,expected]=environment.OWNER_PASSWORD_HASH.split(':');
 if(!/^[a-f0-9]{32}$/.test(salt??'')||!/^[a-f0-9]{64}$/.test(expected??''))return failure('店主登录配置有误',503);
 const passwordKey=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
 const actual=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:fromHex(salt),iterations:100000,hash:'SHA-256'},passwordKey,256));
 const expectedBytes=fromHex(expected);let difference=0;for(let index=0;index<actual.length;index++)difference|=actual[index]^expectedBytes[index];
 if(difference)return failure('店主口令不正确',401);
 const expires=String(now+7*86400000);
 const signature=hex(await crypto.subtle.sign('HMAC',await signingKey(environment.OWNER_SESSION_KEY),encoder.encode(expires)));
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store','Set-Cookie':`owner_session=${expires}.${signature}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${new URL(request.url).protocol==='https:'?'; Secure':''}`}});
}
