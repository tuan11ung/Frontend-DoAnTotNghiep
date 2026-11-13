'use client';

import { useState } from 'react';
import { CalendarClock, ClipboardList, Search, ChevronRight } from 'lucide-react';
import { receptionDate, receptionSearch } from '../utils/reception-format';
import { ReceptionDialog } from './ReceptionDialog';

const sampleAppointments = [
  {
    code: 'LH26011001', patient: 'Nguyễn Minh An', patientCode: 'BN00031',
    date: '2026-11-03', time: '08:00–08:30',
    reason: 'Tôi bị nghẹt mũi và ù tai phải khoảng ba ngày. Buổi tối nghe kém hơn, chưa đi khám lần nào.',
  },
  {
    code: 'LH26011002', patient: 'Trần Hoài Linh', patientCode: 'BN00032',
    date: '2026-11-03', time: '09:00–09:30',
    reason: 'Tôi thấy các mảng đỏ và ngứa ở hai cánh tay từ cuối tuần. Ngứa tăng vào buổi tối và lan nhẹ ra cổ tay.',
  },
  {
    code: 'LH26011003', patient: 'Lê Thanh Bình', patientCode: 'BN00033',
    date: '2026-11-03', time: '14:00–14:30',
    reason: 'Tôi hay đau vùng bụng trên sau khi ăn và đôi lúc buồn nôn. Triệu chứng xuất hiện gần một tuần.',
  },
];

type SampleAppointment = (typeof sampleAppointments)[number];

export function PendingSpecialtyPanel() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SampleAppointment | null>(null);
  const search = receptionSearch(query);
  const appointments = sampleAppointments.filter(({ code, patient, patientCode, reason }) =>
    receptionSearch(`${code} ${patient} ${patientCode} ${reason}`).includes(search));

  return (
    <>
      <section className="reception-card overflow-hidden" aria-label="Danh sách lịch chờ phân chuyên khoa">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><ClipboardList aria-hidden="true" className="size-5" /></span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Lịch hẹn chờ xử lý</h2>
              <p className="mt-1 text-xs text-slate-500" role="status">{appointments.length} lịch hẹn</p>
            </div>
          </div>
          <label className="w-full sm:max-w-xs">
            <span className="sr-only">Tìm lịch hẹn chờ phân chuyên khoa</span>
            <span className="relative block">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Mã lịch hẹn, tên hoặc triệu chứng" className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus-visible:outline-2 focus-visible:outline-blue-600" />
            </span>
          </label>
        </div>
        {appointments.length ? (
          <ul className="divide-y divide-slate-100">
            {appointments.map((appointment) => (
              <li key={appointment.code} className="grid gap-3 p-4 sm:grid-cols-2 sm:items-center sm:px-6 xl:grid-cols-[minmax(9rem,1fr)_minmax(10rem,1fr)_minmax(12rem,2fr)_auto]">
                <div>
                  <p className="text-sm font-bold text-slate-900">{appointment.patient}</p>
                  <p className="mt-1 font-mono text-xs text-slate-500">{appointment.code} · {appointment.patientCode}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CalendarClock aria-hidden="true" className="size-4 shrink-0 text-slate-400" />
                  <span><strong className="font-semibold text-slate-800">{appointment.time}</strong><span className="block">{receptionDate(appointment.date)}</span></span>
                </div>
                <p className="line-clamp-2 text-sm leading-6 text-slate-600">{appointment.reason}</p>
                <button type="button" className="reception-secondary justify-self-start" aria-label={`Xem chi tiết lịch ${appointment.code}`} onClick={() => setSelected(appointment)}>
                  Xem chi tiết <ChevronRight aria-hidden="true" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="p-10 text-center text-sm text-slate-500">Không tìm thấy lịch hẹn phù hợp.</p>}
      </section>
      {selected && (
        <ReceptionDialog title={`Chi tiết lịch ${selected.code}`} onClose={() => setSelected(null)}>
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-base font-extrabold text-slate-900">{selected.patient}</p><p className="mt-1 text-xs text-slate-500">Mã bệnh nhân {selected.patientCode}</p></div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Chờ phân chuyên khoa</span>
            </div>
            <dl className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 p-4 text-sm">
              <div><dt className="text-xs text-slate-500">Ngày mong muốn</dt><dd className="mt-1 font-semibold">{receptionDate(selected.date)}</dd></div>
              <div><dt className="text-xs text-slate-500">Khung giờ mong muốn</dt><dd className="mt-1 font-semibold">{selected.time}</dd></div>
              <div><dt className="text-xs text-slate-500">Chuyên khoa bệnh nhân chọn</dt><dd className="mt-1 font-semibold">Không rõ</dd></div>
              <div><dt className="text-xs text-slate-500">Hình thức khám</dt><dd className="mt-1 font-semibold">BHYT</dd></div>
            </dl>
            <section className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <h3 className="text-sm font-bold text-slate-900">Lý do khám do bệnh nhân cung cấp</h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{selected.reason}</p>
            </section>
            <div className="flex justify-end"><button type="button" className="reception-secondary" onClick={() => setSelected(null)}>Về danh sách</button></div>
          </div>
        </ReceptionDialog>
      )}
    </>
  );
}
