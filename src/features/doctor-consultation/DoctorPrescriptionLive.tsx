'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ClinicalApiError, clinicalRequest, clinicalResponse, type ApiPage } from '@/src/shared/lib/clinical-api';
import { clinicalButton, clinicalCard, clinicalField } from './components/clinical-ui';

interface Medicine { id: number; medicineName: string; strength?: string; form?: string; route?: string; total: number }
interface Item { hospitalMedicineId: number; medicineName: string; quantity: number; dosage: string; usageInstruction: string; durationDays: number; total: number }
interface Prescription { id: number; note?: string; prescriptedDate: string; medicines: { id: number; medicineName: string; strength?: string; quantity: number; dosage: string; usageInstruction?: string; durationDays?: number }[] }

export function DoctorPrescriptionLive({ encounterId, editable, onDirtyChange }: { encounterId: number; editable: boolean; onDirtyChange?: (dirty: boolean) => void }) {
  const [saved, setSaved] = useState<Prescription | null>(null); const [loaded, setLoaded] = useState(false);
  const [catalogue, setCatalogue] = useState<ApiPage<Medicine> | null>(null); const [keyword, setKeyword] = useState(''); const [query, setQuery] = useState(''); const [page, setPage] = useState(0);
  const [items, setItems] = useState<Item[]>([]); const [note, setNote] = useState(''); const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [revision, setRevision] = useState(0); const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    clinicalRequest<Prescription>('prescriptions/detail', { encounterId }, controller.signal).then(p => { if (!controller.signal.aborted) { setSaved(p); setLoaded(true); setError(''); } }).catch(e => {
      if (controller.signal.aborted) return;
      if (e instanceof ClinicalApiError && e.status === 404) { setSaved(null); setLoaded(true); }
      else setError(e instanceof Error ? e.message : 'Không thể đọc đơn thuốc.');
    });
    return () => controller.abort();
  }, [encounterId, revision]);
  useEffect(() => {
    if (!editable || !loaded || saved) return;
    const controller = new AbortController();
    clinicalRequest<ApiPage<Medicine>>('hospital-medicines/search', { keyword: query, pageable: { page, size: 20 } }, controller.signal).then(data => { if (!controller.signal.aborted) setCatalogue(data); }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không tải được danh mục thuốc.'); });
    return () => controller.abort();
  }, [editable, loaded, saved, query, page]);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (lock.current || !items.length) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const result = await clinicalResponse<Prescription>('prescriptions/create', { encounterId, note: note.trim(), medicines: items.map(i => ({ hospitalMedicineId: i.hospitalMedicineId, quantity: i.quantity, dosage: i.dosage.trim(), usageInstruction: i.usageInstruction.trim(), durationDays: i.durationDays })) });
      setSaved(result.data); onDirtyChange?.(false); setWarnings(result.warnings?.map(w => w.message) ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể lưu đơn thuốc.'); setRevision(v => v + 1); }
    finally { lock.current = false; setBusy(false); }
  }
  return <section className={clinicalCard}><h2 className="text-lg font-bold">Đơn thuốc</h2>
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}{warnings.map((w, i) => <p role="status" key={i} className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{w}</p>)}
    {!loaded && !error && <p role="status">Đang tải đơn thuốc…</p>}
    {saved ? <><p className="text-sm text-slate-500">Đơn #{saved.id} · {new Date(saved.prescriptedDate).toLocaleString('vi-VN')} · Đã lưu</p>{saved.note && <p className="whitespace-pre-wrap text-sm">{saved.note}</p>}<ul className="divide-y">{saved.medicines.map(m => <li key={m.id} className="space-y-1 py-3 text-sm"><h3 className="font-bold">{m.medicineName} {m.strength}</h3><p>Số lượng: {m.quantity} · {m.durationDays ? `${m.durationDays} ngày` : 'Theo chỉ dẫn'}</p><p>Liều dùng: {m.dosage}</p>{m.usageInstruction && <p>Cách dùng: {m.usageInstruction}</p>}</li>)}</ul></> : loaded && !editable ? <p className="text-sm text-slate-500">Lượt khám chưa có đơn thuốc.</p> : loaded && <>
      <p className="text-sm text-slate-500">Mỗi lượt khám lưu một đơn. Kiểm tra thuốc, hàm lượng và liều dùng trước khi xác nhận; lưu đơn không trừ tồn kho.</p>
      <form className="flex gap-3" onSubmit={e => { e.preventDefault(); setQuery(keyword.trim()); setPage(0); }}><label className="min-w-0 flex-1 text-sm font-bold">Tìm thuốc trong cơ sở<input className={clinicalField} maxLength={255} value={keyword} onChange={e => setKeyword(e.target.value)} /></label><button type="submit" className={`${clinicalButton} self-end`}>Tìm</button></form>
      <ul className="max-h-64 divide-y overflow-auto">{catalogue?.content.map(m => <li key={m.id} className="flex items-center justify-between gap-3 py-3 text-sm"><div><p className="font-bold">{m.medicineName} {m.strength}</p><p>{[m.form, m.route].filter(Boolean).join(' · ')} · Tồn: {m.total}</p></div><button type="button" disabled={busy || items.some(i => i.hospitalMedicineId === m.id)} className="font-bold text-blue-700 disabled:text-slate-400" onClick={() => { onDirtyChange?.(true); setItems(v => [...v, { hospitalMedicineId: m.id, medicineName: [m.medicineName, m.strength].filter(Boolean).join(' '), total: m.total, quantity: 1, dosage: '', usageInstruction: '', durationDays: 1 }]); }}>Thêm</button></li>)}</ul>
      {catalogue?.content.length === 0 && <p className="text-sm">Không tìm thấy thuốc phù hợp.</p>}{catalogue && <div className="flex gap-4 text-sm"><button type="button" disabled={!page} onClick={() => setPage(v => v - 1)}>Trang trước</button><span>{page + 1}/{Math.max(1, catalogue.totalPages)}</span><button type="button" disabled={catalogue.last} onClick={() => setPage(v => v + 1)}>Trang sau</button></div>}
      <form className="space-y-4" onSubmit={submit}><fieldset disabled={busy} className="space-y-4">{items.map((item, index) => <div key={item.hospitalMedicineId} className="space-y-3 rounded-xl border p-4"><div className="flex justify-between gap-3"><h3 className="font-bold">{item.medicineName}</h3><button type="button" className="text-sm text-rose-700" onClick={() => { onDirtyChange?.(items.length > 1); setItems(v => v.filter((_, i) => i !== index)); }}>Bỏ thuốc</button></div>{item.quantity > item.total && <p className="text-sm text-amber-800">Số lượng kê vượt tồn kho ({item.total}); cần thông báo người bệnh.</p>}<div className="grid gap-3 sm:grid-cols-2">{(['quantity', 'durationDays', 'dosage', 'usageInstruction'] as const).map(key => <label key={key} className="text-sm font-semibold">{{ quantity: 'Số lượng', durationDays: 'Số ngày', dosage: 'Liều dùng', usageInstruction: 'Hướng dẫn sử dụng' }[key]}<input required={key !== 'usageInstruction'} type={key === 'quantity' || key === 'durationDays' ? 'number' : 'text'} min={1} step={1} max={key === 'quantity' || key === 'durationDays' ? 2147483647 : undefined} maxLength={key === 'dosage' ? 255 : 300} className={clinicalField} value={item[key]} onChange={e => setItems(v => v.map((m, i) => i === index ? { ...m, [key]: key === 'quantity' || key === 'durationDays' ? Number(e.target.value) : e.target.value } : m))} /></label>)}</div></div>)}<label className="block text-sm font-bold">Lời dặn<textarea className={clinicalField} maxLength={500} value={note} onChange={e => setNote(e.target.value)} /></label><button type="submit" disabled={!items.length} className={clinicalButton}>{busy ? 'Đang lưu…' : 'Xác nhận lưu đơn thuốc'}</button></fieldset></form>
    </>}
  </section>;
}
