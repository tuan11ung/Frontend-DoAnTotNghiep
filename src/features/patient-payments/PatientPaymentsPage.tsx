'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PatientBreadcrumb } from '@/src/shared/components/layout/PatientBreadcrumb';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, RotateCw, Search, Wallet } from 'lucide-react';
import { usePatientNavigation, usePatientToken } from '@/src/features/auth/hooks/use-patient-navigation';
import { usePatientPortalProfiles } from '@/src/features/patient-profile/hooks/use-patient-portal-profiles';
import { PatientProfileSelector } from '@/src/shared/components/PatientProfileSelector';
import { usePayments } from './use-payments';
import { paymentsHref, type BillingProfile } from './payment.types';
import { InvoiceDetail } from './components/InvoiceDetail';
import { InvoiceTable } from './components/InvoiceTable';
import { PaymentHistory } from './components/PaymentHistory';
import { ReceiptDialog } from './components/ReceiptDialog';

export function PatientPaymentsPage() {
  const auth = usePatientNavigation();
  const token = usePatientToken();
  if (!auth.isReady) return <Loading />;
  if (!token) return <div className="mx-auto max-w-xl px-4 py-20 text-center"><Wallet className="mx-auto mb-4 size-12 text-blue-300" /><h1 className="text-2xl font-bold text-slate-900">Hóa đơn &amp; lịch sử thanh toán</h1><p className="mt-3 mb-6 text-sm text-slate-500">Đăng nhập để xem hóa đơn và lịch sử thanh toán của bạn.</p><Link href="/patient/login" className="inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Đăng nhập</Link></div>;
  return <PaymentsWorkspace key={token} token={token} />;
}
function Loading() { return <p role="status" className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Đang tải hóa đơn và giao dịch…</p>; }
const toolbarButton = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600';

function PaymentsWorkspace({ token }: { token: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const { selector } = usePatientPortalProfiles(params.get('profile'));
  const profile = selector.profiles?.find(item => item.id === selector.selectedId);
  const tab = params.get('tab') === 'history' ? 'history' : 'invoices';
  return <div data-payments-workspace>
    <div className="border-b border-slate-200 bg-white">
      <PatientBreadcrumb current="Hóa đơn & lịch sử thanh toán" className="mx-auto w-full max-w-5xl px-4 py-3.5 sm:px-6" />
    </div>
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Hóa đơn &amp; lịch sử thanh toán</h1>
      <PatientProfileSelector {...selector} onChange={id => router.push(paymentsHref(id, { tab }))} />
      {profile && <PaymentsContent key={profile.id} token={token} profile={profile} />}
    </div>
  </div>;
}

function PaymentsContent({ token, profile }: { token: string; profile: BillingProfile }) {
  const router = useRouter(); const params = useSearchParams();
  const { data, error, retry } = usePayments(token, profile.id);
  const [filter, setFilter] = useState('ALL'); const [query, setQuery] = useState(''); const [showFilters, setShowFilters] = useState(false);
  const [invoicePage, setInvoicePage] = useState(0);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  if (error) return <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"><p role="alert" className="text-sm text-rose-800">{error}</p><button type="button" onClick={retry} className={toolbarButton}>Thử lại</button></div>;
  if (!data) return <Loading />;
  const invoiceParam = params.get('invoice'); const encounterParam = params.get('encounter'); const appointmentParam = params.get('appointment');
  const invoices = data.invoices.filter(i => i.profileId === profile.id && (encounterParam === null || i.encounterId === encounterParam) && (appointmentParam === null || i.appointmentId === appointmentParam));
  const transactions = data.transactions.filter(t => t.profileId === profile.id && invoices.some(i => i.id === t.invoiceId));
  const filtered = invoices.filter(i => (filter === 'ALL' || filter === i.status) && `${i.code} ${i.encounterCode} ${i.facility}`.toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN')));
  const selected = invoiceParam !== null ? invoices.find(i => i.id === invoiceParam && (encounterParam === null || i.encounterId === encounterParam)) : undefined;
  const tab = params.get('tab') === 'history' ? 'history' : 'invoices';
  const receipt = transactions.find(t => t.id === receiptId && t.status === 'SUCCESS'); const receiptInvoice = invoices.find(i => i.id === receipt?.invoiceId);
  const closeInvoice = () => router.replace(paymentsHref(profile.id, { tab, encounter: encounterParam ?? undefined, appointment: appointmentParam ?? undefined }), { scroll: false });
  return <div className="min-w-0">
    {appointmentParam && <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">Hóa đơn của lịch hẹn {invoices.find(invoice=>invoice.appointmentCode)?.appointmentCode ?? `#${appointmentParam}`}. Khi đã trả tiền khám, bạn chỉ cần check-in và chờ gọi tại bệnh viện. <Link className="font-bold text-blue-700 underline" href={paymentsHref(profile.id,{tab})}>Xem tất cả lịch khám</Link></p>}
    {encounterParam && <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">Các hóa đơn tiền khám và từng đợt CLS của lượt khám #{encounterParam}. <Link className="font-bold text-blue-700 underline" href={paymentsHref(profile.id,{tab})}>Xem tất cả lượt khám</Link></p>}
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <nav aria-label="Quản lý thanh toán" className="mb-5 flex gap-6 border-b border-slate-200">{[{ id: 'invoices', label: 'Hóa đơn lượt khám' }, { id: 'history', label: 'Lịch sử thanh toán' }].map(item => <Link key={item.id} href={paymentsHref(profile.id, { tab: item.id, encounter: encounterParam ?? undefined, appointment: appointmentParam ?? undefined })} aria-current={tab === item.id ? 'page' : undefined} className={`border-b-2 pb-3 text-xs font-semibold ${tab === item.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{item.label}</Link>)}</nav>
      {tab === 'history' ? <PaymentHistory transactions={transactions} invoices={invoices} profileName={profile.name} onReceipt={setReceiptId} onReload={retry} /> : <>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-semibold text-slate-800">Danh sách hóa đơn</h2><div className="flex w-full flex-wrap items-center gap-2 sm:w-auto"><div className="relative w-full sm:w-64"><Search className="pointer-events-none absolute top-2.5 right-3 size-4 text-slate-400" /><input aria-label="Tìm hóa đơn" placeholder="Tìm mã HĐ, lượt khám, cơ sở…" value={query} onChange={e => { setQuery(e.target.value); setInvoicePage(0); }} className="min-h-9 w-full rounded border border-slate-200 py-2 pr-9 pl-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></div><button type="button" aria-expanded={showFilters} aria-controls="invoice-filters" onClick={() => setShowFilters(value => !value)} className={`${toolbarButton} ${filter !== 'ALL' ? 'border-blue-300 text-blue-700' : ''}`}><Filter className="size-3.5" />Bộ lọc{filter !== 'ALL' && <span className="rounded bg-blue-50 px-1">1</span>}</button><button type="button" onClick={retry} className={toolbarButton}><RotateCw className="size-3.5" />Tải lại</button><span role="status" className="inline-flex min-h-9 items-center gap-2 rounded border border-slate-200 px-3 text-xs text-slate-500">Tổng số: <strong className="text-sm text-rose-600">{filtered.length}</strong></span></div></div>
        {showFilters && <div id="invoice-filters" className="mb-4 flex flex-wrap items-center gap-3 rounded border border-slate-200 bg-slate-50 p-3"><label htmlFor="invoice-status" className="text-xs text-slate-600">Trạng thái</label><select id="invoice-status" value={filter} onChange={e => { setFilter(e.target.value); setInvoicePage(0); }} className="rounded border border-slate-200 bg-white px-3 py-2 text-xs"><option value="ALL">Tất cả</option><option value="UNPAID">Chưa thanh toán</option><option value="PAID">Đã thanh toán đủ</option><option value="CANCELLED">Đã hủy</option></select><button type="button" onClick={() => { setInvoicePage(0); setFilter('ALL'); setQuery(''); }} className="text-xs font-medium text-blue-600 hover:underline">Xóa bộ lọc</button></div>}
        <InvoiceTable key={JSON.stringify([encounterParam, appointmentParam])} pageIndex={invoicePage} setPageIndex={setInvoicePage} invoices={filtered} profileId={profile.id} encounterId={encounterParam ?? undefined} appointmentId={appointmentParam ?? undefined} />
        <p className="mt-3 text-[11px] leading-6 text-slate-400">Chọn biểu tượng ở cột Thao tác hoặc mã hóa đơn để xem chi tiết. Trên điện thoại, vuốt ngang để xem toàn bộ bảng.</p>
        {invoiceParam !== null && !selected && <div role="status" className="mt-4 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Không tìm thấy hóa đơn của lượt khám trong hồ sơ đang chọn. <button type="button" onClick={closeInvoice} className="font-semibold underline">Về danh sách hóa đơn</button></div>}
      </>}
    </section>
    {selected && tab === 'invoices' && !receipt && <InvoiceDetail key={selected.id} invoice={selected} profile={profile} transactions={transactions} onReceipt={setReceiptId} onClose={closeInvoice} />}
    {receipt && receiptInvoice && <ReceiptDialog key={receipt.id} invoice={receiptInvoice} transaction={receipt} profile={profile} onClose={() => setReceiptId(null)} />}
  </div>;
}
