'use client';
import { useEffect, useMemo, useState } from 'react';
import { ClinicalApiError, clinicalRequest, type ApiPage } from '@/src/shared/lib/clinical-api';
import { getStoredAuthSession } from '@/src/features/auth/auth-storage';
import type { PrescriptionDraft } from './api/consultation-api';
import { clinicalButton, clinicalCard, clinicalField } from './components/clinical-ui';

interface Medicine { id: number; medicineName: string; strength?: string; form?: string; route?: string; total: number }
interface Item { hospitalMedicineId: number; medicineName: string; quantity: number; dosage: string; usageInstruction: string; durationDays: number; total: number }
interface Prescription { id: number; note?: string; prescriptedDate: string; medicines: { id: number; medicineName: string; strength?: string; quantity: number; dosage: string; usageInstruction?: string; durationDays?: number }[] }

export function clearPrescriptionDraft(encounterId: number) {
  const session = getStoredAuthSession();
  if (!session || typeof window === 'undefined') return;
  try { sessionStorage.removeItem(`medconnect.rx-draft:${session.hospitalId}:${session.staffId}:${encounterId}`); }
  catch { /* The clinical workspace must still close when browser storage is unavailable. */ }
}

export function DoctorPrescriptionLive({ encounterId, editable, disabled = false, onDraftChange }: { encounterId: number; editable: boolean; disabled?: boolean; onDraftChange?: (draft: PrescriptionDraft | undefined, ready: boolean) => void }) {
  const [saved, setSaved] = useState<Prescription | null>(null); const [loaded, setLoaded] = useState(false);
  const [catalogue, setCatalogue] = useState<ApiPage<Medicine> | null>(null); const [keyword, setKeyword] = useState(''); const [query, setQuery] = useState(''); const [page, setPage] = useState(0);
  const [items, setItems] = useState<Item[]>([]); const [note, setNote] = useState('');
  const [error, setError] = useState(''); const [restored, setRestored] = useState(false);
  const [storageError, setStorageError] = useState('');
  const session = getStoredAuthSession();
  const draftKey = `medconnect.rx-draft:${session?.hospitalId}:${session?.staffId}:${encounterId}`;
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
    if (!active) return;
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (raw && editable) {
        const data = JSON.parse(raw);
        if (!Array.isArray(data.items) || data.items.length > 100 || typeof data.note !== 'string'
            || data.items.some((i: Item) => !Number.isSafeInteger(i.hospitalMedicineId) || typeof i.medicineName !== 'string' || typeof i.dosage !== 'string' || typeof i.usageInstruction !== 'string')) throw new Error();
        setItems(data.items); setNote(data.note);
      }
    } catch { setStorageError('Không thể khôi phục bản nháp đơn thuốc. Vui lòng kiểm tra lại các thuốc trước khi hoàn tất.'); }
    setRestored(true);
    });
    return () => { active = false; };
  }, [draftKey, editable]);
  useEffect(() => {
    if (!restored) return;
    try {
      if (!editable || saved || (!items.length && !note)) sessionStorage.removeItem(draftKey);
      else sessionStorage.setItem(draftKey, JSON.stringify({ items, note }));
    } catch { queueMicrotask(() => setStorageError('Trình duyệt không lưu được nháp khi tải lại trang. Hãy giữ màn khám này mở đến khi hoàn tất.')); }
  }, [draftKey, editable, restored, saved, items, note]);
  const invalidDraft = items.length > 100 || note.length > 500 || (!items.length && !!note.trim()) || items.some(i =>
    !Number.isSafeInteger(i.quantity) || i.quantity < 1 || i.quantity > 2147483647 ||
    !Number.isSafeInteger(i.durationDays) || i.durationDays < 1 || i.durationDays > 2147483647 ||
    !i.dosage.trim() || i.dosage.length > 255 || i.usageInstruction.length > 300);
  const draft = useMemo<PrescriptionDraft | undefined>(() => !items.length || saved ? undefined : ({ note: note.trim(), medicines: items.map(i => ({ hospitalMedicineId: i.hospitalMedicineId, quantity: i.quantity, dosage: i.dosage.trim(), usageInstruction: i.usageInstruction.trim(), durationDays: i.durationDays })) }), [items, note, saved]);
  useEffect(() => { onDraftChange?.(draft, loaded && restored && !error && !invalidDraft); }, [draft, loaded, restored, error, invalidDraft, onDraftChange]);
  useEffect(() => {
    const controller = new AbortController();
    clinicalRequest<Prescription>('prescriptions/detail', { encounterId }, controller.signal).then(p => { if (!controller.signal.aborted) { setSaved(p); setLoaded(true); setError(''); } }).catch(e => {
      if (controller.signal.aborted) return;
      if (e instanceof ClinicalApiError && e.status === 404) { setSaved(null); setLoaded(true); }
      else setError(e instanceof Error ? e.message : 'Không thể đọc đơn thuốc.');
    });
    return () => controller.abort();
  }, [encounterId]);
  useEffect(() => {
    if (!editable || !loaded || saved) return;
    const controller = new AbortController();
    clinicalRequest<ApiPage<Medicine>>('hospital-medicines/search', { keyword: query, pageable: { page, size: 20 } }, controller.signal).then(data => { if (!controller.signal.aborted) setCatalogue(data); }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không tải được danh mục thuốc.'); });
    return () => controller.abort();
  }, [editable, loaded, saved, query, page]);
  return <section className={clinicalCard}><h2 className="text-lg font-bold">Đơn thuốc</h2>
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}{storageError && <p role="status" className="text-sm text-amber-800">{storageError}</p>}
    {!loaded && !error && <p role="status">Đang tải đơn thuốc…</p>}
    {saved ? <><p className="text-sm text-slate-500">Đơn #{saved.id} · {new Date(saved.prescriptedDate).toLocaleString('vi-VN')} · Đã lưu</p>{saved.note && <p className="whitespace-pre-wrap text-sm">{saved.note}</p>}<ul className="divide-y">{saved.medicines.map(m => <li key={m.id} className="space-y-1 py-3 text-sm"><h3 className="font-bold">{m.medicineName} {m.strength}</h3><p>Số lượng: {m.quantity} · {m.durationDays ? `${m.durationDays} ngày` : 'Theo chỉ dẫn'}</p><p>Liều dùng: {m.dosage}</p>{m.usageInstruction && <p>Cách dùng: {m.usageInstruction}</p>}</li>)}</ul></> : loaded && !editable ? <><p className="text-sm text-slate-500">{items.length ? 'Đơn thuốc đã lưu cùng lượt khám.' : 'Lượt khám chưa có đơn thuốc.'}</p><ul>{items.map(i => <li key={i.hospitalMedicineId} className="py-2 text-sm">{i.medicineName} · {i.quantity} · {i.dosage}</li>)}</ul></> : loaded && <>
      <p className="text-sm text-slate-500">Đơn thuốc đang được soạn nháp. Bạn có thể sửa hoặc bỏ thuốc; đơn chỉ được lưu khi xác nhận hoàn tất lượt khám.</p>
      <form className="flex gap-3" onSubmit={e => { e.preventDefault(); setQuery(keyword.trim()); setPage(0); }}><label className="min-w-0 flex-1 text-sm font-bold">Tìm thuốc trong cơ sở<input className={clinicalField} maxLength={255} value={keyword} onChange={e => setKeyword(e.target.value)} /></label><button type="submit" className={`${clinicalButton} self-end`}>Tìm</button></form>
      <ul className="max-h-64 divide-y overflow-auto">{catalogue?.content.map(m => <li key={m.id} className="flex items-center justify-between gap-3 py-3 text-sm"><div><p className="font-bold">{m.medicineName} {m.strength}</p><p>{[m.form, m.route].filter(Boolean).join(' · ')} · Tồn: {m.total}</p></div><button type="button" disabled={disabled || items.length >= 100 || items.some(i => i.hospitalMedicineId === m.id)} className="font-bold text-blue-700 disabled:text-slate-400" onClick={() => { setItems(v => [...v, { hospitalMedicineId: m.id, medicineName: [m.medicineName, m.strength].filter(Boolean).join(' '), total: m.total, quantity: 1, dosage: '', usageInstruction: '', durationDays: 1 }]); }}>Thêm</button></li>)}</ul>
      {catalogue?.content.length === 0 && <p className="text-sm">Không tìm thấy thuốc phù hợp.</p>}{catalogue && <div className="flex gap-4 text-sm"><button type="button" disabled={!page} onClick={() => setPage(v => v - 1)}>Trang trước</button><span>{page + 1}/{Math.max(1, catalogue.totalPages)}</span><button type="button" disabled={catalogue.last} onClick={() => setPage(v => v + 1)}>Trang sau</button></div>}
      <div className="space-y-4"><fieldset disabled={!editable || disabled} className="space-y-4">{items.map((item, index) => <div key={item.hospitalMedicineId} className="space-y-3 rounded-xl border p-4"><div className="flex justify-between gap-3"><h3 className="font-bold">{item.medicineName}</h3><button type="button" className="text-sm text-rose-700" onClick={() => { setItems(v => v.filter((_, i) => i !== index)); }}>Bỏ thuốc</button></div>{item.quantity > item.total && <p className="text-sm text-amber-800">Số lượng kê vượt tồn kho ({item.total}); cần thông báo người bệnh.</p>}<div className="grid gap-3 sm:grid-cols-2">{(['quantity', 'durationDays', 'dosage', 'usageInstruction'] as const).map(key => <label key={key} className="text-sm font-semibold">{{ quantity: 'Số lượng', durationDays: 'Số ngày', dosage: 'Liều dùng', usageInstruction: 'Hướng dẫn sử dụng' }[key]}<input required={key !== 'usageInstruction'} type={key === 'quantity' || key === 'durationDays' ? 'number' : 'text'} min={1} step={1} max={key === 'quantity' || key === 'durationDays' ? 2147483647 : undefined} maxLength={key === 'dosage' ? 255 : 300} className={clinicalField} value={item[key]} onChange={e => setItems(v => v.map((m, i) => i === index ? { ...m, [key]: key === 'quantity' || key === 'durationDays' ? Number(e.target.value) : e.target.value } : m))} /></label>)}</div></div>)}<label className="block text-sm font-bold">Lời dặn<textarea className={clinicalField} maxLength={500} value={note} onChange={e => setNote(e.target.value)} /></label>{invalidDraft && <p role="alert" className="text-sm text-amber-800">Kiểm tra số lượng, số ngày, liều dùng cho từng thuốc. Lời dặn cần đi cùng ít nhất một thuốc.</p>}<p role="status" className="text-sm text-slate-500">{items.length ? `${items.length} thuốc trong bản nháp · Lưu cùng lúc hoàn tất khám` : 'Chưa kê thuốc cho lượt khám này.'}</p></fieldset></div>
    </>}
  </section>;
}
