'use client';

import { Check, Plus } from 'lucide-react';
import { ScrollableTable } from '@/src/shared/components/ScrollableTable';
import { useEffect, useRef } from 'react';
import { clinicalGhostButton } from './clinical-ui';

export interface MedicineSearchItem {
  id: number;
  medicineName: string;
  strength?: string | null;
  route?: string | null;
  total: number;
  ingredients?: { ingredientId: number; ingredientName: string; strength?: string | null }[] | null;
}

export interface MedicineSearchCursorResponse {
  content: MedicineSearchItem[];
  nextCursor?: number | null;
  hasMore: boolean;
}

export function MedicineSearchResults({ catalogue, loading, error, selectedIds, disabled,
  onAdd, onRetry, onLoadMore,
}: {
  catalogue: MedicineSearchCursorResponse | null;
  loading: boolean;
  error: string;
  selectedIds: number[];
  disabled: boolean;
  onAdd: (medicine: MedicineSearchItem) => void;
  onRetry: () => void;
  onLoadMore: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const hasMore = !!catalogue?.hasMore && catalogue.nextCursor != null;
  const count = catalogue?.content.length ?? 0;
  useEffect(() => {
    if (!hasMore || loading || error || disabled || !root.current || !sentinel.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) onLoadMore();
    }, { root: root.current });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasMore, loading, error, disabled, onLoadMore]);
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <ScrollableTable ref={root} label="Kết quả tìm kiếm thuốc" aria-busy={loading} maxHeight="min(32rem, 60dvh)">
      <table className="w-full min-w-[1000px] table-fixed text-left text-sm">
        <caption className="sr-only">Thuốc trong kho bệnh viện phù hợp với từ khóa tìm kiếm</caption>
        <colgroup><col className="w-[24%]" /><col className="w-[20%]" /><col className="w-[13%]" /><col className="w-[22%]" /><col className="w-[9%]" /><col className="w-[12%]" /></colgroup>
        <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <tr>{['Thuốc', 'Hàm lượng', 'Đường dùng', 'Hoạt chất', 'Tồn kho', 'Thao tác'].map((label, index) =>
            <th key={label} scope="col" className={`px-4 py-3 ${index === 5 ? 'text-right' : ''}`}>{label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading && !count ? <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500"><p role="status">Đang tìm thuốc…</p></td></tr>
            : error && !count ? <tr><td colSpan={6} className="px-4 py-8 text-center"><p role="alert" className="text-rose-700">{error}</p><button type="button" className={`${clinicalGhostButton} mt-3`} disabled={disabled} onClick={onRetry}>Thử lại</button></td></tr>
            : !catalogue?.content.length ? <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500"><p role="status">Không tìm thấy thuốc phù hợp.</p></td></tr>
            : catalogue.content.map(medicine => {
              const selected = selectedIds.includes(medicine.id);
              return <tr key={medicine.id} className="align-top transition-colors hover:bg-slate-50/80">
                <td className="px-4 py-4"><p className="whitespace-normal font-bold leading-6 text-slate-900 [overflow-wrap:anywhere]">{medicine.medicineName}</p></td>
                <td className="px-4 py-4"><p className="whitespace-normal font-semibold leading-6 text-slate-700 [overflow-wrap:anywhere]">{medicine.strength || 'Chưa cập nhật'}</p></td>
                <td className="px-4 py-4"><p className="whitespace-normal leading-6 text-slate-600 [overflow-wrap:anywhere]">{medicine.route || 'Chưa có đường dùng'}</p></td>
                <td className="px-4 py-4">{medicine.ingredients?.length ? <div className="flex flex-wrap gap-1.5">{medicine.ingredients.map((ingredient, index) =>
                  <span key={`${ingredient.ingredientId}:${index}`} className="max-w-full whitespace-normal rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold leading-5 text-emerald-700 [overflow-wrap:anywhere]">{ingredient.ingredientName}{ingredient.strength ? ` ${ingredient.strength}` : ''}</span>)}</div>
                  : <span className="text-xs text-slate-400">Chưa có dữ liệu</span>}</td>
                <td className="px-4 py-4"><span className={`font-semibold tabular-nums ${medicine.total > 0 ? 'text-slate-800' : 'text-rose-600'}`}>{medicine.total.toLocaleString('vi-VN')}</span>{medicine.total <= 0 && <p className="mt-1 text-xs text-rose-600">Hết hàng</p>}</td>
                <td className="px-4 py-4 text-right">{selected ? <span className="inline-flex items-center gap-1 whitespace-nowrap py-1.5 text-xs font-semibold text-emerald-700"><Check aria-hidden="true" className="size-4" />Đã chọn</span>
                  : <button type="button" disabled={disabled || selectedIds.length >= 100 || medicine.total <= 0} onClick={() => onAdd(medicine)} aria-label={`Thêm thuốc ${medicine.medicineName}`} className={`${clinicalGhostButton} inline-flex items-center justify-center gap-1 whitespace-nowrap border-blue-200 text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed`}><Plus aria-hidden="true" className="size-3.5" />Thêm</button>}</td>
              </tr>;
            })}
        </tbody>
      </table>
      {count > 0 && <div ref={sentinel} className="h-px" aria-hidden="true" />}
    </ScrollableTable>
    {count > 0 && loading && <p role="status" className="px-4 py-3 text-center text-sm text-slate-500">Đang tải thêm thuốc…</p>}
    {count > 0 && error && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3"><p role="alert" className="text-sm text-rose-700">{error}</p><button type="button" className={clinicalGhostButton} disabled={disabled || loading} onClick={onRetry}>Thử lại</button></div>}
  </div>;
}
