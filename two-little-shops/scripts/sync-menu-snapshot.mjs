import {mkdir,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

export async function syncMenuSnapshot(source,destination,send=fetch){
 const origin=new URL(source).origin;
 const response=await send(origin+'/api/boot',{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error('Menu service returned '+response.status);
 const boot=await response.json();
 if(!Array.isArray(boot.shops)||!Array.isArray(boot.dishes)||!boot.content)throw Error('Incomplete menu');
 // Publish only the public catalog. Nicknames, orders, sessions and keys stay out.
 const catalog={shops:boot.shops,dishes:boot.dishes,content:boot.content,contentRevision:boot.contentRevision};
 const photos=new Map();
 async function copy(value){
  if(typeof value==='string'&&value.startsWith('/api/photo/')){
   if(!/^\/api\/photo\/[a-z0-9-]+$/.test(value))throw Error('Invalid photo path');
   if(!photos.has(value))photos.set(value,(async()=>{
    const picture=await send(origin+value,{signal:AbortSignal.timeout(30000)});
    const type=picture.headers.get('content-type')?.split(';')[0];
    const extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[type];
    if(!picture.ok||!extension)throw Error('Photo download failed');
    const bytes=Buffer.from(await picture.arrayBuffer());
    if(bytes.length>4000000)throw Error('Photo exceeds snapshot limit');
    return {url:'/menu-photos/'+createHash('sha256').update(bytes).digest('hex')+'.'+extension,bytes};
   })());
   return (await photos.get(value)).url;
  }
  if(Array.isArray(value))return Promise.all(value.map(copy));
  if(value&&typeof value==='object')return Object.fromEntries(await Promise.all(Object.entries(value).map(async([key,item])=>[key,await copy(item)])));
  return value;
 }
 const result=await copy(catalog);
 // Complete all downloads before replacing any published files.
 await mkdir(destination,{recursive:true});
 const photoDirectory=path.join(destination,'menu-photos');
 await rm(photoDirectory,{recursive:true,force:true});await mkdir(photoDirectory,{recursive:true});
 for(const promise of photos.values()){const photo=await promise;await writeFile(path.join(destination,photo.url),photo.bytes);}
 await writeFile(path.join(destination,'menu-snapshot.json'),JSON.stringify({...result,publishedAt:new Date().toISOString()}));
 return {dishes:result.dishes.length,photos:photos.size};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [source,destination]=process.argv.slice(2);if(!source||!destination)throw Error('Provide source origin and destination directory');
 console.log(JSON.stringify(await syncMenuSnapshot(source,destination)));
}
