import { Building2 } from 'lucide-react';
import { DoctorHeader } from '@/src/features/doctor-queue/components/DoctorHeader';
import { DOCTOR_SCHEDULE_PROFILE, DOCTOR_SCHEDULE_SHIFTS, DOCTOR_SCHEDULE_TODAY } from './data/doctor-schedule-demo';
import { DoctorScheduleWorkspace } from './DoctorScheduleWorkspace';

export function DoctorScheduleScreen() {
  return (
    <div className="min-h-screen bg-[#f4f7f7] text-slate-800">
      <DoctorHeader activePage="schedule" doctor={DOCTOR_SCHEDULE_PROFILE.doctor} />
      <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-[#0b5754]"><Building2 aria-hidden="true" className="h-3.5 w-3.5" />{DOCTOR_SCHEDULE_PROFILE.facility.name}<span className="mx-1 text-slate-300">/</span>Khoa Nội tổng quát</p>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Lịch làm việc của tôi</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">Theo dõi thời gian và phòng khám được phân công trong tuần.</p>
            </div>
          </div>
          <DoctorScheduleWorkspace shifts={DOCTOR_SCHEDULE_SHIFTS} today={DOCTOR_SCHEDULE_TODAY} />
        </div>
      </main>
    </div>
  );
}
