'use client';

import { useEffect, useRef, useState } from 'react';
import { consultationApi, type Icd10Choice } from './api/consultation-api';
import { clinicalField } from './components/clinical-ui';

export function Icd10Picker({ selectedIds, onSelect, disabled }: { selectedIds: number[]; onSelect: (item: Icd10Choice) => void; disabled: boolean }) {
  const [input, setInput] = useState('');
  const [keyword, setKeyword] = useState('');
  useEffect(() => { const timer = setTimeout(() => setKeyword(input.trim()), 300); return () => clearTimeout(timer); }, [input]);
  return <div className="space-y-2">
    <label className="block text-sm font-semibold">Tìm mã hoặc tên bệnh ICD-10<input className={clinicalField} maxLength={255} disabled={disabled} value={input} onChange={e => setInput(e.target.value)} autoComplete="off" /></label>
    {input.trim() !== keyword ? <p role="status" className="text-sm">Đang tìm ICD-10…</p> : <Icd10Results key={keyword} keyword={keyword} selectedIds={selectedIds} onSelect={onSelect} disabled={disabled} />}
  </div>;
}

function Icd10Results({ keyword, selectedIds, onSelect, disabled }: { keyword: string; selectedIds: number[]; onSelect: (item: Icd10Choice) => void; disabled: boolean }) {
  const [items, setItems] = useState<Icd10Choice[]>([]);
  const [cursor, setCursor] = useState<number>();
  const [next, setNext] = useState<number>();
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const root = useRef<HTMLDivElement>(null), sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => { if (!controller.signal.aborted) { setLoading(true); setError(''); } });
    consultationApi.icd10(keyword, cursor, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      setItems(old => Array.from(new Map([...old, ...data.content].map(item => [item.id, item])).values()));
      setNext(data.nextCursor); setHasMore(data.hasMore);
    }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải ICD-10.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [keyword, cursor, retry]);
  useEffect(() => {
    if (!hasMore || loading || error || !sentinel.current || !root.current || disabled) return;
    const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting) && next) setCursor(next); }, { root: root.current });
    observer.observe(sentinel.current); return () => observer.disconnect();
  }, [hasMore, loading, error, next, disabled]);
  return <div ref={root} role="region" aria-label="Kết quả tìm ICD-10" aria-busy={loading} className="max-h-64 overflow-y-auto rounded-lg border bg-white">
    <ul className="divide-y">{items.map(item => <li key={item.id}><button type="button" disabled={disabled || selectedIds.includes(item.id)} onClick={() => onSelect(item)} className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 disabled:text-slate-400"><strong>{item.code}</strong> · {item.name}{selectedIds.includes(item.id) && ' · Đã chọn'}</button></li>)}</ul>
    {!loading && !error && !items.length && <p className="p-3 text-sm">Không tìm thấy mã phù hợp.</p>}
    {error && <p role="alert" className="p-3 text-sm text-rose-700">{error} <button type="button" onClick={() => setRetry(v => v + 1)}>Thử lại</button></p>}
    <div ref={sentinel} className="p-2 text-center text-sm">{loading ? <span role="status">Đang tải ICD-10…</span> : hasMore && !error ? <button type="button" disabled={disabled} onClick={() => setCursor(next)}>Tải thêm ICD-10</button> : null}</div>
  </div>;
}
