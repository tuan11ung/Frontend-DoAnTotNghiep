import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  CircleAlert,
  Clock3,
  DoorOpen,
  Stethoscope,
  UsersRound,
} from 'lucide-react';
import type { AdminSection, Department, MedicalService, Room, Specialty, StaffAccount } from '../types';

interface DashboardOverviewProps {
  departments: Department[];
  specialties: Specialty[];
  rooms: Room[];
  staff: StaffAccount[];
  services: MedicalService[];
  onNavigate: (section: AdminSection) => void;
}

export function DashboardOverview({ departments, specialties, rooms, staff, services, onNavigate }: DashboardOverviewProps) {
  const cards = [
    { label: 'Khoa đang hoạt động', value: departments.filter((item) => item.active).length, total: departments.length, icon: Building2, color: 'blue', target: 'departments' as const },
    { label: 'Chuyên khoa', value: specialties.filter((item) => item.active).length, total: specialties.length, icon: Stethoscope, color: 'emerald', target: 'specialties' as const },
    { label: 'Phòng chức năng', value: rooms.filter((item) => item.active).length, total: rooms.length, icon: DoorOpen, color: 'amber', target: 'rooms' as const },
    { label: 'Nhân viên hoạt động', value: staff.filter((item) => item.active).length, total: staff.length, icon: UsersRound, color: 'violet', target: 'staff' as const },
  ];

  const unassignedDepartments = departments.filter((department) => department.active && !staff.some((member) => member.active && member.departmentId === department.id && member.roles.includes('DEPARTMENT_HEAD'))).length;
  const inactiveRooms = rooms.filter((item) => !item.active).length;
  const inactiveServices = services.filter((item) => !item.active).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const palette = {
            blue: 'bg-blue-50 text-blue-700 ring-blue-100',
            emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
            amber: 'bg-amber-50 text-amber-700 ring-amber-100',
            violet: 'bg-violet-50 text-violet-700 ring-violet-100',
          }[card.color];

          return (
            <button className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-[0_8px_30px_-24px_rgba(15,23,42,0.4)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg" key={card.label} onClick={() => onNavigate(card.target)} type="button">
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${palette}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-blue-600" />
              </div>
              <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950">{card.value}</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-600">{card.label}</p>
                <span className="text-xs text-slate-400">/{card.total}</span>
              </div>
            </button>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-900">Vận hành hôm nay</h2>
              <p className="mt-1 text-xs text-slate-500">Thứ Hai, 26 tháng 10 năm 2026</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Đang mở cửa</span>
          </div>
          <div className="grid gap-px bg-slate-100 sm:grid-cols-3">
            {[
              { icon: CalendarClock, value: '128', label: 'Lịch khám', note: '16 lịch đang chờ' },
              { icon: Clock3, value: '07:00–17:00', label: 'Giờ làm việc', note: 'Nghỉ trưa 11:30–13:00' },
              { icon: Stethoscope, value: '24/27', label: 'Dịch vụ đang mở', note: '3 dịch vụ tạm ngừng' },
            ].map((item) => (
              <div className="bg-white p-5 sm:p-6" key={item.label}>
                <item.icon className="h-5 w-5 text-blue-700" />
                <p className="mt-4 text-xl font-extrabold text-slate-900">{item.value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              <CircleAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Việc cần xử lý</h2>
              <p className="mt-1 text-xs text-slate-500">Hoàn thiện cấu hình trước khi mở lịch mới.</p>
            </div>
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {[
              { count: unassignedDepartments, label: 'khoa chưa có trưởng khoa', target: 'departments' as const },
              { count: inactiveRooms, label: 'phòng đang tạm ngừng', target: 'rooms' as const },
              { count: inactiveServices, label: 'dịch vụ đang tạm ngừng', target: 'services' as const },
            ].map((item) => (
              <button className="flex w-full items-center gap-3 py-3 text-left text-sm hover:text-blue-700" key={item.label} onClick={() => onNavigate(item.target)} type="button">
                <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-slate-100 px-2 text-xs font-extrabold text-slate-700">{item.count}</span>
                <span className="flex-1 font-medium text-slate-600">{item.label}</span>
                <ArrowUpRight className="h-4 w-4 text-slate-300" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
