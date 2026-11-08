import assert from 'node:assert/strict';
import {api,menuSnapshot} from '../app/shop-api.ts';
const saved=new Map();globalThis.window={location:{hostname:'noground.github.io'}};
globalThis.localStorage={getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value),removeItem:key=>saved.delete(key)};
const session='nickname.'+'12345678-1234-1234-1234-123456789abc'.repeat(2);let expected;
globalThis.fetch=async(url,options)=>{
 assert.equal(url,'https://feifei-tuntun-table.wudi0971.chatgpt.site/api/github');assert.equal(options.credentials,'omit');assert.equal(options.headers['Content-Type'],'text/plain');assert.equal(options.method,'POST');
 const message=JSON.parse(options.body);assert.equal(message.path,expected.path);assert.equal(message.method,expected.method);assert.equal(message.token,expected.token);
 return Response.json(expected.result, {status:expected.status||200});
};
expected={path:'auth',method:'POST',result:{user:{nickname:'小猫',role:'guest'},token:session}};const auth=await api('auth',{nickname:'小猫'});assert.equal(auth.token,undefined);assert.equal(auth.user.nickname,'小猫');
expected={path:'boot',method:'GET',token:session,result:{user:auth.user,dishes:[{image:'/api/photo/a'}]}};assert.equal((await api('boot')).dishes[0].image,'https://feifei-tuntun-table.wudi0971.chatgpt.site/api/photo/a');
expected={path:'order',method:'PATCH',token:session,result:{ok:true}};await api('order',{id:'order',rating:5},'PATCH');
expected={path:'logout',method:'POST',token:session,result:{ok:true}};await api('logout',{});
expected={path:'boot',method:'GET',result:{user:null}};await api('boot');
globalThis.fetch=async()=>{throw Error('offline');};await assert.rejects(api('boot'),/连接不到小店/);
console.log('PASS: cross-site nickname session, reload/order/logout transport, remote photo URLs, no third-party cookies or URL tokens, and network errors.');

globalThis.fetch=async(url,options)=>{assert.equal(url,'/menu-snapshot.json');assert.equal(options.cache,'no-store');return Response.json({shops:[],dishes:[{image:'/menu-photos/test.jpg'}],content:{},user:{nickname:'unexpected'},canManage:true});};
const snapshot=await menuSnapshot();assert.equal(snapshot.user,null);assert.equal(snapshot.canManage,false);assert.equal(snapshot.dishes[0].image,'/menu-photos/test.jpg');
console.log('PASS: independent static menu loading and visitor-only snapshot state.');
