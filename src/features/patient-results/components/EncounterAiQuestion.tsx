'use client';
import { ToastMessage } from '@/src/shared/components/ToastMessage';
import { useEffect, useRef, useState } from 'react';
import type { ResultEncounter } from '../models/types/patient-results.types';

/** Keep clinical context in this component's memory; no external transmission without an API. */
export function EncounterAiQuestion({encounter}:{encounter:ResultEncounter}) {
  const [open,setOpen]=useState(false);
  return <><button type="button" className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700" onClick={()=>setOpen(true)}>Hỏi trợ lý AI về kết quả này</button>
    {open && <QuestionDialog encounter={encounter} onClose={()=>setOpen(false)}/>}</>;
}
function QuestionDialog({encounter,onClose}:{encounter:ResultEncounter;onClose:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null);
  const [question,setQuestion]=useState('Tôi cần hỏi bác sĩ những gì để hiểu rõ kết quả phiên khám này?');
  const [notice,setNotice]=useState('');
  const context=[encounter.facilityName, 'Chẩn đoán: '+(encounter.record?.diagnoses?.map(d=>[d.code,d.name].filter(Boolean).join(' ')).join('; ') || 'Chưa cung cấp'),'Kết luận: '+(encounter.record?.conclusion || 'Chưa cung cấp')].join('\n');
  useEffect(()=>{const dialog=ref.current;dialog?.showModal();return ()=>dialog?.close();},[]);
  return <dialog ref={ref} onCancel={e=>{e.preventDefault();onClose();}} aria-labelledby="encounter-ai-title" className="m-auto max-h-[85svh] w-[calc(100%-2rem)] max-w-xl overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl backdrop:bg-slate-950/50">
    <div className="flex items-start justify-between gap-3"><h2 id="encounter-ai-title" className="font-bold">Hỏi về kết quả phiên khám</h2><button aria-label="Đóng câu hỏi AI" onClick={onClose}>Đóng</button></div>
    <p className="my-3 text-sm text-slate-600">Trợ lý AI chưa được kết nối. Bạn có thể chuẩn bị và sao chép câu hỏi để trao đổi với bác sĩ; thông tin không được gửi đi.</p>
    <pre className="whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 text-xs">{context}</pre>
    <label className="mt-3 block text-sm">Câu hỏi<textarea className="mt-2 w-full rounded-lg border p-3" rows={3} maxLength={2000} value={question} onChange={e=>setQuestion(e.target.value)}/></label>
    <button disabled={!question.trim()} className="mt-3 rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50" onClick={async()=>{try{await navigator.clipboard.writeText(context+'\n\n'+question.trim());setNotice('Đã sao chép câu hỏi kèm kết quả.');}catch{setNotice('Không thể sao chép tự động. Vui lòng chọn và sao chép nội dung.');}}}>Sao chép câu hỏi</button><ToastMessage message={notice} tone="info" onDismiss={()=>setNotice("")}/>
  </dialog>;
}
