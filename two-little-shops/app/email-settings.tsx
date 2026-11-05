'use client';
import {useEffect,useState} from 'react';
import {Mail,CheckCircle2,LoaderCircle} from 'lucide-react';
import {api} from './shop-api';
export function EmailSettings({notify}:{notify:(message:string)=>void}){
 const [settings,setSettings]=useState<{enabled:boolean;from:string;to:string}|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function load(){try{setSettings(await api('mail-settings'));setError('');}catch(e:any){setError(e.message);}}
 useEffect(()=>{load();},[]);
 async function test(){setBusy(true);try{await api('mail-test',{});notify('测试邮件已交给发信服务，请查看收件箱（也可看看垃圾邮件）。');}catch(e:any){setError(e.message);}finally{setBusy(false);}}
 return <section className="email-settings"><p className="eyebrow"><Mail size={15}/> 新订单，记得告诉屯屯</p><h2>屯屯小厨房 · 邮件提醒</h2><p>订单里只要包含小厨房的菜品，就发送一封提醒；两家一起点也会提醒。</p><div className="email-settings-state">{settings?.enabled?<><CheckCircle2 size={17}/> 邮件服务已连接</>:settings?'还未连接邮件服务，暂时不会发信':<><LoaderCircle size={16} className="spin"/> 正在检查连接…</>}</div>{settings?.from&&<p>发件邮箱：{settings.from}</p>}{settings?.to&&<p>收件邮箱：{settings.to}</p>}<p className="email-settings-note">邮件包含昵称、餐品、份数、口味、留言和订单编号。发信失败不会影响订单保存。</p>{error&&<p role="alert" className="field-error">{error}</p>}<div className="email-settings-actions"><button className="primary small" onClick={test} disabled={!settings?.enabled||busy}>{busy?<LoaderCircle size={15} className="spin"/>:<Mail size={15}/>} 发一封测试邮件</button><button className="text-button" onClick={load} disabled={busy}>重新检查连接</button></div></section>;
}
