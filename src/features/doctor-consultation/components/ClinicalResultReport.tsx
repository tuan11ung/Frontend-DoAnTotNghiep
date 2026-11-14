import type { TechnicianOrderDetail } from '@/src/features/technician-queue/technician-api.types';

export function ClinicalResultReport({ detail }: { detail: TechnicianOrderDetail }) {
  const validMedia = detail.media.filter(media => { try { return ['http:', 'https:'].includes(new URL(media.url).protocol); } catch { return false; } });
  return <section className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/30 p-4"><h3 className="font-bold">{detail.order.serviceName}</h3><p className="text-sm text-slate-500">{detail.order.statusLabel}</p>
    <dl className="space-y-3 text-sm"><div><dt className="font-bold">Mô tả</dt><dd className="mt-1 whitespace-pre-wrap">{detail.findings || 'Chưa có mô tả.'}</dd></div><div><dt className="font-bold">Kết luận cận lâm sàng</dt><dd className="mt-1 whitespace-pre-wrap">{detail.conclusion || 'Chưa có kết luận.'}</dd></div></dl>
    {detail.values.length > 0 && <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Chỉ số</th><th className="p-2">Kết quả</th><th className="p-2">Đơn vị</th><th className="p-2">Tham chiếu</th></tr></thead><tbody>{detail.values.map(value => <tr key={value.id} className={value.isAbnormal ? 'font-bold text-rose-700' : ''}><td className="p-2">{value.parameterName}</td><td className="p-2">{value.valueText ?? value.value ?? 'Chưa có'}</td><td className="p-2">{value.unit}</td><td className="p-2">{value.referenceLow ?? '—'}–{value.referenceHigh ?? '—'}</td></tr>)}</tbody></table></div>}
    {validMedia.length > 0 && <ul className="space-y-2 text-sm">{validMedia.map(media => <li key={media.id}><a className="font-bold text-blue-700 underline" href={media.url} target="_blank" rel="noreferrer">Xem {media.type === 'MP4' ? 'video' : 'hình ảnh'}: {media.name}</a></li>)}</ul>}
  </section>;
}
