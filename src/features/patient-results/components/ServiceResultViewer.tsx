'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ClinicalMediaPreview } from '@/src/shared/components/ClinicalMediaPreview';
import Image from 'next/image';
import { EncounterImageDialog, type EncounterImageLoader } from './EncounterImageDialog';
import Link from 'next/link';
import { ArrowLeft, Eye, FileClock, FileText, Hospital, Maximize, Minus, Plus, ScanBarcode } from 'lucide-react';
import type { ClinicalService, ResultEncounter, ResultPatient } from '../models/types/patient-results.types';
import { formatResultDate, formatResultTime } from '../utils/result-format';
import { resultPanel, resultSecondary, resultSectionTitle } from './patient-result-styles';

type ResultViewerProps = {
  service: ClinicalService;
  encounter: ResultEncounter;
  patient: ResultPatient;
  backHref: string;
  mode?: 'patient' | 'doctor';
  loadImage?: EncounterImageLoader;
  imageHeader?: ReactNode;
  orderDates?: { ordered: string; completed?: string | null };
};

export function ServiceResultViewer(props: ResultViewerProps) {
  if (props.mode === 'doctor') return <LegacyResultViewer {...props} />;
  return <PatientResultViewer {...props} />;
}

function PatientResultViewer({ service, encounter, patient, backHref, orderDates }: ResultViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [fitWidth, setFitWidth] = useState(0);
  const [imageId, setImageId] = useState<string | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const report = service.status === 'RESULT_READY' ? service.report : undefined;

  useEffect(() => {
    if (!viewport.current) return;
    const observer = new ResizeObserver(([entry]) => setFitWidth(Math.min(880, entry.contentRect.width)));
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, []);

  const issuedAt = encounter.source === 'api' ? orderDates?.completed : report?.issuedAt;
  const metadata = [
    [encounter.source === 'api' ? 'Mã dịch vụ' : 'Mã phiếu', report?.code],
    ['Ngày chỉ định', orderDates?.ordered && formatResultDate(orderDates.ordered)],
    ['Ngày có kết quả', issuedAt && formatResultDate(issuedAt)],
    ['Cơ sở của lần khám', encounter.facilityName],
    ['Nơi thực hiện', service.location === 'Chưa phân phòng' ? undefined : service.location],
  ];
  const hasContents = report && (report.description || report.conclusion || report.rows.length);

  return <section data-shared-service-result="patient" aria-labelledby="result-viewer-title" className={resultPanel}>
    <header className="space-y-3 p-4 sm:px-6">
      <Link href={backHref} className={resultSecondary}>
        <ArrowLeft aria-hidden="true" className="size-4" /> Về danh sách dịch vụ
      </Link>
      <h2 id="result-viewer-title" className={`${resultSectionTitle} wrap-anywhere`}>{service.name}</h2>
      {report && <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
        {metadata.map(([label, value]) => <div key={label} className="min-w-0">
          <dt className="text-slate-600">{label}</dt>
          <dd className="mt-0.5 wrap-anywhere font-medium text-slate-900">{value || 'Chưa được cung cấp'}</dd>
        </div>)}
      </dl>}
    </header>
    {!report ? <p role="status" className="border-t border-slate-200 p-4 text-sm text-slate-600 sm:px-6">Chưa có phiếu kết quả được cung cấp cho dịch vụ này.</p> : <>
      <div role="group" aria-label="Điều chỉnh kích thước phiếu"
        className="flex flex-wrap items-center gap-2 border-y border-slate-200 bg-slate-50 px-4 py-2 sm:px-6">
        <button type="button" aria-label="Thu nhỏ phiếu" disabled={zoom <= 75}
          onClick={() => setZoom(value => Math.max(75, value - 25))} className={resultSecondary}><Minus aria-hidden="true" className="size-4" /></button>
        <span aria-live="polite" className="min-w-10 text-center text-sm font-semibold tabular-nums text-slate-700">{zoom}%</span>
        <button type="button" aria-label="Phóng to phiếu" disabled={zoom >= 200}
          onClick={() => setZoom(value => Math.min(200, value + 25))} className={resultSecondary}><Plus aria-hidden="true" className="size-4" /></button>
        <button type="button" onClick={() => setZoom(100)} className={resultSecondary}>
          <Maximize aria-hidden="true" className="size-4" /> Vừa khung
        </button>
      </div>
      <div ref={viewport} role="region" aria-label="Nội dung phiếu kết quả" tabIndex={0}
        className="overflow-x-auto bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600">
        <article data-result-document={report.code} className="mx-auto bg-white p-4 text-sm leading-6 text-slate-800 sm:p-6"
          style={{ width: fitWidth || '100%', zoom: zoom / 100 }}>
          <div className="mb-4 border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900">Nội dung kết quả</h3>
            <p className="mt-1 wrap-anywhere text-slate-600">Người khám · {patient.name}</p>
          </div>
          {hasContents ? <div className="space-y-4">
            {report.description && <div><h4 className="font-semibold">Mô tả</h4><p className="wrap-anywhere whitespace-pre-wrap">{report.description}</p></div>}
            {report.conclusion && <div><h4 className="font-semibold">Kết luận</h4><p className="wrap-anywhere whitespace-pre-wrap">{report.conclusion}</p></div>}
            {report.rows.length > 0 && <div role="region" aria-label="Bảng chỉ số xét nghiệm" tabIndex={0}
              className="overflow-x-auto rounded-lg border border-slate-200 focus-visible:outline-2 focus-visible:outline-blue-600">
              <ReportValuesTable rows={report.rows} patient />
            </div>}
          </div> : <p className="text-slate-600">Cơ sở chưa cung cấp mô tả, kết luận hoặc bảng chỉ số.</p>}
        </article>
      </div>
      {(!!report.files?.length || !!report.images?.length) && <section aria-labelledby="result-attachments" className="space-y-3 border-t border-slate-200 p-4 sm:px-6">
        <h3 id="result-attachments" className="font-bold text-slate-900">Tài liệu đính kèm</h3>
        {report.files?.map(file => <ClinicalMediaPreview key={file.id} media={file} />)}
        {!!report.images?.length && <div className="grid gap-3 sm:grid-cols-2">
          {report.images.map(image => <div key={image.id} className="min-w-0 rounded-lg border border-slate-200">
            <button type="button" aria-label={`Mở ảnh ${image.title}`} onClick={() => setImageId(image.id)}
              className="block w-full overflow-hidden rounded-t-lg text-left focus-visible:outline-2 focus-visible:outline-blue-600">
              <Image unoptimized src={image.src} width={1000} height={800} alt={image.title} className="max-h-80 w-full bg-slate-50 object-contain" />
              <span className="block wrap-anywhere bg-white px-3 py-2 text-sm font-semibold text-blue-700">{image.title} · Phóng to</span>
            </button>
            <a href={image.src} target="_blank" rel="noreferrer" className="mx-3 inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 hover:underline">
              Mở ảnh gốc<span className="sr-only"> {image.title}</span>
            </a>
          </div>)}
        </div>}
      </section>}
      {imageId && !!report.images?.length && <EncounterImageDialog images={report.images} initialId={imageId} onClose={() => setImageId(null)} />}
    </>}
  </section>;
}

function ReportValuesTable({ rows, patient = false }: { rows: NonNullable<ClinicalService['report']>['rows']; patient?: boolean }) {
  return <table className={`w-full border-collapse text-left ${patient ? 'min-w-[34rem] text-sm' : 'mt-7 text-[11px]'}`}>
    <caption className="sr-only">Bảng kết quả cận lâm sàng</caption>
    <thead><tr className="bg-blue-50">{['STT', 'Tên chỉ số', 'Kết quả', 'Đơn vị', 'Tham chiếu'].map(label => (
      <th key={label} scope="col" className="border-b border-slate-200 p-2.5 font-bold">{label}</th>
    ))}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={`${row.name}:${index}`}>
      <td className="border-b border-slate-200 p-2.5">{index + 1}</td>
      <th scope="row" className="border-b border-slate-200 p-2.5 font-medium">{row.name}</th>
      <td className="border-b border-slate-200 p-2.5 font-semibold">{row.value || '—'}</td>
      <td className="border-b border-slate-200 p-2.5">{row.unit || '—'}</td>
      <td className="border-b border-slate-200 p-2.5">{row.reference || '—'}</td>
    </tr>)}</tbody>
  </table>;
}

function LegacyResultViewer({ service, encounter, patient, backHref, mode = 'doctor', loadImage, imageHeader }: ResultViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [imageId, setImageId] = useState<string | null>(null);
  const [fitScale, setFitScale] = useState(1);
  const viewportRef = useRef<HTMLDivElement>(null);
  const report = service.status === 'RESULT_READY' ? service.report : undefined;
  const reportCodeLabel = mode === 'patient' && encounter.source === 'api' ? 'Mã dịch vụ' : 'Mã phiếu';

  useEffect(() => {
    if (!viewportRef.current) return;
    const observer = new ResizeObserver(([entry]) => setFitScale(Math.min(1, entry.contentRect.width / 760)));
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);

  return <section data-shared-service-result={mode} aria-labelledby="result-viewer-title" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center gap-3 bg-blue-700 px-3 py-4 text-white sm:px-5"><Link href={backHref} aria-label="Về danh sách dịch vụ" className="rounded-lg p-1.5 text-blue-100 hover:bg-white/10 hover:text-white"><ArrowLeft className="size-5" /></Link><h1 id="result-viewer-title" className="text-lg font-bold">Phiếu kết quả</h1><FileText aria-hidden="true" className="ml-auto size-5 text-blue-200" /></div>
    <div className="border-b border-slate-100 p-4 sm:p-5"><div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-800"><Eye aria-hidden="true" className="size-4" />{service.name}</div><p className="text-xs text-slate-500">{mode === 'doctor' && <>Mã ca khám: <strong className="font-mono font-medium text-slate-700">{encounter.code}</strong></>}{report && <>{mode === 'doctor' && <span className="mx-2 text-slate-300">·</span>}{reportCodeLabel}: <strong className="font-mono font-medium text-slate-700">{report.code}</strong></>}</p></div>
    {report ? <>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-5"><span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800">{encounter.source === 'api' ? 'Kết quả được cơ sở cung cấp' : 'Phiếu minh họa · Không dùng cho điều trị'}</span><div className="flex items-center gap-1.5"><button type="button" aria-label="Thu nhỏ phiếu" disabled={zoom <= 75} onClick={() => setZoom(Math.max(75, zoom - 25))} className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><Minus className="size-3.5" /></button><span className="min-w-10 text-center text-[11px] text-slate-500">{zoom}%</span><button type="button" aria-label="Phóng to phiếu" disabled={zoom >= 200} onClick={() => setZoom(Math.min(200, zoom + 25))} className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><Plus className="size-3.5" /></button><button type="button" aria-label="Vừa khung xem" onClick={() => setZoom(100)} className="ml-1 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"><Maximize className="size-3.5" /><span className="hidden sm:inline">Vừa khung</span></button></div></div>
      <div className="overflow-auto bg-slate-200/70 p-3 sm:p-6"><div ref={viewportRef} className="w-full"><article data-result-document={report.code} className="mx-auto min-h-[940px] w-[760px] bg-white p-10 text-slate-900 shadow-sm" style={{ zoom: fitScale * zoom / 100 }}>
        <header className="flex items-start justify-between gap-8 border-b-2 border-blue-700 pb-5"><div className="flex items-center gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-blue-700 text-blue-700"><Hospital className="size-7" /></span><div><p className="max-w-80 text-xs font-bold uppercase leading-relaxed">{encounter.facilityName || 'Kết quả cận lâm sàng'}</p>{(mode === 'doctor' || service.location !== 'Chưa phân phòng') && <p className="mt-1 text-[11px] text-slate-500">{service.location}</p>}</div></div><div className="text-right"><ScanBarcode className="ml-auto h-7 w-20 text-slate-500" aria-hidden="true" /><p className="mt-1 font-mono text-[10px]">{report.code}</p></div></header>
        <div className="my-7 text-center"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">{encounter.source === 'api' ? 'Kết quả từ cơ sở y tế' : 'Bản xem trước giao diện'}</p><h2 className="text-xl font-extrabold uppercase">{service.kind === 'LAB' ? 'Phiếu kết quả xét nghiệm' : 'Phiếu kết quả cận lâm sàng'}</h2><p className="mt-2 text-xs font-medium text-slate-500">{service.category}</p></div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs leading-relaxed">{mode === 'doctor' && <><div><dt className="inline text-slate-500">Họ và tên: </dt><dd className="inline font-bold uppercase">{patient.name}</dd></div><div><dt className="inline text-slate-500">Mã ca khám: </dt><dd className="inline font-mono">{encounter.code}</dd></div><div><dt className="inline text-slate-500">Năm sinh: </dt><dd className="inline">{patient.birthYear}</dd><dt className="ml-4 inline text-slate-500">Giới tính: </dt><dd className="inline">{patient.gender || '—'}</dd></div></>}{encounter.visitDate && <div><dt className="inline text-slate-500">Ngày khám: </dt><dd className="inline">{formatResultDate(encounter.visitDate)}</dd></div>}{encounter.doctorName && <div className="col-span-2"><dt className="inline text-slate-500">Bác sĩ chỉ định: </dt><dd className="inline">{encounter.doctorName}</dd></div>}<div className="col-span-2"><dt className="inline text-slate-500">Dịch vụ: </dt><dd className="inline font-semibold">{service.name}</dd></div></dl>
        {(report.description || report.conclusion) && <section className="mt-6 space-y-4 text-xs leading-7">{report.description && <div><h3 className="font-bold">Mô tả</h3><p className="break-words whitespace-pre-wrap">{report.description}</p></div>}{report.conclusion && <div><h3 className="font-bold">Kết luận</h3><p className="break-words whitespace-pre-wrap">{report.conclusion}</p></div>}</section>}
        {report.rows.length > 0 && <ReportValuesTable rows={report.rows} />}
        {!!report.files?.length && <section aria-label="Tài liệu kết quả" className="mt-6 space-y-3">{report.files.map(file => <ClinicalMediaPreview key={file.id} media={file} />)}</section>}
        {!!report.images?.length && <section className="mt-6"><h3 className="mb-3 text-xs font-bold">Hình ảnh / Tài liệu y tế</h3><div className="grid grid-cols-2 gap-3">{report.images.map(image => <button key={image.id} type="button" aria-label={`Mở ảnh ${image.title}`} onClick={() => setImageId(image.id)} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-left"><Image unoptimized src={image.src} width={1000} height={800} alt={image.title} className="h-auto w-full" /><span className="block bg-white p-2 text-[10px] text-blue-700">{image.title} · Phóng to</span></button>)}</div></section>}
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50/60 p-4 text-[11px] leading-relaxed text-amber-900"><strong>{encounter.source === 'api' ? 'Dữ liệu kết quả từ cơ sở y tế.' : 'Phiếu dùng để minh họa bố cục.'}</strong> Các ô “—” chưa có dữ liệu. Chỉ số, khoảng tham chiếu và kết luận được trình bày theo dữ liệu cơ sở cung cấp.</div>
        <div className="mt-12 text-right text-xs leading-relaxed"><p>{formatResultTime(report.issuedAt)}, ngày {formatResultDate(report.issuedAt)}</p><p className="mt-2 font-bold uppercase">Bộ phận trả kết quả</p><p className="mt-2 text-[10px] text-slate-400">{encounter.source === 'api' ? 'Chưa cung cấp chữ ký số' : 'Chưa có chữ ký số · Bản minh họa'}</p></div>
        <footer className="mt-24 border-t border-slate-200 pt-4 text-[10px] leading-relaxed text-slate-400">MedConnect · {report.code}<br />{encounter.source === 'api' ? 'Bản tra cứu kết quả khám trên cổng bệnh nhân.' : 'Bản xem trước không sử dụng để chẩn đoán hoặc điều trị.'}</footer>
      </article></div></div>
    </> : <div role="status" className="px-5 py-16 text-center"><FileClock aria-hidden="true" className="mx-auto mb-4 size-12 text-blue-300" /><h2 className="text-base font-bold text-slate-700">{service.status === 'RESULT_READY' ? 'Chưa có tệp phiếu kết quả' : 'Dịch vụ chưa có kết quả'}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">{service.status === 'RESULT_READY' ? 'Dịch vụ đã có kết quả, nhưng phiếu chi tiết chưa được cung cấp trên hệ thống.' : 'Phiếu sẽ hiển thị sau khi dịch vụ hoàn tất và kết quả được công bố.'}</p><Link href={backHref} className="mt-5 inline-flex rounded-lg bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100">Về danh sách dịch vụ</Link></div>}
    {imageId && report?.images?.length ? <EncounterImageDialog images={report.images} initialId={imageId} onClose={() => setImageId(null)} loadImage={loadImage} header={imageHeader} /> : null}
  </section>;
}
