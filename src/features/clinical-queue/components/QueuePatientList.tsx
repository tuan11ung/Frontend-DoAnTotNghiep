import { Clock3, SearchX } from 'lucide-react';
import type { QueuePatient } from '../types';
import { PatientIdentity } from './PatientIdentity';
import './queue-patient-list.css';

interface QueuePatientListProps {
  patients: QueuePatient[];
  nextId?: string;
  filtered: boolean;
  detailLabel: string;
  onResetFilters: () => void;
}

export function QueuePatientList({ patients, nextId, filtered, detailLabel, onResetFilters }: QueuePatientListProps) {
  if (!patients.length) {
    return <div className="flex flex-col items-center px-6 py-16 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400"><SearchX aria-hidden="true" className="h-7 w-7" /></span><h3 className="mt-4 text-sm font-bold text-slate-800">{filtered ? 'Không tìm thấy bệnh nhân phù hợp' : 'Chưa có bệnh nhân trong danh sách này'}</h3><p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">{filtered ? 'Thử tìm theo tên, số thứ tự hoặc chọn nhãn khác.' : 'Bệnh nhân sẽ xuất hiện tại đây sau khi check-in.'}</p>{filtered && <button className="mt-4 rounded-lg px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600" onClick={onResetFilters} type="button">Xóa bộ lọc</button>}</div>;
  }

  return (
    <div>
      <div aria-hidden="true" className="hidden grid-cols-[52px_minmax(190px,1.5fr)_minmax(180px,1fr)_100px] items-center gap-4 border-y border-slate-100 bg-slate-50/80 px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 xl:grid">
        <span>STT</span><span>Bệnh nhân</span><span>{detailLabel}</span><span>Check-in</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {patients.map((patient) => {
          const isNext = patient.id === nextId;
          return (
            <li className={`grid grid-cols-[42px_minmax(0,1fr)] items-start gap-x-3 gap-y-3 px-4 py-5 transition-colors sm:px-6 xl:grid-cols-[52px_minmax(190px,1.5fr)_minmax(180px,1fr)_100px] xl:items-center xl:gap-4 ${isNext ? 'clinical-queue-next bg-medblue-100 shadow-[inset_4px_0_0_#1d4ed8] [&_h3]:font-extrabold [&_h3]:text-medblue-800' : 'hover:bg-slate-50/70'}`} data-next={isNext || undefined} key={patient.id}>
              <div className="pt-0.5 xl:pt-0"><span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold tabular-nums ${isNext ? 'bg-blue-700 text-white shadow-sm' : 'bg-slate-100/80 text-slate-600'}`}>{String(patient.number).padStart(3, '0')}</span>{isNext && <span className="clinical-queue-next-badge mt-2 block rounded bg-medblue-600 py-1 text-center text-[9px] font-extrabold uppercase leading-3 text-white">Tiếp theo</span>}</div>
              <PatientIdentity patient={patient} />
              <p className="col-start-2 text-xs leading-5 text-slate-600 xl:col-start-auto"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400 xl:hidden">{detailLabel}</span>{patient.detail}</p>
              <div className="col-start-2 flex items-center gap-1.5 text-xs font-semibold tabular-nums text-slate-500 xl:col-start-auto"><Clock3 aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" /><span className="sr-only">Check-in lúc </span>{patient.checkIn}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
