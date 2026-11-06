'use client';
import {useEffect,useState} from 'react';
import {Mail,CheckCircle2,LoaderCircle} from 'lucide-react';
import {api} from './shop-api';
export function EmailSettings({notify}:{notify:(message:string)=>void}){
 const [settings,setSettings]=useState<{enabled:boolean;from:string;to:string;kitchenEnabled:boolean;feifeiTo:string;feifeiEnabled:boolean}|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState('');
 async function load(){try{setSettings(await api('mail-settings'));setError('');}catch(e:any){setError(e.message);}}
 useEffect(()=>{load();},[]);
 async function test(shop:string){setBusy(shop);setError('');try{await api('mail-test',{shop});notify('测试邮件已交给发信服务，请查看对应邮箱（也可看看垃圾邮件）。');}catch(e:any){setError(e.message);}finally{setBusy('');}}
 const targets=[{id:'feifei',name:'菲菲饮品店',to:settings?.feifeiTo,enabled:settings?.feifeiEnabled},{id:'tuntun',name:'屯屯小厨房',to:settings?.to,enabled:settings?.kitchenEnabled}];
 return <section className="email-settings"><p className="eyebrow"><Mail size={15}/> 新订单，记得告诉彼此</p><h2>两家小店 · 邮件提醒</h2><p>饮品和小厨房分别提醒；两家一起点时，各自只收到本店的餐品、份数与小计。</p><div className="email-settings-state">{settings?.enabled?<><CheckCircle2 size={17}/> 邮件服务已连接</>:settings?'还未连接邮件服务，暂时不会发信':<><LoaderCircle size={16} className="spin"/> 正在检查连接…</>}</div>{settings?.from&&<p>发件邮箱：{settings.from}</p>}{settings&&targets.map(target=><div key={target.id} className="email-target"><div><strong>{target.name}</strong><p>{target.to||'还未设置收件邮箱'} · {target.enabled?'已连接':'未连接'}</p></div><button className="primary small" onClick={()=>test(target.id)} disabled={!target.enabled||!!busy}>{busy===target.id?<LoaderCircle size={15} className="spin"/>:<Mail size={15}/>} 测试{target.id==='feifei'?'饮品店':'小厨房'}</button></div>)}<p className="email-settings-note">邮件包含昵称、本店餐品、份数、口味、留言和订单编号。两封邮件分别记录发送状态，一封失败不会撤销订单，也不会影响另一家。</p>{error&&<p role="alert" className="field-error">{error}</p>}<div className="email-settings-actions"><button className="text-button" onClick={load} disabled={!!busy}>重新检查连接</button></div></section>;
}
