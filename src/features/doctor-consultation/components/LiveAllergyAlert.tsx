import type { ClinicalAllergy } from '../api/consultation-api';

export function LiveAllergyAlert({ allergies }: { allergies: ClinicalAllergy[] }) {
  return <section aria-label="Cảnh báo dị ứng" className="sticky top-0 z-40 rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
    <h2 className="font-bold text-rose-800">Thông tin dị ứng</h2>
    {allergies.length ? <ul className="mt-2 space-y-2 text-sm text-rose-800">{allergies.map(a => <li key={a.id}>{a.name} {a.reaction && `· ${a.reaction}`} · {a.verified ? 'Đã xác minh' : 'Chưa xác minh'}{a.note && <p className="mt-1 whitespace-pre-wrap break-words">Ghi chú: {a.note}</p>}</li>)}</ul> : <p className="mt-2 text-sm text-rose-800">Chưa có khai báo dị ứng; cần hỏi lại người bệnh khi khám.</p>}
  </section>;
}
