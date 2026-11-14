import Link from 'next/link';
import { useReceptionData } from '../ReceptionDataProvider';
import { previewQueue } from '../api/reception-preview-api';
import type { ReceptionSlot } from '../api/reception-api';

export function ReceptionCheckInResult({ code, queue, slot, onNext }: {
  code: string; queue?: number;
  slot?: Pick<ReceptionSlot, 'specialtyName' | 'roomName' | 'roomLocation' | 'doctorName' | 'rankName'>;
  onNext: () => void;
}) {
  const {demo}=useReceptionData();
  const sms=demo ? previewQueue(code) : null;
  return <section aria-label="Kết quả tiếp nhận" className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm">
    <h2 className="text-lg font-bold text-emerald-900">Tiếp nhận thành công</h2>
    <dl className="grid gap-4 sm:grid-cols-2">{[
      ['Mã lượt khám', code], ['Số thứ tự', queue ?? 'Chưa cấp'],
      ['Khoa / chuyên khoa', slot?.specialtyName], ['Địa chỉ phòng', [slot?.roomName, slot?.roomLocation].filter(Boolean).join(' · ')],
      ['Bác sĩ', [slot?.rankName, slot?.doctorName].filter(Boolean).join(' ')],
    ].map(([label, value]) => <div key={String(label)}><dt className="text-slate-600">{label}</dt><dd className="mt-1 font-semibold break-words">{value || 'Chưa cập nhật'}</dd></div>)}</dl>
    {sms && <div className="rounded-lg bg-white p-3"><strong>SMS mô phỏng · {sms.phone || 'Chưa có số điện thoại'}</strong><p>Số thứ tự {sms.number} · {sms.room}. <Link target="_blank" className="text-blue-700 underline" href={'/reception/preview?queue='+encodeURIComponent(code)}>Theo dõi hàng chờ</Link></p></div>}
    <button type="button" onClick={onNext} className="rounded-lg bg-blue-700 px-4 py-3 font-bold text-white">Tiếp nhận bệnh nhân tiếp theo</button>
  </section>;
}
