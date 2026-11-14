'use client';
import { ShieldCheck } from 'lucide-react';
import { MedicalHistoryAccessLive } from './MedicalHistoryAccessLive';

export function MedicalHistoryAccess({ patientId }: { patientId: number }) {
  return <section id="history-access" aria-labelledby="history-access-heading" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:px-6"><span className="rounded-xl bg-teal-50 p-2.5 text-teal-700"><ShieldCheck className="size-5" /></span><div><h2 id="history-access-heading" className="font-bold text-slate-900">Quyền truy cập bệnh sử</h2><p className="mt-1 text-xs leading-5 text-slate-500">Theo dõi quyền và các phiên khám bác sĩ đã xem.</p></div></div>
    {<MedicalHistoryAccessLive key={patientId} patientId={patientId} />}
  </section>;
}
