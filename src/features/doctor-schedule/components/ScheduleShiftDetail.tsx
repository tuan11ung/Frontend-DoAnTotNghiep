import { AccountName } from '@/src/shared/components/layout/AccountName';
import { ArrowLeft, CalendarDays, Check, ClipboardList, Clock3, DoorOpen, Info, MapPin, Stethoscope } from 'lucide-react';
import { DOCTOR_SCHEDULE_SESSIONS } from '../doctor-schedule.constants';
import type { DoctorScheduleShift } from '../doctor-schedule.types';

export function ScheduleShiftDetail({ shift, today }: { shift: DoctorScheduleShift | null; today: string }) {
  const session = shift && DOCTOR_SCHEDULE_SESSIONS.find(item => item.id === shift.session);
  return (
    <aside aria-label="Chi tiết ca được chọn" className="min-w-0 scroll-mt-4 focus:outline-none" id="schedule-shift-detail" tabIndex={-1}>
      <a className="mb-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-[#0b5754] focus-visible:outline-2 focus-visible:outline-blue-600 xl:hidden" href="#schedule-calendar"><ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />Quay lại lịch tuần</a>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4"><ClipboardList aria-hidden="true" className="h-4 w-4 text-[#0b5754]" /><h2 className="text-sm font-extrabold text-slate-900">Chi tiết ca làm việc</h2></div>
        {shift && session ? (
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"><Check aria-hidden="true" className="h-3 w-3" />Đã phân công</span>
              {shift.date === today && <span className="text-[10px] font-bold text-[#0b5754]">Hôm nay</span>}
            </div>
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100"><DoorOpen aria-hidden="true" className="h-5 w-5" /></span><div><h3 className="text-base font-extrabold text-slate-900">{shift.room}</h3><p className="mt-1 text-xs text-slate-500">{shift.specialty}</p></div></div>
            <dl className="mt-6 space-y-5 text-xs">
              <div className="flex gap-3"><CalendarDays aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div><dt className="text-[10px] text-slate-500">Ngày làm việc</dt><dd className="mt-1.5 font-bold capitalize leading-5 text-slate-800">{new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${shift.date}T12:00:00Z`))}</dd></div></div>
              <div className="flex gap-3"><Clock3 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div><dt className="text-[10px] text-slate-500">{session.label}</dt><dd className="mt-1.5 font-bold text-slate-800">{shift.startTime} – {shift.endTime}<span className="ml-2 font-medium text-slate-400">({shift.duration.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} giờ)</span></dd></div></div>
              <div className="flex gap-3"><MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div><dt className="text-[10px] text-slate-500">Địa điểm</dt><dd className="mt-1.5 font-semibold leading-5 text-slate-800">{shift.location}<span className="mt-0.5 block font-normal text-slate-500">{shift.hospitalName}</span></dd></div></div>
              <div className="flex gap-3"><Stethoscope aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div><dt className="text-[10px] text-slate-500">Bác sĩ phụ trách</dt><dd className="mt-1.5 font-semibold text-slate-800"><AccountName fallback="Bác sĩ đang đăng nhập" /></dd></div></div>
            </dl>
          </div>
        ) : <div className="px-5 py-10 text-center"><CalendarDays aria-hidden="true" className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-700">Chưa có ca được chọn</p><p className="mt-2 text-xs leading-6 text-slate-500">Chọn một ca trong lịch để xem thời gian và phòng được phân công.</p></div>}
      </section>
      <div className="mt-4 flex gap-2.5 rounded-xl border border-teal-100 bg-[#edf7f5] p-4"><Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#0b5754]" /><p className="text-xs leading-6 text-[#356561]">Lịch do quản trị cơ sở phân công. Vui lòng liên hệ quản trị cơ sở khi cần điều chỉnh ca làm việc.</p></div>
    </aside>
  );
}
