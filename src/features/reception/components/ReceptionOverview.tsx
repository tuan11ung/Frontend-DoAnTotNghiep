'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useReceptionData } from '../ReceptionDataProvider';
import { previewReceptionSummary, RECEPTION_PREVIEW_EVENT, RECEPTION_PREVIEW_KEY } from '../api/reception-preview-api';
import { receptionError } from './reception-ui';

type Summary = { checkin?: number; pending?: number; accepted?: number; unpaid?: number };

export function ReceptionOverview() {
  const { api, demo, href } = useReceptionData();
  const [summary, setSummary] = useState<Summary>({});
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      try {
        if (demo) setSummary(previewReceptionSummary());
        else {
          const pending = await api.pending(0, controller.signal);
          if (!controller.signal.aborted) setSummary({ pending: pending.totalElements });
        }
        if (!controller.signal.aborted) { setError(''); setLoading(false); }
      } catch (e) {
        if (!controller.signal.aborted) { setError(receptionError(e)); setLoading(false); }
      }
    }
    void refresh();
    const storage = (event: StorageEvent) => { if (event.key === null || event.key === RECEPTION_PREVIEW_KEY) void refresh(); };
    window.addEventListener(RECEPTION_PREVIEW_EVENT, refresh);
    window.addEventListener('storage', storage);
    return () => {
      controller.abort();
      window.removeEventListener(RECEPTION_PREVIEW_EVENT, refresh);
      window.removeEventListener('storage', storage);
    };
  }, [api, demo, revision]);
  const stats = [
    { label: 'Chờ check-in', value: summary.checkin, tab: 'checkin' },
    { label: 'Chờ phân khoa', value: summary.pending, tab: 'pending-specialty' },
    { label: 'Đã tiếp nhận', value: summary.accepted, tab: 'registration' },
    { label: 'Chờ thanh toán', value: summary.unpaid, tab: 'checkout' },
  ];
  return <div className="space-y-6">
    <div className="flex items-center justify-between gap-3"><p className="text-sm text-slate-500">Hoạt động tiếp đón tại cơ sở</p><button type="button" onClick={() => setRevision(v => v + 1)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700">Làm mới</button></div>
    {error && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
    <div aria-busy={loading} className="grid gap-4 sm:grid-cols-2">{stats.map(item => <Link key={item.label} href={href(item.tab)} className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-blue-600"><p className="text-sm font-medium text-slate-500">{item.label}</p><p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">{item.value ?? '—'}</p>{!loading && item.value === undefined && <p className="mt-1 text-xs text-slate-400">Chưa có số liệu</p>}</Link>)}</div>
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="text-base font-bold text-slate-900">Thao tác nhanh</h2><div className="mt-3 divide-y divide-slate-100">{[
      ['checkin', 'Check-in lịch hẹn', 'Tiếp nhận người bệnh đã đặt lịch trước.'],
      ['registration', 'Đăng ký khám mới', 'Đăng ký khám và cấp số thứ tự tại quầy.'],
      ['pending-specialty', 'Phân chuyên khoa', 'Chọn chuyên khoa và phòng khám cho lịch hẹn.'],
    ].map(([tab, label, description]) => <Link key={tab} href={href(tab)} className="block rounded-lg px-2 py-4 transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600"><p className="text-sm font-semibold text-blue-700">{label} →</p><p className="mt-1 text-xs text-slate-500">{description}</p></Link>)}</div></section>
  </div>;
}
