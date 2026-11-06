import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, ClipboardList, Clock3, FileCheck2, Stethoscope } from 'lucide-react';
import type { ResultEncounter, ResultPatient } from '../models/types/patient-results.types';
import { formatResultDate, patientResultsHref } from '../utils/result-format';
import { EncounterActions } from './EncounterActions';

export function EncounterCard({ encounter, patient, detail = false, readOnly = false }: { encounter: ResultEncounter; patient: ResultPatient; detail?: boolean; readOnly?: boolean }) {
  const completed = encounter.status === 'COMPLETED';
  const readyCount = encounter.services.filter((service) => service.status === 'RESULT_READY').length;
  const formattedDate = formatResultDate(encounter.visitDate);
  const [day, month, year] = formattedDate.split('/');
  const href = patientResultsHref(encounter.patientId, encounter.id);

  return (
    <article data-encounter={encounter.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-md sm:p-6">
      <div className="flex items-start gap-3 sm:gap-5">
        <div className="flex w-14 shrink-0 flex-col items-center rounded-xl border border-blue-100 bg-blue-50 py-2 text-medblue-600 sm:w-18"><span className="text-[10px] font-bold uppercase">Tháng {month}</span><span className="text-3xl leading-tight font-extrabold tabular-nums">{day}</span><span className="text-[10px] font-semibold text-blue-500">{year}</span></div>
        <div className="grid min-w-0 flex-1 gap-3 min-[480px]:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <h2 className="break-words text-lg leading-snug font-extrabold text-slate-900 sm:text-xl">{detail ? patient.name : <Link href={href} className="rounded-sm hover:text-medblue-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">{patient.name}</Link>}</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">CCCD: <span className="break-all font-mono font-semibold tracking-wide text-slate-700">{patient.nationalId || 'Chưa cập nhật'}</span></p>
            <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-slate-500"><Building2 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-slate-400" />{encounter.facilityName}</p>
            <p className="mt-1.5 break-all font-mono text-[10px] text-slate-400">{encounter.code}</p>
          </div>
          <span className={`inline-flex w-fit items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[11px] font-bold ${completed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{completed ? <CheckCircle2 aria-hidden="true" className="size-3.5" /> : <Clock3 aria-hidden="true" className="size-3.5" />}{completed ? 'Hoàn thành' : 'Đang thực hiện'}</span>
        </div>
      </div>
      <dl className="mt-5 grid gap-x-6 gap-y-3 text-xs leading-relaxed text-slate-600 sm:grid-cols-2">
        <div><dt className="inline text-slate-400">{patient.birthDate ? 'Ngày sinh' : 'Năm sinh'}: </dt><dd className="inline font-semibold text-slate-700">{patient.birthDate ? formatResultDate(`${patient.birthDate}T00:00:00+07:00`) : patient.birthYear}</dd><dt className="ml-3 inline text-slate-400">Giới tính: </dt><dd className="inline font-semibold text-slate-700">{patient.gender || 'Chưa cập nhật'}</dd></div>
        <div className="flex items-start gap-2"><Stethoscope aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-slate-400" /><dt className="shrink-0 text-slate-400">Diện điều trị:</dt><dd className="font-semibold text-slate-700">Khám ngoại trú</dd></div>
        <div className="flex items-start gap-2"><ClipboardList aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-slate-400" /><dt className="shrink-0 text-slate-400">Chuyên khoa:</dt><dd className="font-semibold text-slate-700">{encounter.specialty}</dd></div>
        <div><dt className="inline text-slate-400">Bác sĩ: </dt><dd className="inline font-semibold text-slate-700">{encounter.doctorName}</dd></div>
      </dl>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="inline-flex items-center gap-2 text-[11px] text-slate-500"><FileCheck2 aria-hidden="true" className={`size-4 shrink-0 ${readyCount === encounter.services.length && readyCount > 0 ? 'text-emerald-600' : 'text-blue-500'}`} /><span><strong className="font-bold text-slate-700">{readyCount}/{encounter.services.length}</strong> dịch vụ đã có kết quả</span></p>
        <div className="flex flex-wrap items-center gap-2">
          {!detail && <Link href={href} className="inline-flex items-center gap-1.5 rounded-lg bg-medblue-600 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Xem kết quả<ArrowRight aria-hidden="true" className="size-3.5" /></Link>}
          {!readOnly && <EncounterActions encounter={encounter} />}
        </div>
      </div>
    </article>
  );
}
