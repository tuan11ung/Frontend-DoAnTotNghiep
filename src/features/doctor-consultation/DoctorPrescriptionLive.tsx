'use client';
import { Search, X } from 'lucide-react';
import { MedicineSearchResults, type MedicineSearchItem, type MedicineSearchCursorResponse } from './components/MedicineSearchResults';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ClinicalApiError, clinicalRequest } from '@/src/shared/lib/clinical-api';
import { getStoredAuthSession } from '@/src/features/auth/auth-storage';
import type { PrescriptionDraft } from './api/consultation-api';
import { clinicalCard, clinicalField } from './components/clinical-ui';

interface Item { hospitalMedicineId: number; medicineName: string; quantity: number; dosage: string; usageInstruction: string; durationDays: number; total: number | null }
interface Prescription { id: number; note?: string; prescriptedDate: string; medicines: { id: number; hospitalMedicineId: number; medicineName: string; strength?: string; quantity: number; dosage: string; usageInstruction?: string; durationDays?: number }[] }

export function clearPrescriptionDraft(encounterId: number) {
  const session = getStoredAuthSession();
  if (!session || typeof window === 'undefined') return;
  try { sessionStorage.removeItem(`medconnect.rx-draft:${session.hospitalId}:${session.staffId}:${encounterId}`); }
  catch { /* The clinical workspace must still close when browser storage is unavailable. */ }
}

export function DoctorPrescriptionLive({ encounterId, editable, disabled = false, onDraftChange }: { encounterId: number; editable: boolean; disabled?: boolean; onDraftChange?: (draft: PrescriptionDraft | undefined, ready: boolean) => void }) {
  const [saved, setSaved] = useState<Prescription | null>(null); const [loaded, setLoaded] = useState(false);
  const [catalogue, setCatalogue] = useState<MedicineSearchCursorResponse | null>(null); const [keyword, setKeyword] = useState(''); const [query, setQuery] = useState(''); const [afterId, setAfterId] = useState<number | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchRevision, setSearchRevision] = useState(0);
  const [searchGeneration, setSearchGeneration] = useState(0);
  const searchTerm = keyword.trim();
  const searchPending = searchTerm !== query;
  const [items, setItems] = useState<Item[]>([]); const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const hadLocalDraft = useRef(false);
  const deleteLock = useRef(false);
  const blocked = disabled || deleting; const [restored, setRestored] = useState(false);
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
        hadLocalDraft.current = true; setItems(data.items); setNote(data.note);
      }
    } catch { setStorageError('Không thể khôi phục bản nháp đơn thuốc. Vui lòng kiểm tra lại các thuốc trước khi hoàn tất.'); }
    setRestored(true);
    });
    return () => { active = false; };
  }, [draftKey, editable]);
  useEffect(() => {
    if (!restored) return;
    try {
      if (!editable || (!items.length && !note)) sessionStorage.removeItem(draftKey);
      else sessionStorage.setItem(draftKey, JSON.stringify({ items, note }));
    } catch { queueMicrotask(() => setStorageError('Trình duyệt không lưu được nháp khi tải lại trang. Hãy giữ màn khám này mở đến khi hoàn tất.')); }
  }, [draftKey, editable, restored, saved, items, note]);
  const invalidDraft = (editable && saved !== null && items.length === 0) || items.length > 100 || note.length > 500 || (!items.length && !!note.trim()) || items.some(i =>
    !Number.isSafeInteger(i.quantity) || i.quantity < 1 || i.quantity > 2147483647 ||
    !Number.isSafeInteger(i.durationDays) || i.durationDays < 1 || i.durationDays > 2147483647 ||
    !i.dosage.trim() || i.dosage.length > 255 || i.usageInstruction.length > 300);
  const draft = useMemo<PrescriptionDraft | undefined>(() => !items.length ? undefined : ({ note: note.trim(), medicines: items.map(i => ({ hospitalMedicineId: i.hospitalMedicineId, quantity: i.quantity, dosage: i.dosage.trim(), usageInstruction: i.usageInstruction.trim(), durationDays: i.durationDays })) }), [items, note]);
  useEffect(() => { onDraftChange?.(draft, loaded && restored && !error && !invalidDraft); }, [draft, loaded, restored, error, invalidDraft, onDraftChange]);
  useEffect(() => {
    const controller = new AbortController();
    clinicalRequest<Prescription>('prescriptions/detail', { encounterId }, controller.signal).then(p => { if (!controller.signal.aborted) { setSaved(p); setLoaded(true); setError('');
      if (editable && !hadLocalDraft.current) {
        setItems(p.medicines.map(m => ({ hospitalMedicineId: m.hospitalMedicineId, medicineName: [m.medicineName,m.strength].filter(Boolean).join(' '), quantity: m.quantity, dosage: m.dosage, usageInstruction: m.usageInstruction ?? '', durationDays: m.durationDays ?? 1, total: null })));
        setNote(p.note ?? '');
      } } }).catch(e => {
      if (controller.signal.aborted) return;
      if (e instanceof ClinicalApiError && e.status === 404) { setSaved(null); setLoaded(true); }
      else setError(e instanceof Error ? e.message : 'Không thể đọc đơn thuốc.');
    });
    return () => controller.abort();
  }, [encounterId, editable]);
  useEffect(() => {
    if (searchTerm === query) return;
    const timer = setTimeout(() => {
      setQuery(searchTerm); setAfterId(null); setCatalogue(null); setSearchError('');
      setSearchLoading(!!searchTerm); setSearchGeneration(v => v + 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, query]);
  useEffect(() => {
    if (!editable || !loaded || !query || searchTerm !== query) return;
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      setSearchLoading(true); setSearchError('');
      return clinicalRequest<MedicineSearchCursorResponse>('hospital-medicines/search-cursor', { keyword: query, afterId, size: 20 }, controller.signal)
        .then(data => {
          if (controller.signal.aborted) return;
          if (data.hasMore && (!Number.isSafeInteger(data.nextCursor) || (data.nextCursor ?? 0) <= (afterId ?? 0))) throw new Error('Không thể tải tiếp kết quả thuốc. Vui lòng tìm kiếm lại.');
          setCatalogue(current => afterId == null ? data : ({ ...data,
            content: Array.from(new Map([...(current?.content ?? []), ...data.content].map(medicine => [medicine.id, medicine])).values()),
          }));
        })
        .catch(e => { if (!controller.signal.aborted) setSearchError(e instanceof Error ? e.message : 'Không tải được danh mục thuốc.'); })
        .finally(() => { if (!controller.signal.aborted) setSearchLoading(false); });
    });
    return () => controller.abort();
  }, [editable, loaded, saved, query, searchTerm, afterId, searchRevision]);
  function resetSearch() {
    setQuery(''); setCatalogue(null); setSearchError(''); setSearchLoading(false); setAfterId(null);
  }
  const loadMoreMedicines = useCallback(() => {
    if (blocked || searchPending || searchLoading || searchError || !catalogue?.hasMore || catalogue.nextCursor == null) return;
    setSearchLoading(true); setAfterId(catalogue.nextCursor);
  }, [blocked, searchPending, searchLoading, searchError, catalogue]);
  function addMedicine(medicine: MedicineSearchItem) {
    if (blocked || !editable || medicine.total <= 0) return;
    setItems(current => current.length >= 100 || current.some(item => item.hospitalMedicineId === medicine.id) ? current : [...current, {
      hospitalMedicineId: medicine.id, medicineName: [medicine.medicineName, medicine.strength].filter(Boolean).join(' '),
      total: medicine.total, quantity: 1, dosage: '', usageInstruction: '', durationDays: 1,
    }]);
  }
  async function deleteSaved() {
    if (deleteLock.current || blocked || !window.confirm('Xóa đơn thuốc đã lưu của lượt khám đang điều trị?')) return;
    deleteLock.current = true; setDeleting(true); setError('');
    try { await clinicalRequest('prescriptions/delete', { encounterId }); setSaved(null); setItems([]); setNote(''); clearPrescriptionDraft(encounterId); }
    catch(e) { setError(e instanceof Error ? e.message : 'Không thể xóa đơn thuốc.'); }
    finally { deleteLock.current = false; setDeleting(false); }
  }
  return <section className={clinicalCard}><h2 className="text-lg font-bold">Đơn thuốc</h2>
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}{storageError && <p role="status" className="text-sm text-amber-800">{storageError}</p>}
    {!loaded && !error && <p role="status">Đang tải đơn thuốc…</p>}
    {saved && !editable ? <><p className="text-sm text-slate-500">Đơn #{saved.id} · {new Date(saved.prescriptedDate).toLocaleString('vi-VN')} · Đã lưu</p>{saved.note && <p className="whitespace-pre-wrap text-sm">{saved.note}</p>}<ul className="divide-y">{saved.medicines.map(m => <li key={m.id} className="space-y-1 py-3 text-sm"><h3 className="font-bold">{m.medicineName} {m.strength}</h3><p>Số lượng: {m.quantity} · {m.durationDays ? `${m.durationDays} ngày` : 'Theo chỉ dẫn'}</p><p>Liều dùng: {m.dosage}</p>{m.usageInstruction && <p>Cách dùng: {m.usageInstruction}</p>}</li>)}</ul></> : loaded && !editable ? <><p className="text-sm text-slate-500">{items.length ? 'Đơn thuốc đã lưu cùng lượt khám.' : 'Lượt khám chưa có đơn thuốc.'}</p><ul>{items.map(i => <li key={i.hospitalMedicineId} className="py-2 text-sm">{i.medicineName} · {i.quantity} · {i.dosage}</li>)}</ul></> : loaded && <>
      {saved && <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-amber-800">Đang chỉnh sửa đơn #{saved.id}. Nội dung mới được lưu khi hoàn tất lượt khám.</p><button type="button" disabled={blocked} className="text-sm font-bold text-rose-700" onClick={() => void deleteSaved()}>Xóa đơn đã lưu</button></div>}
      <p className="text-sm text-slate-500">Đơn thuốc đang được soạn nháp. Bạn có thể sửa hoặc bỏ thuốc; đơn chỉ được lưu khi xác nhận hoàn tất lượt khám.</p>
      <div className="space-y-4" aria-label="Tìm và chọn thuốc">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1 text-sm font-bold text-slate-700">Tìm thuốc trong cơ sở
            <span className="relative mt-2 block">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                maxLength={255} value={keyword} disabled={blocked} placeholder="Tìm theo tên thuốc hoặc hoạt chất"
                onChange={e => { setKeyword(e.target.value); if (!e.target.value.trim()) resetSearch(); }} />
            </span>
          </label>
          {keyword && <button type="button" aria-label="Xóa từ khóa tìm thuốc" disabled={blocked} onClick={() => { setKeyword(''); resetSearch(); }} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-500 hover:bg-slate-100"><X aria-hidden="true" className="size-4" />Xóa</button>}
        </div>
        {!searchTerm ? <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">Kết quả tìm kiếm sẽ hiển thị ở đây</p>
          : searchPending ? <p role="status" className="px-4 py-10 text-center text-sm text-slate-500">Đang tìm thuốc…</p>
          : <MedicineSearchResults key={`${query}:${searchGeneration}`} catalogue={catalogue} loading={searchLoading} error={searchError}
              selectedIds={items.map(item => item.hospitalMedicineId)} disabled={blocked}
              onAdd={addMedicine} onRetry={() => { setSearchLoading(true); setSearchRevision(v => v + 1); }}
              onLoadMore={loadMoreMedicines} />}
      </div>
      <div className="space-y-4"><fieldset disabled={!editable || blocked} className="space-y-4">{items.map((item, index) => <div key={item.hospitalMedicineId} className="space-y-3 rounded-xl border p-4"><div className="flex justify-between gap-3"><h3 className="font-bold">{item.medicineName}</h3><button type="button" className="text-sm text-rose-700" onClick={() => { setItems(v => v.filter((_, i) => i !== index)); }}>Bỏ thuốc</button></div>{item.total != null && item.quantity > item.total && <p className="text-sm text-amber-800">Số lượng kê vượt tồn kho ({item.total}); cần thông báo người bệnh.</p>}<div className="grid gap-3 sm:grid-cols-2">{(['quantity', 'durationDays', 'dosage', 'usageInstruction'] as const).map(key => <label key={key} className="text-sm font-semibold">{{ quantity: 'Số lượng', durationDays: 'Số ngày', dosage: 'Liều dùng', usageInstruction: 'Hướng dẫn sử dụng' }[key]}<input required={key !== 'usageInstruction'} type={key === 'quantity' || key === 'durationDays' ? 'number' : 'text'} min={1} step={1} max={key === 'quantity' || key === 'durationDays' ? 2147483647 : undefined} maxLength={key === 'dosage' ? 255 : 300} className={clinicalField} value={item[key]} onChange={e => setItems(v => v.map((m, i) => i === index ? { ...m, [key]: key === 'quantity' || key === 'durationDays' ? Number(e.target.value) : e.target.value } : m))} /></label>)}</div></div>)}<label className="block text-sm font-bold">Lời dặn<textarea className={clinicalField} maxLength={500} value={note} onChange={e => setNote(e.target.value)} /></label>{invalidDraft && <p role="alert" className="text-sm text-amber-800">Kiểm tra số lượng, số ngày, liều dùng cho từng thuốc. Nếu bỏ toàn bộ thuốc của đơn đã lưu, hãy chọn Xóa đơn đã lưu. Lời dặn cần đi cùng ít nhất một thuốc.</p>}<p role="status" className="text-sm text-slate-500">{items.length ? `${items.length} thuốc trong bản nháp · Lưu cùng lúc hoàn tất khám` : 'Chưa kê thuốc cho lượt khám này.'}</p></fieldset></div>
    </>}
  </section>;
}
