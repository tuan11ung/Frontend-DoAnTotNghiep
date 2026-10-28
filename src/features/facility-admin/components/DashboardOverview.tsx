'use client';

import { useState } from 'react';
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  CalendarDays,
  CircleAlert,
  Clock3,
  DoorOpen,
  Stethoscope,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import type { AdminSection, Department, MedicalService, Room, Specialty, StaffAccount } from '../types';
import {
  INITIAL_SCHEDULE_ASSIGNMENTS,
  SCHEDULE_DAYS,
  SCHEDULE_DOCTORS,
  SCHEDULE_ROOMS,
} from '../../work-schedules/data/work-schedule-mock-data';
import { getScheduleToday } from '../../work-schedules/schedule-utils';

interface DashboardOverviewProps {
  departments: Department[];
  specialties: Specialty[];
  rooms: Room[];
  staff: StaffAccount[];
  services: MedicalService[];
  onNavigate: (section: AdminSection) => void;
}

export function DashboardOverview({ departments, specialties, rooms, staff, services, onNavigate }: DashboardOverviewProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('respiratory');

  const cards = [
    { label: 'Khoa đang hoạt động', value: departments.filter((item) => item.active).length, total: departments.length, icon: Building2, color: 'blue', target: 'departments' as const },
    { label: 'Chuyên khoa', value: specialties.filter((item) => item.active).length, total: specialties.length, icon: Stethoscope, color: 'emerald', target: 'specialties' as const },
    { label: 'Phòng chức năng', value: rooms.filter((item) => item.active).length, total: rooms.length, icon: DoorOpen, color: 'amber', target: 'rooms' as const },
    { label: 'Nhân viên hoạt động', value: staff.filter((item) => item.active).length, total: staff.length, icon: UsersRound, color: 'violet', target: 'staff' as const },
  ];

  const unassignedDepartments = departments.filter((department) => department.active && !staff.some((member) => member.active && member.departmentId === department.id && member.roles.includes('DEPARTMENT_HEAD'))).length;
  const inactiveRooms = rooms.filter((item) => !item.active).length;
  const inactiveServices = services.filter((item) => !item.active).length;

  const today = getScheduleToday();
  const todayScheduleDay = SCHEDULE_DAYS.find((d) => d.id === today) ?? SCHEDULE_DAYS[2];
  const todayDayIndex = SCHEDULE_DAYS.findIndex((d) => d.id === todayScheduleDay.id);
  const morningSlotIndex = todayDayIndex * 2;
  const afternoonSlotIndex = todayDayIndex * 2 + 1;

  const todayRoomAssignments = SCHEDULE_ROOMS.map((room) => {
    const morningDoctorId = INITIAL_SCHEDULE_ASSIGNMENTS[room.id]?.[morningSlotIndex];
    const afternoonDoctorId = INITIAL_SCHEDULE_ASSIGNMENTS[room.id]?.[afternoonSlotIndex];
    return {
      room,
      morningDoctor: SCHEDULE_DOCTORS.find((d) => d.id === morningDoctorId) ?? null,
      afternoonDoctor: SCHEDULE_DOCTORS.find((d) => d.id === afternoonDoctorId) ?? null,
    };
  });

  const dutyDoctorsCount = new Set(
    todayRoomAssignments
      .flatMap((r) => [r.morningDoctor?.id, r.afternoonDoctor?.id])
      .filter((id): id is string => Boolean(id))
  ).size;
  const activeRoomsCount = todayRoomAssignments.filter((r) => r.morningDoctor || r.afternoonDoctor).length;

  const otherSpecialties = specialties.filter((s) => !s.name.toLowerCase().includes('hô hấp'));

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

      {/* SECTION: LỊCH TRỰC HÔM NAY THEO CHUYÊN KHOA */}
      <section aria-label="Bác sĩ trực khám hôm nay" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <UserCheck aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900">Bác sĩ trực khám hôm nay</h2>
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                  Hôm nay · {todayScheduleDay.label} {todayScheduleDay.date}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Theo dõi các bác sĩ đang đảm nhận ca trực theo từng chuyên khoa trong ngày
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
              <span className="font-semibold text-slate-500">Chuyên khoa:</span>
              <select
                aria-label="Chọn chuyên khoa xem lịch trực"
                className="cursor-pointer bg-transparent font-bold text-slate-800 outline-none focus:ring-0"
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                value={selectedSpecialty}
              >
                <option value="respiratory">Chuyên khoa Hô hấp ({todayRoomAssignments.length} phòng)</option>
                {otherSpecialties.map((s) => (
                  <option key={s.id} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
              onClick={() => onNavigate('work-schedules')}
              type="button"
            >
              <span>Phân công tuần</span>
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {selectedSpecialty === 'respiratory' ? (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Thanh tóm tắt chỉ số ca trực */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 rounded-xl bg-slate-50/80 p-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Bác sĩ phụ trách: <strong className="text-slate-900 font-extrabold">{dutyDoctorsCount} bác sĩ</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Phòng tiếp nhận: <strong className="text-slate-900 font-extrabold">{activeRoomsCount}/{todayRoomAssignments.length} phòng</strong></span>
              </span>
            </div>

            {/* BẢNG PHÒNG KHÁM VÀ BÁC SĨ TRỰC HÔM NAY */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-0 text-left">
                    <caption className="sr-only">
                      Bảng lịch trực hôm nay của chuyên khoa Hô hấp theo phòng khám và ca sáng chiều
                    </caption>
                    <colgroup>
                      <col className="w-56" />
                      <col />
                      <col />
                    </colgroup>
                    <thead>
                      <tr>
                        <th
                          className="sticky left-0 top-0 z-20 border-b border-r border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-500"
                          rowSpan={2}
                          scope="col"
                        >
                          <span className="flex items-center gap-2">
                            <DoorOpen aria-hidden="true" className="h-4 w-4 text-slate-500" />
                            Phòng khám
                          </span>
                        </th>
                        <th
                          className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-center"
                          colSpan={2}
                          scope="colgroup"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-sm font-extrabold text-slate-800">
                              {todayScheduleDay.label}
                            </span>
                            <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              Hôm nay · {todayScheduleDay.date}
                            </span>
                          </div>
                        </th>
                      </tr>
                      <tr>
                        <th
                          className="border-b border-r border-slate-200 bg-slate-50/70 py-2 text-center text-xs font-semibold text-slate-600"
                          scope="col"
                        >
                          <span>Sáng (07:00 – 11:30)</span>
                        </th>
                        <th
                          className="border-b border-slate-200 bg-slate-50/70 py-2 text-center text-xs font-semibold text-slate-600"
                          scope="col"
                        >
                          <span>Chiều (13:00 – 17:00)</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayRoomAssignments.map(({ room, morningDoctor, afternoonDoctor }, idx) => {
                        const isLast = idx === todayRoomAssignments.length - 1;

                        return (
                          <tr className="group transition-colors hover:bg-slate-50/40" key={room.id}>
                            {/* Cột Phòng khám */}
                            <th
                              className={`border-r border-slate-100 bg-white px-4 py-3 text-left transition-colors group-hover:bg-slate-50/40 ${
                                isLast ? 'border-b-0' : 'border-b'
                              }`}
                              scope="row"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-extrabold text-slate-900">{room.name}</span>
                                <span
                                  className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                                    room.type === 'clinical'
                                      ? 'bg-blue-50 text-blue-700'
                                      : 'bg-violet-50 text-violet-700'
                                  }`}
                                >
                                  {room.type === 'clinical' ? 'Lâm sàng' : 'Cận lâm sàng'}
                                </span>
                              </div>
                              {room.description && (
                                <p className="mt-1 truncate text-xs text-slate-500 leading-4" title={room.description}>
                                  {room.description}
                                </p>
                              )}
                            </th>

                            {/* Cột Ca Sáng */}
                            <td
                              className={`border-r border-slate-100 bg-white px-3 py-2.5 text-center ${
                                isLast ? 'border-b-0' : 'border-b'
                              }`}
                            >
                              {morningDoctor ? (
                                <div
                                  className="flex h-11 w-full min-w-0 select-none items-center justify-center gap-1.5 rounded-lg border border-emerald-300/90 bg-emerald-50/90 px-3 text-xs font-bold text-emerald-950 shadow-2xs"
                                  title={`${morningDoctor.name} · Trực ca sáng tại ${room.name}`}
                                >
                                  <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                  <span className="truncate">{morningDoctor.name}</span>
                                </div>
                              ) : (
                                <div className="flex h-11 w-full min-w-0 select-none items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-white/70 px-3 text-xs text-slate-400">
                                  <span>– Trống ca –</span>
                                </div>
                              )}
                            </td>

                            {/* Cột Ca Chiều */}
                            <td
                              className={`bg-white px-3 py-2.5 text-center ${
                                isLast ? 'border-b-0' : 'border-b border-slate-100'
                              }`}
                            >
                              {afternoonDoctor ? (
                                <div
                                  className="flex h-11 w-full min-w-0 select-none items-center justify-center gap-1.5 rounded-lg border border-emerald-300/90 bg-emerald-50/90 px-3 text-xs font-bold text-emerald-950 shadow-2xs"
                                  title={`${afternoonDoctor.name} · Trực ca chiều tại ${room.name}`}
                                >
                                  <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                  <span className="truncate">{afternoonDoctor.name}</span>
                                </div>
                              ) : (
                                <div className="flex h-11 w-full min-w-0 select-none items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-white/70 px-3 text-xs text-slate-400">
                                  <span>– Trống ca –</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Chú thích chân bảng */}
                <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden="true" className="inline-flex h-3.5 w-4 items-center justify-center rounded border border-emerald-300 bg-emerald-50">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <span>Bác sĩ đang tiếp nhận</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden="true" className="inline-flex h-3.5 w-4 items-center justify-center rounded border border-dashed border-slate-300 bg-white text-[10px] text-slate-400">–</span>
                    <span>Trống ca</span>
                  </span>
                </div>
              </div>
          </div>
        ) : (
          /* TRƯỜNG HỢP CHỌN CHUYÊN KHOA CHƯA CÓ LỊCH */
          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
            <CalendarClock className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-800">Chưa có lịch trực hôm nay cho chuyên khoa này</p>
            <p className="mt-1 max-w-md text-xs text-slate-500">
              Chuyên khoa này chưa được cấu hình phân công ca khám hoặc chưa xếp bác sĩ trực trong ngày hôm nay.
            </p>
            <button
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition"
              onClick={() => onNavigate('work-schedules')}
              type="button"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Thiết lập lịch phân công chuyên khoa</span>
            </button>
          </div>
        )}
      </section>

      {/* SECTION: VẬN HÀNH HÔM NAY VÀ VIỆC CẦN XỬ LÝ */}
      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-900">Vận hành hôm nay</h2>
              <p className="mt-1 text-xs text-slate-500">Thứ Tư, 28 tháng 10 năm 2026</p>
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
