export type MailShop='tuntun'|'feifei';
export type OrderMailConfig={EMAILJS_SERVICE_ID?:string;EMAILJS_TEMPLATE_ID?:string;EMAILJS_PUBLIC_KEY?:string;EMAILJS_PRIVATE_KEY?:string;ORDER_MAIL_FROM?:string;ORDER_MAIL_TUNTUN_TO?:string;ORDER_MAIL_FEIFEI_TO?:string};
type MailItem={shop:string;name:string;price:number;quantity:number;options:Record<string,string>};
type MailOrder={id:string;nickname:string;items:MailItem[];total:number;note:string;created_at:string};
export const mailShops:MailShop[]=['tuntun','feifei'];
const names={tuntun:'屯屯小厨房',feifei:'菲菲饮品店'};
const columns={tuntun:{status:'email_status',attempts:'email_attempts',error:'email_error',sent:'email_sent_at'},feifei:{status:'feifei_email_status',attempts:'feifei_email_attempts',error:'feifei_email_error',sent:'feifei_email_sent_at'}};
const address=/^[^\s<>@\r\n]+@[^\s<>@\r\n]+\.[^\s<>@\r\n]+$/;
const recipient=(config:OrderMailConfig,shop:MailShop)=>shop==='tuntun'?config.ORDER_MAIL_TUNTUN_TO:config.ORDER_MAIL_FEIFEI_TO;
export function mailConfigured(config:OrderMailConfig,shop:MailShop='tuntun'){const to=recipient(config,shop);return !!(config.EMAILJS_SERVICE_ID&&config.EMAILJS_TEMPLATE_ID&&config.EMAILJS_PUBLIC_KEY&&config.EMAILJS_PRIVATE_KEY&&config.ORDER_MAIL_FROM&&address.test(config.ORDER_MAIL_FROM)&&config.ORDER_MAIL_FROM.endsWith('@163.com')&&to&&address.test(to));}
export function orderMailStatus(items:MailItem[],config:OrderMailConfig,shop:MailShop){return items.some(item=>item.shop===shop)?mailConfigured(config,shop)?'pending':'not_configured':'not_required';}
export function orderMailParams(order:MailOrder,config:OrderMailConfig,shop:MailShop='tuntun'){
 const items=order.items.filter(item=>item.shop===shop),orderNumber=order.id.slice(-6).toUpperCase();
 const lines=items.map(item=>`${item.name} × ${item.quantity}${Object.values(item.options||{}).length?'（'+Object.values(item.options).join(' / ')+'）':''}`);
 const time=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',dateStyle:'medium',timeStyle:'short',hour12:false}).format(new Date(order.created_at));
 const total=items.reduce((sum,item)=>sum+Math.round(item.price*100)*item.quantity,0);
 return {shop_name:names[shop],from_name:'两人一起 · '+names[shop],from_email:config.ORDER_MAIL_FROM,to_email:recipient(config,shop),subject:`${names[shop]}来新订单啦 · ${orderNumber}`,order_id:order.id,order_number:orderNumber,nickname:order.nickname,ordered_at:time,order_summary:lines.join('\n'),order_note:order.note||'没有特别留言',order_total:`¥${(total/100).toFixed(2)}`,manage_url:'https://feifei-tuntun-table.wudi0971.chatgpt.site/manage?look=cute'};
}
async function sendMail(config:OrderMailConfig,params:ReturnType<typeof orderMailParams>,send:typeof fetch){
 let response:Response;
 try{response=await send('https://api.emailjs.com/api/v1.0/email/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({service_id:config.EMAILJS_SERVICE_ID,template_id:config.EMAILJS_TEMPLATE_ID,user_id:config.EMAILJS_PUBLIC_KEY,accessToken:config.EMAILJS_PRIVATE_KEY,template_params:params}),signal:AbortSignal.timeout(10000)});}
 catch{return {status:'unknown',error:'delivery_unconfirmed'};}
 return response.ok?{status:'sent',error:''}:{status:'failed',error:'provider_http_'+response.status};
}
export async function testShopEmail(config:OrderMailConfig,shop:MailShop='tuntun'){
 if(!mailConfigured(config,shop))return {status:'failed',error:'configuration_missing'};
 const params=orderMailParams({id:'mail-test-'+shop,nickname:'邮箱连接测试',items:[{shop,name:shop==='feifei'?'饮品店测试提醒（不是真实订单）':'小厨房测试提醒（不是真实订单）',price:0,quantity:1,options:{}}],total:0,note:'这是一封连接测试邮件，不会创建订单，也不需要制作餐品。',created_at:new Date().toISOString()},config,shop);
 params.subject=`[测试邮件] ${names[shop]}订单提醒`;return sendMail(config,params,fetch);
}
// Each shop claims its own status so one failed delivery cannot resend the other.
export async function deliverShopEmail(db:D1Database,config:OrderMailConfig,id:string,shop:MailShop,send:typeof fetch=fetch){
 if(!mailConfigured(config,shop))return;
 const c=columns[shop];
 const claim=await db.prepare(`UPDATE orders SET ${c.status}='sending',${c.attempts}=${c.attempts}+1,${c.error}='' WHERE id=? AND ${c.status}='pending'`).bind(id).run();
 if(claim.meta.changes!==1)return;
 try{
  const record=await db.prepare('SELECT id,nickname,items,total,note,created_at FROM orders WHERE id=?').bind(id).first<Omit<MailOrder,'items'>&{items:string}>();
  if(!record)throw Error('order_missing');
  const order={...record,items:JSON.parse(record.items) as MailItem[]};
  if(!order.items.some(item=>item.shop===shop)){await db.prepare(`UPDATE orders SET ${c.status}='not_required' WHERE id=?`).bind(id).run();return;}
  // Reserve shared slots: EmailJS permits one request per second, including the
  // two messages in a mixed order. Bound waiting to fit a Worker background job.
  const slot=await db.prepare("INSERT INTO limits(key,attempts,reset) VALUES('order-mail-send',0,?) ON CONFLICT(key) DO UPDATE SET reset=MAX(limits.reset+1200,excluded.reset) RETURNING reset").bind(Date.now()).first<{reset:number}>();
  const wait=Math.max(0,(slot?.reset??Date.now())-Date.now());
  if(wait>15000){await db.prepare(`UPDATE orders SET ${c.status}='failed',${c.error}='mail_queue_busy' WHERE id=?`).bind(id).run();return;}
  if(wait)await new Promise(resolve=>setTimeout(resolve,wait));
  const result=await sendMail(config,orderMailParams(order,config,shop),send);
  if(result.status!=='sent'){await db.prepare(`UPDATE orders SET ${c.status}=?,${c.error}=? WHERE id=?`).bind(result.status,result.error,id).run();return;}
  await db.prepare(`UPDATE orders SET ${c.status}='sent',${c.sent}=?,${c.error}='' WHERE id=?`).bind(new Date().toISOString(),id).run();
 }catch{await db.prepare(`UPDATE orders SET ${c.status}='failed',${c.error}='notification_processing_failed' WHERE id=?`).bind(id).run();}
}
export async function deliverOrderEmails(db:D1Database,config:OrderMailConfig,id:string){const results=await Promise.allSettled(mailShops.map(shop=>deliverShopEmail(db,config,id,shop)));if(results.some(result=>result.status==='rejected'))console.error('Order email notification failed');}
