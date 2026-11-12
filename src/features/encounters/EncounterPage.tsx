'use client';

import { AccountName } from '@/src/shared/components/layout/AccountName';

import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight, Flag, Plus, X } from 'lucide-react';
import { encounterTabs, icdCatalog, initialServices } from './data/encounter-demo';
import type { Diagnosis, EncounterTab, OrderedService, PrescriptionItem } from './types';
import { DiagnosisPanel, HistoryPanel, OverviewPanel, PrescriptionPanel, SummaryPanel } from './components/ClinicalPanels';
import { OrdersPanel, ResultsPanel } from './components/ParaclinicalPanels';
import { EncounterBadge, EncounterButton } from './components/EncounterControls';
import { PatientQueueDialog } from './components/PatientQueueDialog';

export function EncounterPage() {
  const [tab, setTab] = useState<EncounterTab>('overview');
  const [services, setServices] = useState<OrderedService[]>(initialServices);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([icdCatalog[0]]);
  const [drugs, setDrugs] = useState<PrescriptionItem[]>([]);
  const [queueOpen, setQueueOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [queueStatus, setQueueStatus] = useState('Đang khám');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function switchTab(next: EncounterTab) { setTab(next); setNotice(''); }
  function confirmOrder() {
    if (!services.some(s => s.status === 'new')) { setNotice('Không có dịch vụ mới để gửi chỉ định.'); return; }
    setServices(services.map(s => s.status === 'new' ? { ...s, status: 'waiting' } : s));
    setQueueStatus('Chờ kết quả CLS');
    setNotice('Đã xác nhận chỉ định trong bản xem trước. Chưa lưu lên máy chủ.');
    setQueueOpen(true);
  }
  function simulateResults() {
    setServices(services.map(s => s.status === 'waiting' ? { ...s, status: 'done' } : s));
    setQueueStatus('Có kết quả CLS');
    setNotice('Đã cập nhật kết quả giả lập.');
  }
  return <div className="min-h-screen bg-[#f6f8fc] text-[13px] text-slate-800">
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-medblue-brand text-white"><Plus strokeWidth={4} className="h-5 w-5" /></span><span className="text-[17px] font-extrabold text-slate-900">MedConnect</span><span className="hidden text-xs text-slate-500 sm:inline">/ Không gian khám bệnh</span></div><div className="flex shrink-0 items-center gap-3"><span className="hidden text-xs text-slate-500 md:inline">Phòng 203 · Nội tổng quát</span><span className="flex h-8 w-8 items-center justify-center rounded-full bg-medblue-100 text-xs font-extrabold text-medblue-700">BS</span><b className="hidden text-xs min-[420px]:inline"><AccountName fallback="Bác sĩ" /></b></div></header>
    <main className="mx-auto max-w-[1440px] p-3 sm:px-6 sm:py-5">
      <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-slate-500"><span>Quản lý khám bệnh</span><ChevronRight className="h-3 w-3" /><button type="button" className="cursor-pointer rounded-lg px-1 py-1 hover:text-medblue-700 focus-visible:outline-2 focus-visible:outline-medblue-brand" onClick={() => setQueueOpen(true)}>Danh sách chờ</button><ChevronRight className="h-3 w-3" /><span aria-current="page" className="font-bold text-slate-800">Chi tiết lượt khám</span></nav>
      <section aria-label="Thông tin bệnh nhân" className="mb-4 rounded-[14px] border border-slate-200 bg-white px-5 py-[18px] shadow-sm md:sticky md:top-16 md:z-20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3"><h1 className="text-xl font-extrabold">Nguyễn Văn A</h1><EncounterBadge tone="green">● Đang khám</EncounterBadge></div>
            <p className="mt-1 text-xs text-slate-500">BN00124 · Nam, 54 tuổi · 07/11/2026, 09:15</p>
          </div>
          <EncounterButton variant="danger" className="ml-auto" onClick={() => setNotice('Minh họa đánh dấu chú ý cho lượt khám. Chưa lưu dữ liệu lên máy chủ.')}>
            <Flag aria-hidden="true" className="h-3.5 w-3.5" />Đánh dấu chú ý
          </EncounterButton>
        </div>
        <div className="mt-3 border-t border-slate-200 pt-3"><h2 className="text-[11px] font-extrabold text-slate-500">Tiền sử / bệnh nền</h2><p className="mt-1 font-semibold">Tăng huyết áp · Đái tháo đường type 2</p></div>
      </section>
      <section aria-label="Chi tiết lượt khám" className="min-w-0 overflow-hidden rounded-[14px] border border-slate-200 bg-white">
        <div role="tablist" aria-label="Nội dung khám bệnh" className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 py-3">{encounterTabs.map((item, i) => <button key={item.id} ref={el => { tabRefs.current[i] = el; }} id={`tab-${item.id}`} type="button" role="tab" aria-selected={tab === item.id} aria-controls={`panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} onClick={() => switchTab(item.id)} onKeyDown={e => { let index = i; if (e.key === 'ArrowRight') index = (i + 1) % encounterTabs.length; else if (e.key === 'ArrowLeft') index = (i + encounterTabs.length - 1) % encounterTabs.length; else if (e.key === 'Home') index = 0; else if (e.key === 'End') index = encounterTabs.length - 1; else return; e.preventDefault(); switchTab(encounterTabs[index].id); tabRefs.current[index]?.focus(); }} className={`shrink-0 cursor-pointer rounded-lg px-3 py-2.5 text-xs font-bold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-medblue-brand ${tab === item.id ? 'bg-medblue-50 text-medblue-700' : 'text-slate-500 hover:bg-slate-50'}`}>{item.label}</button>)}</div>
        <div className="min-h-[570px] p-4 sm:p-[23px]">{encounterTabs.map(item => <div key={item.id} id={`panel-${item.id}`} role="tabpanel" aria-labelledby={`tab-${item.id}`} tabIndex={0} hidden={tab !== item.id} className="outline-none focus-visible:ring-2 focus-visible:ring-medblue-200">
          {item.id === 'overview' && (
            <div className="space-y-6">
              <OverviewPanel />
              <OrdersPanel
                services={services}
                onChange={setServices}
                onConfirm={confirmOrder}
              />
            </div>
          )}
          {item.id === 'history' && <HistoryPanel notify={setNotice} />}
          {item.id === 'results' && <ResultsPanel services={services} onSimulate={simulateResults} />}
          {item.id === 'diagnosis' && <DiagnosisPanel diagnoses={diagnoses} onChange={setDiagnoses} onResults={() => switchTab('results')} />}
          {item.id === 'rx' && <PrescriptionPanel drugs={drugs} onChange={setDrugs} />}
          {item.id === 'finish' && <SummaryPanel services={services} diagnoses={diagnoses} drugs={drugs} notify={setNotice} />}
        </div>)}</div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:px-[22px]"><span className="text-[11px] text-slate-500">Bản xem trước · Dữ liệu giả lập, chưa lưu máy chủ</span><div className="flex flex-wrap gap-2"><EncounterButton variant="light" onClick={() => setQueueOpen(true)}><ArrowLeft className="h-3.5 w-3.5" />Danh sách bệnh nhân</EncounterButton><EncounterButton onClick={() => setNotice('Minh họa lưu nháp. Dữ liệu chỉ được giữ khi trang còn mở, chưa lưu lên máy chủ.')}>Lưu nháp</EncounterButton>{tab !== 'finish' && <EncounterButton variant="primary" onClick={() => switchTab(encounterTabs[encounterTabs.findIndex(item => item.id === tab) + 1].id)}>Tiếp tục<ArrowRight className="h-3.5 w-3.5" /></EncounterButton>}</div></footer>
      </section>
    </main>
    {queueOpen && <PatientQueueDialog status={queueStatus} onClose={() => setQueueOpen(false)} onOpen={() => { setQueueOpen(false); switchTab('results'); }} notify={setNotice} />}
    <div role="status" aria-live="polite" className={`${notice ? 'fixed bottom-5 left-1/2 z-50 flex w-[calc(100%_-_24px)] max-w-lg -translate-x-1/2 items-start gap-3 rounded-xl border border-medblue-200 bg-white p-4 text-xs leading-6 shadow-xl' : 'sr-only'}`}>{notice}{notice && <EncounterButton aria-label="Đóng thông báo" onClick={() => setNotice('')}><X className="h-3.5 w-3.5" /></EncounterButton>}</div>
  </div>;
}
