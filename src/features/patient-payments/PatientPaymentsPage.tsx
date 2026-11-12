'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, Filter, Home, RotateCw, Search, Wallet, Users } from 'lucide-react';
import { usePatientNavigation } from '@/src/features/auth/hooks/use-patient-navigation';
import { AUTH_STORAGE_KEY, getStoredPatientToken } from '@/src/features/auth/utils/auth-storage';
import { usePayments } from './use-payments';
import { beginDemoPayment } from './payment-demo';
import { paymentsHref, type PaymentMethod } from './payment.types';
import { InvoiceDetail } from './components/InvoiceDetail';
import { InvoiceTable } from './components/InvoiceTable';
import { PaymentHistory } from './components/PaymentHistory';
import { CheckoutDialog } from './components/CheckoutDialog';
import { ReceiptDialog } from './components/ReceiptDialog';

function subscribeAuth(callback: () => void) { const listener = (event: StorageEvent) => { if (event.key === AUTH_STORAGE_KEY || event.key === null) callback(); }; window.addEventListener('storage', listener); return () => window.removeEventListener('storage', listener); }
export function PatientPaymentsPage() {
  const auth = usePatientNavigation(); const params = useSearchParams();
  const token = useSyncExternalStore(subscribeAuth, getStoredPatientToken, () => null);
  if (!auth.isReady) return <Loading />;
  if (!auth.isAuthenticated) return <div className="mx-auto max-w-xl px-4 py-20 text-center"><Wallet className="mx-auto mb-4 size-12 text-blue-300" /><h1 className="text-2xl font-bold text-slate-900">Thanh toán &amp; hóa đơn</h1><p className="mt-3 mb-6 text-sm text-slate-500">Đăng nhập để xem hóa đơn và lịch sử thanh toán của bạn.</p><Link href="/patient/login" className="inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Đăng nhập</Link></div>;
  return <PaymentsContent key={`${auth.isPreview ? 'preview' : token}:${params.get('profile') ?? 'default'}`} isPreview={auth.isPreview} token={token} requestedProfile={params.get('profile')} />;
}
function Loading() { return <p role="status" className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500">Đang tải hóa đơn và giao dịch…</p>; }
const toolbarButton = 'inline-flex min-h-9 items-center justify-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600';

function PaymentsContent({ isPreview, token, requestedProfile }: { isPreview: boolean; token: string | null; requestedProfile: string | null }) {
  const router = useRouter(); const params = useSearchParams();
  const { data, profileId, error, retry } = usePayments(isPreview, token, requestedProfile);
  const [filter, setFilter] = useState('ALL'); const [query, setQuery] = useState(''); const [showFilters, setShowFilters] = useState(false);
  const [busy, setBusy] = useState(false); const [actionError, setActionError] = useState('');
  const [paymentId, setPaymentId] = useState<string | null>(null); const [receiptId, setReceiptId] = useState<string | null>(null);
  if (error) return <div className="mx-auto max-w-xl space-y-4 px-4 py-20 text-center"><h1 className="text-2xl font-bold text-slate-900">Thanh toán &amp; hóa đơn</h1><p role="alert" className="text-sm text-rose-600">{error}</p><button type="button" onClick={retry} className={toolbarButton}>Thử lại</button></div>;
  if (!data) return <Loading />;
  const profile = data.profiles.find(p => p.id === profileId);
  if (!profile) return <div className="mx-auto max-w-xl space-y-4 px-4 py-20 text-center"><h1 className="text-xl font-bold">Không tìm thấy hồ sơ thanh toán</h1><p className="text-sm text-slate-500">Hồ sơ không tồn tại hoặc không thuộc tài khoản hiện tại.</p><Link href="/patient/payments" className="text-sm font-semibold text-blue-600">Về danh sách hóa đơn</Link></div>;
  const invoices = data.invoices.filter(i => i.profileId === profile.id);
  const transactions = data.transactions.filter(t => t.profileId === profile.id && invoices.some(i => i.id === t.invoiceId));
  const filtered = invoices.filter(i => (filter === 'ALL' || filter === i.status) && `${i.code} ${i.encounterCode} ${i.facility}`.toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN')));
  const invoiceParam = params.get('invoice'); const encounterParam = params.get('encounter');
  const selected = invoiceParam !== null ? invoices.find(i => i.id === invoiceParam && (encounterParam === null || i.encounterId === encounterParam)) : encounterParam !== null ? invoices.find(i => i.encounterId === encounterParam) : undefined;
  const tab = params.get('tab') === 'history' ? 'history' : 'invoices';
  const payment = transactions.find(t => t.id === paymentId); const paymentInvoice = invoices.find(i => i.id === payment?.invoiceId);
  const receipt = transactions.find(t => t.id === receiptId && t.status === 'SUCCESS'); const receiptInvoice = invoices.find(i => i.id === receipt?.invoiceId);
  async function pay(method: PaymentMethod) {
    if (!isPreview || !selected || !profile || busy) return;
    setBusy(true); setActionError('');
    try { setPaymentId(await beginDemoPayment(profile.id, selected.id, method)); }
    catch (e) { setActionError(e instanceof Error ? e.message : 'Không thể tạo giao dịch.'); }
    finally { setBusy(false); }
  }
  const closeInvoice = () => { setActionError(''); router.replace(paymentsHref(profile.id, { tab }), { scroll: false }); };
  return <div data-payments-workspace className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
    <nav aria-label="Đường dẫn" className="mb-5 flex items-center gap-2 text-xs text-slate-400"><Link href="/" className="inline-flex items-center gap-1 hover:text-blue-600"><Home className="size-3.5" />Trang chủ</Link><ChevronRight className="size-3.5" /><span>Thanh toán &amp; hóa đơn</span></nav>
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Thanh toán &amp; hóa đơn</h1><p className="mt-2 text-sm text-slate-500">Tra cứu chi phí lượt khám, thanh toán và biên lai điện tử.</p></div><div className="w-full sm:w-72"><label htmlFor="payment-profile" className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500"><Users className="size-3.5" />Hồ sơ thanh toán</label><select id="payment-profile" disabled={busy} value={profile.id} onChange={e => router.push(paymentsHref(e.target.value, { tab }))} className="w-full rounded border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">{data.profiles.map(p => <option key={p.id} value={p.id}>{p.relationship}: {p.name}</option>)}</select></div></div>
    {isPreview && <p role="note" className="mb-5 rounded border border-blue-100 bg-blue-50 px-4 py-2.5 text-xs leading-6 text-blue-700"><strong>Thanh toán mô phỏng.</strong> Hóa đơn và biên lai là dữ liệu mẫu, không thu tiền thật.</p>}
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <nav aria-label="Quản lý thanh toán" className="mb-5 flex gap-6 border-b border-slate-200">{[{ id: 'invoices', label: 'Hóa đơn lượt khám' }, { id: 'history', label: 'Lịch sử thanh toán' }].map(item => <Link key={item.id} href={paymentsHref(profile.id, { tab: item.id })} aria-current={tab === item.id ? 'page' : undefined} className={`border-b-2 pb-3 text-xs font-semibold ${tab === item.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{item.label}</Link>)}</nav>
      {tab === 'history' ? <PaymentHistory transactions={transactions} invoices={invoices} profileName={profile.name} isPreview={isPreview} onReceipt={setReceiptId} onReload={retry} /> : <>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-semibold text-slate-800">Danh sách hóa đơn</h2><div className="flex w-full flex-wrap items-center gap-2 sm:w-auto"><div className="relative w-full sm:w-64"><Search className="pointer-events-none absolute top-2.5 right-3 size-4 text-slate-400" /><input aria-label="Tìm hóa đơn" placeholder="Tìm mã HĐ, lượt khám, cơ sở…" value={query} onChange={e => setQuery(e.target.value)} className="min-h-9 w-full rounded border border-slate-200 py-2 pr-9 pl-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></div><button type="button" aria-expanded={showFilters} aria-controls="invoice-filters" onClick={() => setShowFilters(value => !value)} className={`${toolbarButton} ${filter !== 'ALL' ? 'border-blue-300 text-blue-700' : ''}`}><Filter className="size-3.5" />Bộ lọc{filter !== 'ALL' && <span className="rounded bg-blue-50 px-1">1</span>}</button><button type="button" onClick={retry} className={toolbarButton}><RotateCw className="size-3.5" />Tải lại</button><span role="status" className="inline-flex min-h-9 items-center gap-2 rounded border border-slate-200 px-3 text-xs text-slate-500">Tổng số: <strong className="text-sm text-rose-600">{filtered.length}</strong></span></div></div>
        {showFilters && <div id="invoice-filters" className="mb-4 flex flex-wrap items-center gap-3 rounded border border-slate-200 bg-slate-50 p-3"><label htmlFor="invoice-status" className="text-xs text-slate-600">Trạng thái</label><select id="invoice-status" value={filter} onChange={e => setFilter(e.target.value)} className="rounded border border-slate-200 bg-white px-3 py-2 text-xs"><option value="ALL">Tất cả</option><option value="UNPAID">Chưa thanh toán</option><option value="PAID">Đã thanh toán đủ</option></select><button type="button" onClick={() => { setFilter('ALL'); setQuery(''); }} className="text-xs font-medium text-blue-600 hover:underline">Xóa bộ lọc</button></div>}
        <InvoiceTable invoices={filtered} profileId={profile.id} />
        <p className="mt-3 text-[11px] leading-6 text-slate-400">Chọn biểu tượng ở cột Thao tác hoặc mã hóa đơn để xem chi tiết. Trên điện thoại, vuốt ngang để xem toàn bộ bảng.</p>
        {(invoiceParam !== null || encounterParam !== null) && !selected && <div role="status" className="mt-4 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Không tìm thấy hóa đơn của lượt khám trong hồ sơ đang chọn. <button type="button" onClick={closeInvoice} className="font-semibold underline">Về danh sách hóa đơn</button></div>}
      </>}
    </section>
    {selected && tab === 'invoices' && !payment && !receipt && <InvoiceDetail key={selected.id} invoice={selected} profile={profile} transactions={transactions} isPreview={isPreview} busy={busy} error={actionError} onPay={pay} onReceipt={setReceiptId} onClose={closeInvoice} />}
    {payment && paymentInvoice && isPreview && <CheckoutDialog key={payment.id} invoice={paymentInvoice} transaction={payment} profile={profile} onClose={() => setPaymentId(null)} onSuccess={() => { setPaymentId(null); setReceiptId(payment.id); }} />}
    {receipt && receiptInvoice && <ReceiptDialog key={receipt.id} invoice={receiptInvoice} transaction={receipt} profile={profile} isPreview={isPreview} onClose={() => setReceiptId(null)} />}
  </div>;
}
