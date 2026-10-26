'use client';

import { useState, type FormEvent } from 'react';
import { ClipboardList, Download, Filter, Search, ShieldAlert } from 'lucide-react';
import type { SystemLogFilters } from '../api/system-admin-api';
import type { SystemLogEventType, SystemLogItem } from '../types';

interface SystemLogViewProps {
  items: SystemLogItem[];
  loading: boolean;
  onExport: (filters: SystemLogFilters) => Promise<void>;
  onSearch: (filters: SystemLogFilters) => Promise<void>;
}

const EVENT_OPTIONS: Array<{ value: SystemLogEventType; label: string }> = [
  { value: 'RECORD_ACCESSED', label: 'Truy cập hồ sơ' },
  { value: 'RECORD_ACCESS_DENIED', label: 'Từ chối truy cập hồ sơ' },
  { value: 'ENCOUNTER_VIEWED', label: 'Xem lượt khám' },
  { value: 'CLS_RESULT_VIEWED', label: 'Xem kết quả CLS' },
  { value: 'NOTABLE_RECORD_ACCESSED', label: 'Xem phiên đáng chú ý' },
];

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

function formFilters(form: HTMLFormElement): SystemLogFilters {
  const data = new FormData(form);
  const eventType = String(data.get('eventType') ?? '') as SystemLogEventType | '';
  const encounterId = String(data.get('encounterId') ?? '').trim();
  const accountId = String(data.get('accountId') ?? '').trim();
  const from = String(data.get('loggedFrom') ?? '');
  const to = String(data.get('loggedTo') ?? '');
  return {
    eventType: eventType || undefined,
    encounterId: encounterId ? Number(encounterId) : undefined,
    accountId: accountId ? Number(accountId) : undefined,
    loggedFrom: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
    loggedTo: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined,
  };
}

export function SystemLogView({ items, loading, onExport, onSearch }: SystemLogViewProps) {
  const [exporting, setExporting] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SystemLogFilters>({});

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const filters = formFilters(event.currentTarget);
    setActiveFilters(filters);
    await onSearch(filters);
  };

  const exportData = async () => {
    setExporting(true);
    try { await onExport(activeFilters); } finally { setExporting(false); }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100"><ClipboardList className="h-5 w-5" /></div>
          <div><h2 className="text-lg font-extrabold text-slate-950">Nhật ký hệ thống</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Giám sát hoạt động truy cập dữ liệu y khoa và xuất báo cáo phục vụ kiểm tra.</p></div>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60" disabled={exporting} onClick={() => void exportData()} type="button"><Download className="h-4 w-4" />{exporting ? 'Đang xuất...' : 'Xuất Excel'}</button>
      </div>

      <form className="grid gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:grid-cols-2 xl:grid-cols-6 sm:px-6" onSubmit={submit}>
        <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Loại sự kiện</span><select className={inputClass} name="eventType"><option value="">Tất cả sự kiện</option>{EVENT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">ID lượt khám</span><input className={inputClass} min={1} name="encounterId" placeholder="Tất cả" type="number" /></label>
        <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">ID tài khoản</span><input className={inputClass} min={1} name="accountId" placeholder="Tất cả" type="number" /></label>
        <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Từ ngày</span><input className={inputClass} name="loggedFrom" type="date" /></label>
        <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Đến ngày</span><input className={inputClass} name="loggedTo" type="date" /></label>
        <button className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800" type="submit"><Filter className="h-4 w-4" /> Lọc dữ liệu</button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-[1050px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Thời gian</th><th className="px-4 py-3">Sự kiện</th><th className="px-4 py-3">Tài khoản</th><th className="px-4 py-3">Lượt khám</th><th className="px-4 py-3">Chi tiết</th><th className="px-5 py-3 text-right">Mã log</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const denied = item.eventType === 'RECORD_ACCESS_DENIED';
              return <tr className={denied ? 'bg-rose-50/40' : 'hover:bg-blue-50/20'} key={item.id}><td className="whitespace-nowrap px-5 py-4 font-medium text-slate-600">{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(item.loggedDate))}</td><td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${denied ? 'bg-rose-100 text-rose-700' : 'bg-blue-50 text-blue-700'}`}>{denied && <ShieldAlert className="h-3.5 w-3.5" />}{item.eventLabel}</span></td><td className="px-4 py-4"><p className="font-semibold text-slate-800">{item.accountName || 'Không xác định'}</p><p className="mt-1 font-mono text-xs text-slate-400">{item.accountId ? `#${item.accountId}` : '—'}</p></td><td className="px-4 py-4 font-mono text-xs text-slate-500">{item.encounterId ? `#${item.encounterId}` : '—'}</td><td className="max-w-md px-4 py-4"><code className="line-clamp-2 break-all text-xs text-slate-500">{Object.keys(item.detail).length ? JSON.stringify(item.detail) : 'Không có dữ liệu bổ sung'}</code></td><td className="px-5 py-4 text-right font-mono text-xs text-slate-400">#{item.id}</td></tr>;
            })}
          </tbody>
        </table>
        {!loading && items.length === 0 && <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center"><Search className="h-9 w-9 text-slate-300" /><p className="mt-3 font-bold text-slate-700">Chưa có nhật ký phù hợp</p><p className="mt-1 text-sm text-slate-500">Thử thay đổi điều kiện lọc và tìm lại.</p></div>}
        {loading && <div className="flex min-h-56 items-center justify-center text-sm font-semibold text-slate-500">Đang tải nhật ký...</div>}
      </div>
    </section>
  );
}
