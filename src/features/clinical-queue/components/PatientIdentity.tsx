import Image from 'next/image';
import { Star } from 'lucide-react';
import { PATIENT_TAGS } from '../queue-options';
import type { QueuePatient } from '../types';

export function PatientIdentity({ patient, compact = false }: { patient: QueuePatient; compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {patient.avatar ? <Image alt={`Ảnh đại diện minh họa của ${patient.name}`} className="h-10 w-10 shrink-0 rounded-full object-cover" height={40} src={patient.avatar} width={40} unoptimized /> : <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${patient.gender === 'Nữ' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{patient.name.split(' ').slice(-2).map((part) => part[0]).join('')}</span>}
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-slate-900">{patient.name}</h3>
        <div className={compact ? 'mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5' : 'space-y-1 pt-1'}>
          <p className="text-xs text-slate-500">{patient.birthYear ?? 'Chưa cập nhật năm sinh'}</p>
          <p className="text-xs text-slate-500 tabular-nums">CCCD {patient.maskedCitizenId}</p>
        </div>
        {patient.tags.length > 0 && <div className={`flex flex-wrap gap-1.5 ${compact ? 'mt-1' : 'mt-2'}`}>{patient.tags.map((tag) => <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${PATIENT_TAGS[tag].className}`} key={tag}>{tag === 'priority' && <Star aria-hidden="true" className="h-2.5 w-2.5 fill-current" />}{PATIENT_TAGS[tag].label}</span>)}</div>}
      </div>
    </div>
  );
}
