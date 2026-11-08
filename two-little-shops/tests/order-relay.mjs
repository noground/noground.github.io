import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createRelay} from '../standalone/relay/server.mjs';
let calls=0,fail=false;
const server=createRelay(async(url,options)=>{
 calls++;assert.equal(url,'https://two-little-shops.wudi09711-shops.workers.dev/api/github');assert.deepEqual(Object.keys(options.headers).sort(),['Content-Type','Origin']);assert.equal(options.headers.Origin,'https://noground.github.io');assert.equal(options.redirect,'error');
 const message=JSON.parse(options.body.toString());assert.equal(message.path,'orders');assert.equal(message.body.requestId,'local-test');
 if(fail)throw Error('Connection failure');
 return Response.json({id:'local-order'}, {headers:{'Set-Cookie':'forbidden-cookie'}});
});
server.listen(0,'127.0.0.1');await once(server,'listening');const base='http://127.0.0.1:'+server.address().port;
const headers={Origin:'https://noground.github.io','Content-Type':'text/plain',Cookie:'private-cookie','oai-authenticated-user-email':'private@example.com'};
try{
 assert.equal((await fetch(base+'/health')).status,200);
 assert.equal((await fetch(base+'/api/owner-auth',{method:'POST',headers})).status,404);
 assert.equal((await fetch(base+'/api/github',{method:'POST',headers:{Origin:'https://wrong.example'}})).status,403);assert.equal(calls,0);
 const body=JSON.stringify({path:'orders',method:'POST',body:{requestId:'local-test'}});
 const response=await fetch(base+'/api/github',{method:'POST',headers,body});assert.equal(response.status,200);assert.equal(response.headers.get('access-control-allow-origin'),'https://noground.github.io');assert.equal(response.headers.get('set-cookie'),null);assert.equal((await response.json()).id,'local-order');
 assert.equal((await fetch(base+'/api/github',{method:'POST',headers,body:'x'.repeat(300001)})).status,413);assert.equal(calls,1);
 fail=true;assert.equal((await fetch(base+'/api/github',{method:'POST',headers,body})).status,502);
 console.log('PASS: fixed upstream, exact origin, visitor route, bounded requests, isolated headers/cookies, and connection failure. No real orders sent.');
}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
