import { Activity, CalendarDays, ClipboardCheck, FileClock, Pill, ShieldAlert } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { resultPanel, resultSectionTitle } from './patient-result-styles';
import type { ResultEncounter } from '../models/types/patient-results.types';
import { availableEncounterText, formatResultDate, formatResultTime } from '../utils/result-format';
import { loadPatientPrescription } from '../api/patient-results-api';

const card = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6';
const medicalText = 'wrap-anywhere whitespace-pre-wrap text-sm leading-6 text-slate-800';
const groupClass = 'border-b border-slate-200 p-4 last:border-b-0 sm:px-6 sm:py-5';
const fieldLabel = 'mb-1 text-sm font-semibold text-slate-600';
const unavailable = 'Cơ sở chưa cung cấp thông tin.';

export function PatientEncounterRecord({ encounter, progress }: { encounter: ResultEncounter; progress: ReactNode }) {
  const record = encounter.record;
  const formatTimestamp = (value?: string) => value ? `${formatResultDate(value)} · ${formatResultTime(value)}` : undefined;
  const info = [
    ['Cơ sở y tế', availableEncounterText(encounter.facilityName)],
    ['Ngày khám', encounter.visitDate && formatResultDate(encounter.visitDate)],
    ['Bác sĩ khám', availableEncounterText(encounter.doctorName)],
    ['Thời gian vào', formatTimestamp(record?.admittedAt)],
    ['Thời gian ra', formatTimestamp(record?.dischargeDate)],
  ];
  const clinical = [
    { label: 'Triệu chứng', value: record?.symptoms },
    { label: 'Ghi nhận thăm khám', value: record?.examination },
    { label: 'Kết luận của bác sĩ', value: record?.conclusion },
  ];
  const diagnoses = [
    { label: 'Chẩn đoán chính', items: record?.diagnoses?.filter(item => item.primary) },
    { label: 'Chẩn đoán kèm theo', items: record?.diagnoses?.filter(item => !item.primary) },
  ];

  return <div data-shared-encounter-record className={resultPanel}>
    <section aria-labelledby="visit-info" className={groupClass}>
      <h2 id="visit-info" className={resultSectionTitle}>Thông tin lần khám</h2>
      <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {info.map(([label, value]) => <div key={label} className="min-w-0">
          <dt className={fieldLabel}>{label}</dt><dd className={medicalText}>{value || unavailable}</dd>
        </div>)}
        {availableEncounterText(encounter.specialty) && <div><dt className={fieldLabel}>Chuyên khoa</dt><dd className={medicalText}>{encounter.specialty}</dd></div>}
        <div className="sm:col-span-full"><dt className={fieldLabel}>Lý do khám</dt><dd className={medicalText}>{record?.reason || unavailable}</dd></div>
      </dl>
    </section>
    <section aria-labelledby="clinical-findings" className={groupClass}>
      <h2 id="clinical-findings" className={resultSectionTitle}>Kết quả khám lâm sàng</h2>
      <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {diagnoses.map(({ label, items }, index) => (index === 0 || !!items?.length) && <div key={label} className="min-w-0">
          <h3 className={fieldLabel}>{label}</h3>
          {items?.length ? <ul className="space-y-2">{items.map((item, itemIndex) => <li key={`${item.code}:${itemIndex}`}>
            {item.name && <p className={`${medicalText} font-semibold`}>{item.name}</p>}
            {item.code && <p className="text-sm text-slate-600">Mã ICD <span className="font-mono">{item.code}</span></p>}
          </li>)}</ul> : <p className={medicalText}>Chưa có chẩn đoán chính được cung cấp.</p>}
        </div>)}
      </div>
      <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {clinical.map(({ label, value }) => <div key={label} className={label === 'Kết luận của bác sĩ' ? 'sm:col-span-2' : undefined}>
          <dt className={fieldLabel}>{label}</dt><dd className={medicalText}>{value || unavailable}</dd>
        </div>)}
      </dl>
      <div className="mt-4">
        <h3 className={fieldLabel}>Sinh hiệu</h3>
        {record?.vitals?.length ? <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {record.vitals.map(vital => <div key={vital.label} className="min-w-0 rounded-lg bg-slate-50 p-3">
            <dt className="text-sm text-slate-600">{vital.label}</dt><dd className={medicalText}>{vital.value || '—'} {vital.unit}</dd>
          </div>)}
        </dl> : <p className={medicalText}>Chưa có dữ liệu sinh hiệu được cung cấp.</p>}
      </div>
      {!!record?.timeline?.length && <div className="mt-4">
        <h3 className={fieldLabel}>Diễn biến lần khám</h3>
        <ol className="space-y-1 text-sm leading-6">{record.timeline.map((event, index) => <li key={index}>{formatTimestamp(event.time)} · {event.label}</li>)}</ol>
      </div>}
    </section>
    <section aria-labelledby="visit-guidance" className={groupClass}>
      <h2 id="visit-guidance" className={resultSectionTitle}>Theo dõi và hướng dẫn</h2>
      <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h3 className={fieldLabel}>Dị ứng ghi nhận trong lần khám</h3>
          {record?.allergies?.length ? <ul className={`${medicalText} list-disc space-y-1 pl-5 text-amber-900`}>
            {record.allergies.map((item, index) => <li key={index}>{item}</li>)}
          </ul> : <p className={medicalText}>{record?.allergies ? 'Danh sách ghi nhận dị ứng trống.' : 'Chưa có thông tin dị ứng được cung cấp.'}</p>}
        </div>
        <div><h3 className={fieldLabel}>Lời dặn của bác sĩ</h3><p className={medicalText}>{record?.advice || unavailable}</p></div>
        <div>
          <h3 className={fieldLabel}>Lịch tái khám</h3>
          {record?.followUp ? <>
            <time dateTime={record.followUp.date} className="text-sm font-semibold text-slate-900">{formatResultDate(record.followUp.date)}</time>
            {record.followUp.note && <p className={medicalText}>{record.followUp.note}</p>}
          </> : <p className={medicalText}>Chưa có thông tin hẹn tái khám.</p>}
        </div>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-3">{progress}</div>
      {record?.review && <div className="mt-4">
        <h3 className={fieldLabel}>Đánh giá của người bệnh · {record.review.rating}/5</h3>
        <p className={medicalText}>{record.review.comment}</p>
      </div>}
    </section>
  </div>;
}


export function EncounterRecordSections({ encounter }: { encounter: ResultEncounter }) {
  const record = encounter.record;
  return <div data-shared-encounter-record className="space-y-5">
    <section className={card}><h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800"><CalendarDays className="size-4 text-blue-700" />Thông tin phiên khám</h2><dl className="grid gap-4 text-xs leading-6 sm:grid-cols-2"><div><dt className="text-slate-400">Ngày vào</dt><dd>{formatResultTime(encounter.visitDate)} · {formatResultDate(encounter.visitDate)}</dd></div><div><dt className="text-slate-400">Ngày ra</dt><dd>{record?.dischargeDate ? `${formatResultTime(record.dischargeDate)} · ${formatResultDate(record.dischargeDate)}` : 'Chưa có thông tin'}</dd></div><div className="sm:col-span-2"><dt className="text-slate-400">Lý do khám</dt><dd className="break-words whitespace-pre-wrap text-slate-700">{record?.reason || 'Chưa có thông tin lý do khám.'}</dd></div></dl></section>
    <section className={card}><h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800"><Activity className="size-4 text-blue-700" />Khám lâm sàng</h2><dl className="space-y-4 text-xs leading-7"><div><dt className="font-semibold text-slate-500">Triệu chứng</dt><dd className="break-words whitespace-pre-wrap text-slate-700">{record?.symptoms || 'Chưa có dữ liệu triệu chứng.'}</dd></div><div><dt className="font-semibold text-slate-500">Ghi nhận thăm khám</dt><dd className="break-words whitespace-pre-wrap text-slate-700">{record?.examination || 'Chưa có ghi nhận thăm khám.'}</dd></div></dl>{record?.vitals?.length ? <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{record.vitals.map(vital => <div key={vital.label} className="rounded-xl bg-slate-50 p-3"><dt className="text-[10px] text-slate-400">{vital.label}</dt><dd className="mt-1 text-sm font-semibold text-slate-700">{vital.value || '—'}<span className="ml-1 text-[10px] font-normal text-slate-400">{vital.unit}</span></dd></div>)}</dl> : <p className="mt-4 text-xs text-slate-400">Chưa có dữ liệu sinh hiệu.</p>}</section>
    <section className={card}><h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800"><ClipboardCheck className="size-4 text-blue-700" />Chẩn đoán cuối cùng &amp; kết luận</h2>{record?.diagnoses?.length ? <ul className="space-y-2">{record.diagnoses.map(diagnosis => <li key={`${diagnosis.code}:${diagnosis.name}`} className="rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-700"><strong className="mr-2 font-mono text-blue-700">{diagnosis.code || "Chưa cung cấp mã ICD"}</strong>{diagnosis.name}<span className="ml-2 text-[10px] text-slate-400">{diagnosis.primary ? 'Bệnh chính' : 'Bệnh kèm theo'}</span></li>)}</ul> : <p className="text-xs text-slate-400">Chưa có chẩn đoán xác định được công bố.</p>}<p className="mt-4 text-xs leading-7 break-words whitespace-pre-wrap text-slate-600">{record?.conclusion || 'Chưa có nội dung kết luận.'}</p></section>
    <section className={card}><h2 className="mb-4 text-sm font-bold text-slate-800">Lời dặn &amp; tái khám</h2><p className="text-xs leading-7 break-words whitespace-pre-wrap text-slate-600">{record?.advice || 'Chưa có lời dặn được cung cấp.'}</p><p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">{record?.followUp ? <>Hẹn tái khám: <strong>{formatResultDate(record.followUp.date)}</strong>{record.followUp.note && <span className="mt-1 block whitespace-pre-wrap">{record.followUp.note}</span>}</> : 'Chưa có thông tin hẹn tái khám.'}</p></section>
    <section className={card}><h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><ShieldAlert className="size-4 text-rose-600" />Dị ứng ghi nhận trong phiên</h2>{record?.allergies?.length ? <ul className="space-y-2 text-xs leading-6 text-rose-700">{record.allergies.map(item => <li key={item}>{item}</li>)}</ul> : <p className="text-xs leading-6 text-slate-400">Chưa có khai báo dị ứng của phiên này. Không đồng nghĩa đã xác nhận không dị ứng.</p>}</section>
    {record?.timeline?.length ? <section className={card}><h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800"><FileClock className="size-4 text-blue-700" />Diễn biến phiên khám</h2><ol className="space-y-4 border-l border-blue-100 pl-4">{record.timeline.map((event, index) => <li key={`${event.time}:${index}`} className="text-xs leading-6"><time className="font-mono text-[10px] text-slate-400">{formatResultTime(event.time)} · {formatResultDate(event.time)}</time><p className="font-medium text-slate-600">{event.label}</p></li>)}</ol></section> : null}
    {record?.review && <section className={card}><h2 className="mb-3 text-sm font-bold text-slate-800">Đánh giá của người bệnh</h2><p className="text-xs font-semibold text-amber-700">{record.review.rating}/5</p><p className="mt-2 text-xs leading-7 break-words whitespace-pre-wrap text-slate-600">{record.review.comment}</p></section>}
  </div>;
}
export function EncounterPrescription({ encounter }: { encounter: ResultEncounter }) {
  const prescriptions = encounter.record?.prescriptions;
  return <section data-shared-encounter-prescription className={card}><h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-800"><Pill className="size-4 text-blue-700" />Đơn thuốc của phiên khám</h2>{prescriptions?.length ? <ol className="space-y-4">{prescriptions.map((item, index) => <li key={item.id} className="rounded-xl border border-slate-200 p-4"><h3 className="text-sm font-bold text-slate-800">{index + 1}. {item.name}</h3><dl className="mt-3 grid gap-3 text-xs leading-6 sm:grid-cols-2">{[{ label: 'Hàm lượng', value: item.strength }, { label: 'Liều dùng', value: item.dose }, { label: 'Cách dùng', value: item.usage }, { label: 'Số ngày', value: item.days }, { label: 'Số lượng', value: item.quantity }].map(field => <div key={field.label}><dt className="text-[10px] text-slate-400">{field.label}</dt><dd className="break-words whitespace-pre-wrap text-slate-600">{field.value || 'Chưa có thông tin'}</dd></div>)}</dl></li>)}</ol> : <div role="status" className="py-8 text-center"><h3 className="text-sm font-semibold text-slate-600">Chưa có dữ liệu đơn thuốc</h3><p className="mt-2 text-xs leading-6 text-slate-400">Đơn thuốc sẽ hiển thị khi được cơ sở cung cấp cho phiên khám.</p></div>}</section>;
}

export function PatientEncounterPrescription({ encounter }: { encounter: ResultEncounter }) {
  const { id, patientId, source } = encounter;
  const [data, setData] = useState<Awaited<ReturnType<typeof loadPatientPrescription>> | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const medicines = source === 'api' ? data?.medicines : encounter.record?.prescriptions ?? [];

  useEffect(() => {
    if (source !== 'api') return;
    const controller = new AbortController();
    loadPatientPrescription(Number(patientId), Number(id), controller.signal).then(result => {
      if (!controller.signal.aborted) setData(result);
    }).catch(cause => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Không thể tải đơn thuốc.');
    });
    return () => controller.abort();
  }, [id, patientId, source, revision]);

  return <section className={resultPanel} aria-labelledby="patient-prescription">
    <header className="p-4 sm:px-6">
      <h2 id="patient-prescription" className={resultSectionTitle}>Đơn thuốc của lần khám</h2>
      {data?.note && <p className={`mt-2 ${medicalText}`}>{data.note}</p>}
      {error ? <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
        <p role="alert" className="text-rose-800">{error}</p>
        <button type="button" className="min-h-11 font-semibold text-blue-700 underline" onClick={() => { setError(''); setRevision(value => value + 1); }}>Thử lại</button>
      </div> : !medicines ? <p role="status" className="mt-2 text-sm text-slate-600">Đang tải đơn thuốc…</p>
        : medicines.length === 0 && <p role="status" className="mt-2 text-sm text-slate-600">Chưa có đơn thuốc được cung cấp cho lần khám này.</p>}
    </header>
    {!!medicines?.length && <ol className="divide-y divide-slate-100 border-t border-slate-200">
      {medicines.map(item => <li key={item.id} className="p-4 sm:px-6">
        <h3 className="wrap-anywhere font-bold text-slate-900">{item.name}</h3>
        {(item.strength || item.form) && <p className="mt-1 wrap-anywhere text-sm text-slate-600">{[item.strength, item.form].filter(Boolean).join(' · ')}</p>}
        <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {[
            ['Liều dùng theo đơn', item.dose],
            ['Thời điểm và cách dùng', item.usage],
            ['Đường dùng', item.route],
            ['Số ngày sử dụng', item.days],
            ['Tổng số lượng', item.quantity],
          ].filter(([, value]) => value?.trim()).map(([label, value]) => <div key={label}>
            <dt className={fieldLabel}>{label}</dt><dd className={medicalText}>{value}</dd>
          </div>)}
        </dl>
      </li>)}
    </ol>}
  </section>;
}
