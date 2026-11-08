import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {syncMenuSnapshot} from '../scripts/sync-menu-snapshot.mjs';
const directory=await mkdtemp(path.join(tmpdir(),'menu-snapshot-'));
let photoRequests=0;
const picture=Buffer.from('image-fixture');
const boot={shops:[{image:'/api/photo/test'}],dishes:[{name:'自定义菜品',image:'/api/photo/test'}],content:{image:'/images/cinema.webp'},user:{nickname:'private'},orders:[{id:'private'}],canManage:true};
try{
 const send=async url=>{if(url.endsWith('/api/boot'))return Response.json(boot);photoRequests++;return new Response(picture,{headers:{'Content-Type':'image/jpeg'}});};
 assert.deepEqual(await syncMenuSnapshot('https://shop.example',directory,send),{dishes:1,photos:1});assert.equal(photoRequests,1);
 const original=await readFile(path.join(directory,'menu-snapshot.json'),'utf8'),snapshot=JSON.parse(original);
 assert.deepEqual(Object.keys(snapshot).sort(),['content','dishes','publishedAt','shops']);assert(!original.includes('private'));
 assert.equal(snapshot.dishes[0].image,snapshot.shops[0].image);assert(snapshot.dishes[0].image.startsWith('/menu-photos/'));assert.deepEqual(await readFile(path.join(directory,snapshot.dishes[0].image)),picture);
 await assert.rejects(syncMenuSnapshot('https://shop.example',directory,async url=>url.endsWith('/api/boot')?Response.json(boot):new Response(null,{status:503})),/Photo/);
 assert.equal(await readFile(path.join(directory,'menu-snapshot.json'),'utf8'),original);
 console.log('PASS: public menu only, local photos, duplicate downloads, complete snapshot, and failure preservation.');
}finally{await rm(directory,{recursive:true,force:true});}
