'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { PatientBreadcrumb } from '@/src/shared/components/layout/PatientBreadcrumb';
import { useSearchParams } from 'next/navigation';
import {
  CalendarClock,
  Users,
  Sparkles,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { usePatientAppointments } from './hooks/usePatientAppointments';
import { AppointmentCard } from './components/AppointmentCard';
import { AppointmentFilterTabs } from './components/AppointmentFilterTabs';
import { CancelAppointmentDialog } from './workflow/CancelAppointmentDialog';
import { AppointmentQrDialog } from './workflow/AppointmentQrDialog';
import { AppointmentQueueDialog } from './workflow/AppointmentQueueDialog';
import { findAppointmentQueue, isAppointmentExpired, vietnamDate } from '@/src/features/appointment-tracking/utils/appointment-tracking';
import { PatientAppointment, AppointmentFilterTab } from './models/types/appointment.types';

export function PatientAppointmentsPage() {
  const searchParams = useSearchParams();
  const initialTarget = searchParams.get('target') || 'ALL';

  const { auth, appointments, profiles, loading, storageError, queueError, rooms, cancelAppointment, refresh } = usePatientAppointments();

  // Filters state
  const [currentTab, setCurrentTab] = useState<AppointmentFilterTab>(searchParams.get('tab') === 'ongoing' ? 'ONGOING' : 'UPCOMING');
  const [selectedProfile, setSelectedProfile] = useState<string>(initialTarget);

  // Workflow Dialogs
  const [qrAppointmentId, setQrAppointmentId] = useState<string | null>(null);
  const [queueAppointmentId, setQueueAppointmentId] = useState<string | null>(null);
  const qrAppointment = appointments.find((appointment) => appointment.id === qrAppointmentId) || null;
  const queueAppointment = appointments.find((appointment) => appointment.id === queueAppointmentId) || null;
  const [cancelTarget, setCancelTarget] = useState<PatientAppointment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmCancel = async (id: string, reason: string) => {
    const res = await cancelAppointment(id, reason);
    if (res.success) {
      showToast('Đã hủy lịch khám thành công.');
      requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
      return;
    }
    return res.error || 'Chưa thể hủy lịch khám. Vui lòng thử lại.';
  };

  const today = vietnamDate();
  // Lọc danh sách lịch hẹn
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // 1. Tab filter
      if (currentTab === 'UPCOMING') {
        if (!['BOOKED', 'PENDING_SPECIALTY'].includes(apt.status) || isAppointmentExpired(apt, today)) return false;
      } else if (currentTab === 'ONGOING') {
        if (!['CHECKED_IN', 'IN_PROGRESS'].includes(apt.status)) return false;
      } else if (currentTab === 'HISTORY') {
        if (!['COMPLETED', 'NO_SHOW'].includes(apt.status) && !isAppointmentExpired(apt, today)) return false;
      } else if (currentTab === 'CANCELLED') {
        if (apt.status !== 'CANCELLED') return false;
      }

      // 2. Profile filter
      if (selectedProfile !== 'ALL') {
        if (selectedProfile === 'SELF') {
          if (apt.targetType !== 'SELF') return false;
        } else {
          if (apt.patientId !== selectedProfile) return false;
        }
      }

      return true;
    });
  }, [appointments, currentTab, selectedProfile, today]);

  // Counts use the same status rules as the filtered lists.
  const tabCounts = useMemo(() => {
    const baseList = selectedProfile === 'ALL'
      ? appointments
      : selectedProfile === 'SELF'
      ? appointments.filter((a) => a.targetType === 'SELF')
      : appointments.filter((a) => a.patientId === selectedProfile);

    return {
      upcoming: baseList.filter((a) => ['BOOKED', 'PENDING_SPECIALTY'].includes(a.status) && !isAppointmentExpired(a, today)).length,
      ongoing: baseList.filter((a) => ['CHECKED_IN', 'IN_PROGRESS'].includes(a.status)).length,
      history: baseList.filter((a) => ['COMPLETED', 'NO_SHOW'].includes(a.status) || isAppointmentExpired(a, today)).length,
      cancelled: baseList.filter((a) => a.status === 'CANCELLED').length,
    };
  }, [appointments, selectedProfile, today]);

  if (auth.isReady && !auth.isAuthenticated) return <main className="mx-auto max-w-5xl p-8 text-center"><h1 className="text-xl font-bold">Lịch khám của tôi</h1><p className="my-4">Vui lòng đăng nhập để xem lịch khám.</p><Link href="/patient/login" className="font-bold text-blue-700">Đăng nhập</Link></main>;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <PatientBreadcrumb current="Danh sách lịch khám" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Banner Top */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Lịch khám của tôi
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md text-xs sm:text-sm transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đặt lịch khám mới</span>
            </Link>
          </div>
        </div>

        <section aria-label="Quản lý lịch khám" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-3 border-b border-slate-200 px-4 py-3 sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto]">
            <AppointmentFilterTabs
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              counts={tabCounts}
            />
            <div className="flex items-center gap-2.5 w-full shrink-0 sm:max-w-xs lg:w-72 lg:justify-self-end">
              <Users className="w-4 h-4 text-blue-600 shrink-0" />
              <label htmlFor="appointment-profile" className="text-xs font-bold text-slate-700 whitespace-nowrap">Hồ sơ khám:</label>
              <select
                id="appointment-profile"
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
                className="min-w-0 flex-1 px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-800"
              >
                <option value="ALL">Toàn bộ gia đình</option>
                <option value="SELF">Bản thân{profiles.find(p => p.relationship === 'SELF')?.fullName ? ` (${profiles.find(p => p.relationship === 'SELF')?.fullName})` : ''}</option>
                {(profiles.filter(p => p.relationship !== 'SELF').map(p => ({ id: String(p.id), fullName: p.fullName, relationship: 'KHAC' }))).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.relationship === 'ME' ? 'Mẹ' : m.relationship === 'CHA' ? 'Cha' : m.relationship === 'CON' ? 'Con' : 'Người thân'})
                  </option>
                ))}
              </select>
            </div>
          </div>

        {(storageError || queueError) && <p role="alert" className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900"><AlertCircle className="size-4 shrink-0" />{storageError || 'Chưa tải được hàng chờ. Vui lòng thử lại.'}</p>}
        {currentTab === 'UPCOMING' && tabCounts.ongoing > 0 && <div className="mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-900"><p><strong>{tabCounts.ongoing}</strong> lịch đã check-in đang diễn ra.</p><button type="button" onClick={() => setCurrentTab('ONGOING')} className="rounded-lg px-3 py-2 font-bold hover:bg-emerald-100">Xem số thứ tự & phòng khám →</button></div>}
        <div className="bg-slate-50/50 p-4 sm:p-5">
        {/* Danh sách thẻ lịch khám */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 text-sm">Đang tải danh sách lịch khám...</div>
        ) : storageError && appointments.length === 0 ? (
          <section className="rounded-2xl border border-rose-200 bg-white p-8 text-center"><h2 className="text-lg font-bold">Chưa tải được lịch khám</h2><p className="my-3 text-sm text-slate-600">Vui lòng thử lại để kiểm tra các lịch đã đặt.</p><button className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white" type="button" onClick={refresh}>Thử lại</button></section>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-6 text-center sm:p-12">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <CalendarClock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {currentTab === 'UPCOMING'
                ? 'Không có lịch khám sắp tới nào'
                : currentTab === 'ONGOING'
                ? 'Chưa có lịch khám đang diễn ra'
                : currentTab === 'CANCELLED'
                ? 'Không có lịch khám đã hủy'
                : 'Chưa có lịch sử khám bệnh'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
              {currentTab === 'UPCOMING'
                ? 'Bạn hiện chưa có cuộc hẹn khám bệnh nào sắp diễn ra cho hồ sơ đang chọn.'
                : currentTab === 'ONGOING' ? 'Sau khi lễ tân check-in, lịch hẹn sẽ xuất hiện tại đây để theo dõi phòng và số thứ tự.' : 'Các thông tin lịch hẹn đã qua hoặc hủy sẽ được lưu giữ tại đây.'}
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md hover:bg-blue-700 transition-all cursor-pointer"
            >
              <CalendarClock className="w-4 h-4" />
              <span>Đăng ký đặt lịch khám ngay</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filteredAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onOpenQr={(a) => setQrAppointmentId(a.id)}
                onOpenCancel={(a) => setCancelTarget(a)}
                onOpenQueue={(a) => setQueueAppointmentId(a.id)}
                queueError={queueError}
                queueRoom={rooms.find(room => room.key === JSON.stringify([apt.hospitalId, apt.departmentName, apt.roomName, apt.workDate]))}
              />
            ))}
          </div>
        )}
        </div>
        </section>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div role="status" className="fixed bottom-6 right-6 z-50 max-w-[calc(100vw-3rem)] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Workflows */}
      <AppointmentQrDialog
        queueRoom={qrAppointment ? findAppointmentQueue(rooms, qrAppointment) : undefined}
        queueError={queueError}
        isOpen={Boolean(qrAppointment)}
        appointment={qrAppointment}
        onClose={() => setQrAppointmentId(null)}
      />

      <AppointmentQueueDialog appointment={queueAppointment} room={queueAppointment ? findAppointmentQueue(rooms, queueAppointment) : undefined} onClose={() => setQueueAppointmentId(null)} />

      <CancelAppointmentDialog
        key={cancelTarget?.id || 'closed'}
        isOpen={Boolean(cancelTarget)}
        appointment={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
}
