'use client';
import {useState} from 'react';
import {api} from './shop-api';
export function OwnerLogin({onSuccess}:{onSuccess:()=>void}){
 const [password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 return <form className="auth-content" onSubmit={async event=>{event.preventDefault();setBusy(true);setError('');try{await api('owner-auth',{password});setPassword('');onSuccess();}catch(reason){setError(reason instanceof Error?reason.message:'登录失败，请稍后重试');}finally{setBusy(false);}}}><h3>店主登录</h3><label>管理口令<input type="password" autoComplete="current-password" required minLength={12} maxLength={128} value={password} onChange={event=>setPassword(event.target.value)}/></label>{error&&<p role="alert" className="form-error">{error}</p>}<button className="primary" disabled={busy}>{busy?'正在登录…':'进入管理页'}</button></form>;
}
