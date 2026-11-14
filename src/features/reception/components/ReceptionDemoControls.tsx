'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { completePreviewEncounter, pendingPreviewEncounters, previewDate, RECEPTION_PREVIEW_EVENT, RECEPTION_PREVIEW_KEY, resetReceptionPreview } from '../api/reception-preview-api';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import { ReceptionDialog } from './ReceptionDialog';

export function ReceptionDemoControls({ onReset }: { onReset: () => void }) {
  const [cases, setCases] = useState<ReturnType<typeof pendingPreviewEncounters>>([]);
  const [date, setDate] = useState('');
  const [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [resetting, setResetting] = useState(false), [busy, setBusy] = useState(false);
  useEffect(() => {
    function refresh() { try { setCases(pendingPreviewEncounters()); setDate(previewDate()); setError(''); } catch (e) { setError(e instanceof Error ? e.message : 'Không đọc được dữ liệu demo.'); } }
    const storage = (e: StorageEvent) => { if (e.key === RECEPTION_PREVIEW_KEY || e.key === null) refresh(); };
    refresh(); window.addEventListener(RECEPTION_PREVIEW_EVENT, refresh); window.addEventListener('storage', storage);
    return () => { window.removeEventListener(RECEPTION_PREVIEW_EVENT, refresh); window.removeEventListener('storage', storage); };
  }, []);
  async function complete(id: number) {
    if (busy) return; setBusy(true); setError('');
    try { const code = await completePreviewEncounter(id); setNotice('Đã mô phỏng khám xong. Vào Thanh toán để tìm hóa đơn ' + code + '.'); onReset(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không thể hoàn tất ca demo.'); }
    finally { setBusy(false); }
  }
  return <aside aria-label="Công cụ thử luồng lễ tân" className="mb-6 space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
    <div className="flex flex-wrap items-center justify-between gap-3"><p><strong>Chế độ demo</strong> · Ngày làm việc: {date ? formatDisplayDate(date) : '—'}</p><div className="flex flex-wrap gap-4"><button type="button" onClick={() => setResetting(true)} className="font-bold underline">Khôi phục dữ liệu demo</button><Link href="/reception" className="font-bold underline">Dùng backend</Link></div></div>
    <p>Cùng giao diện thật, dùng dữ liệu giả trên trình duyệt. Không gửi SMS/email, gọi API hoặc thu tiền thật.</p>
    <p className="text-xs leading-6">Tra cứu BN0001, BN0002 hoặc BN0003. Check-in AP-1001; phân chuyên khoa AP-1002. AP-1003 đã hủy, AP-1004 đã check-in, AP-1005 khác ngày. Hóa đơn mẫu HD-4001.</p>
    {cases.length > 0 && <div className="border-t border-amber-200 pt-3"><p className="mb-2 text-xs">Giả lập bước bác sĩ khám xong để tiếp tục thử thanh toán:</p><div className="flex flex-wrap gap-2">{cases.map(e => <button key={e.id} type="button" disabled={busy} onClick={() => void complete(e.id)} className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-50">Hoàn tất ca demo {e.code} · {e.patientName}</button>)}</div></div>}
    {error && <p role="alert" className="text-rose-800">{error}</p>}{notice && <p role="status">{notice}</p>}
    {resetting && <ReceptionDialog title="Khôi phục dữ liệu demo?" onClose={() => setResetting(false)}><p className="text-sm leading-6">Các hồ sơ, lịch hẹn và khoản thu demo sẽ trở về bộ mẫu ban đầu. Dữ liệu backend và phiên đăng nhập được giữ nguyên.</p><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setResetting(false)} className="rounded-lg border px-4 py-2 text-sm">Hủy</button><button type="button" onClick={() => { try { resetReceptionPreview(); setNotice('Đã khôi phục bộ dữ liệu mẫu.'); setResetting(false); onReset(); } catch { setResetting(false); setError('Không thể lưu dữ liệu demo. Vui lòng kiểm tra quyền lưu trữ của trình duyệt.'); } }} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white">Xác nhận khôi phục</button></div></ReceptionDialog>}
  </aside>;
}
