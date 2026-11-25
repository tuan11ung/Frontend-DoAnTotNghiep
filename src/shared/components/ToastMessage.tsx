'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';

/** Transient action feedback; validation and persistent instructions stay inline. */
export function ToastMessage({ message, onDismiss, tone = 'success', durationMs = 4000 }: {
  durationMs?: number; message?: string | null; onDismiss?: () => void; tone?: 'success' | 'info' | 'warning';
}) {
  return message ? <Toast key={message} message={message} onDismiss={onDismiss} tone={tone} durationMs={durationMs}/> : null;
}
function Toast({message,onDismiss,tone,durationMs}:{durationMs:number;message:string;onDismiss?:()=>void;tone:'success'|'info'|'warning'}) {
  const [target,setTarget]=useState<HTMLElement|null>(null);
  const [dismissed,setDismissed]=useState(false);
  const anchor=useCallback((element:HTMLSpanElement|null)=>{
    if(!element)return;
    // A modal dialog is in the browser top layer. Its notices must be inside it.
    const dialog=element.closest('dialog');
    let region=dialog ? dialog.querySelector<HTMLElement>('[data-toast-region]') : document.getElementById('toast-region');
    if(!region){
      region=document.createElement('div');
      region.className='pointer-events-none fixed top-6 right-6 z-[9999] flex max-h-[calc(100dvh-3rem)] w-[min(26rem,calc(100vw-3rem))] flex-col gap-3 overflow-y-auto print:hidden';
      region.dataset.toastRegion='';
      if(!dialog)region.id='toast-region';
      (dialog || document.body).append(region);
    }
    setTarget(region);
  },[]);
  const dismiss=useRef(onDismiss);
  useEffect(()=>{dismiss.current=onDismiss;},[onDismiss]);
  useEffect(()=>{
    const timer=setTimeout(()=>{setDismissed(true);dismiss.current?.();},durationMs);
    return ()=>clearTimeout(timer);
  },[durationMs]);
  const Icon=tone==='success'?CheckCircle2:tone==='warning'?CircleAlert:Info;
  return <><span hidden ref={anchor}/>{target && !dismissed && createPortal(
    <>
      <style>{`@keyframes toast-message-feedback {
        0% { opacity: 0; transform: translateY(-.5rem); }
        6%, 90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-.25rem); }
      }`}</style>
      <div role="status" style={{animationDuration: `${durationMs}ms`}} className={'pointer-events-auto flex shrink-0 animate-[toast-message-feedback_4s_ease_both] items-start gap-3 rounded-xl border bg-white p-4 text-sm shadow-xl motion-reduce:animate-none '+(tone==='success'?'border-emerald-200 text-emerald-900':tone==='warning'?'border-amber-200 text-amber-900':'border-blue-200 text-blue-900')}>
        <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0"/><p className="min-w-0 flex-1 whitespace-pre-line break-words leading-6">{message}</p>
        <button type="button" aria-label="Đóng thông báo" className="shrink-0 rounded-lg p-1 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600" onClick={()=>{setDismissed(true);onDismiss?.();}}><X aria-hidden="true" className="size-4"/></button>
      </div>
    </>,target)}</>;
}
