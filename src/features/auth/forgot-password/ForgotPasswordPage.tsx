'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AuthContinuationLink, BookingContinuationNotice } from '../components/AuthContinuation';
import { resetEmailError, resetPasswordErrors } from './reset-demo';
const field='mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm';
const button='rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50';
async function request(endpoint: string, body: object) {
  const response=await fetch('/api/auth/'+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
  const result=await response.json().catch(()=>null);
  if(!response.ok || !result?.success) throw new Error(result?.message || 'Không thể xử lý yêu cầu. Vui lòng thử lại.');
  return result.data as {resendAfter?:number};
}
export function ForgotPasswordPage(){
  const [email,setEmail]=useState(''); const [submitted,setSubmitted]=useState('');
  const [otp,setOtp]=useState(''); const [password,setPassword]=useState(''); const [confirmation,setConfirmation]=useState('');
  const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [notice,setNotice]=useState('');
  const [success,setSuccess]=useState(false); const [remaining,setRemaining]=useState(0); const lock=useRef(false);
  useEffect(()=>{if(remaining<=0)return;const timer=setTimeout(()=>setRemaining(v=>Math.max(0,v-1)),1000);return()=>clearTimeout(timer);},[remaining]);
  async function send(event?:FormEvent){
    event?.preventDefault();if(lock.current || remaining>0)return;
    const value=submitted || email.trim(); const validation=resetEmailError(value);if(validation){setError(validation);return;}
    lock.current=true;setBusy(true);setError('');setNotice('');
    try{const result=await request('forgot-password',{email:value});setSubmitted(value);setOtp('');setRemaining(result.resendAfter??60);setNotice('Nếu email thuộc tài khoản đang hoạt động, mã khôi phục đã được gửi. Vui lòng kiểm tra hộp thư.');}
    catch(e){setError(e instanceof Error?e.message:'Không gửi được yêu cầu.');}
    finally{lock.current=false;setBusy(false);}
  }
  async function reset(event:FormEvent){
    event.preventDefault();if(lock.current)return;
    if(!/^[0-9]{6}$/.test(otp)){setError('Vui lòng nhập đủ 6 chữ số OTP.');return;}
    const validation=resetPasswordErrors({password,confirmation});if(Object.keys(validation).length){setError(Object.values(validation)[0]);return;}
    lock.current=true;setBusy(true);setError('');
    try{await request('reset-password',{email:submitted,otp,password});setOtp('');setPassword('');setConfirmation('');setSuccess(true);}
    catch(e){setError(e instanceof Error?e.message:'Không thể đặt lại mật khẩu.');}
    finally{lock.current=false;setBusy(false);}
  }
  return <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-10"><div className="w-full max-w-md space-y-5 rounded-2xl border bg-white p-6 shadow-sm sm:p-8"><h1 className="text-2xl font-extrabold text-slate-900">{success?'Đặt lại mật khẩu thành công':'Khôi phục mật khẩu'}</h1><BookingContinuationNotice/>
    {error&&<p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {success?<><p role="status" className="text-sm leading-7">Mật khẩu đã được cập nhật. Các phiên đăng nhập cũ đã kết thúc; hãy đăng nhập bằng mật khẩu mới.</p><AuthContinuationLink page="login" className={button}>Quay lại đăng nhập</AuthContinuationLink></>:<>{notice&&<p role="status" className="rounded-lg bg-blue-50 p-3 text-sm leading-6 text-blue-800">{notice}</p>}{!submitted?<form onSubmit={send} className="space-y-5"><label className="block text-sm font-semibold">Email đã đăng ký<input required type="email" autoComplete="email" maxLength={254} className={field} value={email} onChange={e=>setEmail(e.target.value)}/></label><button type="submit" disabled={busy} className={button}>{busy?'Đang gửi…':'Gửi mã khôi phục'}</button></form>:<form onSubmit={reset} className="space-y-4"><p className="break-all text-sm text-slate-600">Email: {submitted}</p><fieldset disabled={busy} className="space-y-4"><label className="block text-sm font-semibold">Mã OTP<input required type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} className={field} value={otp} onChange={e=>setOtp(e.target.value.replace(/[^0-9]/g,''))}/></label><label className="block text-sm font-semibold">Mật khẩu mới<input required type="password" autoComplete="new-password" minLength={8} maxLength={255} className={field} value={password} onChange={e=>setPassword(e.target.value)}/></label><label className="block text-sm font-semibold">Nhập lại mật khẩu mới<input required type="password" autoComplete="new-password" maxLength={255} className={field} value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></label><p className="text-xs text-slate-500">Từ 8 ký tự, có chữ và số. Mã chỉ sử dụng một lần.</p><button type="submit" className={button}>{busy?'Đang cập nhật…':'Xác nhận mật khẩu mới'}</button></fieldset><div className="flex flex-wrap gap-4 text-sm font-semibold text-blue-700"><button type="button" disabled={busy||remaining>0} onClick={()=>void send()}>Gửi lại mã{remaining>0?' ('+remaining+'s)':''}</button><button type="button" disabled={busy} onClick={()=>{setSubmitted('');setOtp('');setRemaining(0);setError('');setNotice('');}}>Đổi email</button></div></form>}<AuthContinuationLink page="login" className="inline-block text-sm font-semibold text-blue-700">← Quay lại đăng nhập</AuthContinuationLink></>}
  </div></section>;
}
