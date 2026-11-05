export type OrderMailConfig={EMAILJS_SERVICE_ID?:string;EMAILJS_TEMPLATE_ID?:string;EMAILJS_PUBLIC_KEY?:string;EMAILJS_PRIVATE_KEY?:string;ORDER_MAIL_FROM?:string;ORDER_MAIL_TUNTUN_TO?:string};
type MailItem={shop:string;name:string;quantity:number;options:Record<string,string>};
type MailOrder={id:string;nickname:string;items:MailItem[];total:number;note:string;created_at:string};
const address=/^[^\s<>@\r\n]+@[^\s<>@\r\n]+\.[^\s<>@\r\n]+$/;
export const hasKitchenItems=(items:MailItem[])=>items.some(item=>item.shop==='tuntun');
export function mailConfigured(config:OrderMailConfig){return !!(config.EMAILJS_SERVICE_ID&&config.EMAILJS_TEMPLATE_ID&&config.EMAILJS_PUBLIC_KEY&&config.EMAILJS_PRIVATE_KEY&&config.ORDER_MAIL_FROM&&address.test(config.ORDER_MAIL_FROM)&&config.ORDER_MAIL_FROM.endsWith('@163.com')&&config.ORDER_MAIL_TUNTUN_TO&&address.test(config.ORDER_MAIL_TUNTUN_TO));}
export function orderMailParams(order:MailOrder,config:OrderMailConfig){
 const orderNumber=order.id.slice(-6).toUpperCase();
 const lines=order.items.map(item=>`【${item.shop==='tuntun'?'屯屯小厨房':'菲菲饮品店'}】${item.name} × ${item.quantity}${Object.values(item.options||{}).length?'（'+Object.values(item.options).join(' / ')+'）':''}`);
 const time=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',dateStyle:'medium',timeStyle:'short',hour12:false}).format(new Date(order.created_at));
 return {from_name:'两人一起 · 屯屯小厨房',from_email:config.ORDER_MAIL_FROM,to_email:config.ORDER_MAIL_TUNTUN_TO,subject:`屯屯小厨房来新订单啦 · ${orderNumber}`,order_id:order.id,order_number:orderNumber,nickname:order.nickname,ordered_at:time,order_summary:lines.join('\n'),order_note:order.note||'没有特别留言',order_total:`¥${(order.total/100).toFixed(2)}`,manage_url:'https://feifei-tuntun-table.wudi0971.chatgpt.site/manage?look=cute'};
}

async function sendMail(config:OrderMailConfig,params:ReturnType<typeof orderMailParams>,send:typeof fetch){
 let response:Response;
 try{response=await send('https://api.emailjs.com/api/v1.0/email/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({service_id:config.EMAILJS_SERVICE_ID,template_id:config.EMAILJS_TEMPLATE_ID,user_id:config.EMAILJS_PUBLIC_KEY,accessToken:config.EMAILJS_PRIVATE_KEY,template_params:params}),signal:AbortSignal.timeout(10000)});}
 catch{return {status:'unknown',error:'delivery_unconfirmed'};}
 return response.ok?{status:'sent',error:''}:{status:'failed',error:'provider_http_'+response.status};
}
export async function testKitchenEmail(config:OrderMailConfig){
 if(!mailConfigured(config))return {status:'failed',error:'configuration_missing'};
 const params=orderMailParams({id:'mail-test',nickname:'邮箱连接测试',items:[{shop:'tuntun',name:'测试提醒（不是真实订单）',quantity:1,options:{}}],total:0,note:'这是一封连接测试邮件，不会创建订单，也不需要制作餐品。',created_at:new Date().toISOString()},config);
 params.subject='[测试邮件] 屯屯小厨房订单提醒';return sendMail(config,params,fetch);
}

// Only the successful order-insert path schedules this job. The database claim
// also protects it from concurrent execution. Unknown delivery is not retried
// automatically: the provider may have accepted it before the connection failed.
export async function deliverKitchenEmail(db:D1Database,config:OrderMailConfig,id:string,send:typeof fetch=fetch){
 if(!mailConfigured(config))return;
 const claim=await db.prepare("UPDATE orders SET email_status='sending',email_attempts=email_attempts+1,email_error='' WHERE id=? AND email_status='pending'").bind(id).run();
 if(claim.meta.changes!==1)return;
 try{
  const record=await db.prepare('SELECT id,nickname,items,total,note,created_at FROM orders WHERE id=?').bind(id).first<Omit<MailOrder,'items'>&{items:string}>();
  if(!record)throw Error('order_missing');
  const order={...record,items:JSON.parse(record.items) as MailItem[]};
  if(!hasKitchenItems(order.items)){await db.prepare("UPDATE orders SET email_status='not_required' WHERE id=?").bind(id).run();return;}
  const result=await sendMail(config,orderMailParams(order,config),send);
  // Never persist provider response bodies: they can contain account details.
  if(result.status!=='sent'){await db.prepare('UPDATE orders SET email_status=?,email_error=? WHERE id=?').bind(result.status,result.error,id).run();return;}
  await db.prepare("UPDATE orders SET email_status='sent',email_sent_at=?,email_error='' WHERE id=?").bind(new Date().toISOString(),id).run();
 }catch{await db.prepare("UPDATE orders SET email_status='failed',email_error='notification_processing_failed' WHERE id=?").bind(id).run();}
}
