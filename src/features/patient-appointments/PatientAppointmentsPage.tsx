'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  CalendarClock,
  Home,
  ChevronRight,
  Search,
  Filter,
  Users,
  Building2,
  Sparkles,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { usePatientAppointments } from './hooks/usePatientAppointments';
import { useFamilyMembers } from '@/src/features/patient-family/hooks/useFamilyMembers';
import { AppointmentCard } from './components/AppointmentCard';
import { AppointmentFilterTabs } from './components/AppointmentFilterTabs';
import { CancelAppointmentDialog } from './workflow/CancelAppointmentDialog';
import { AppointmentQrDialog } from './workflow/AppointmentQrDialog';
import { PatientAppointment, AppointmentFilterTab } from './models/types/appointment.types';

export function PatientAppointmentsPage() {
  const searchParams = useSearchParams();
  const initialTarget = searchParams.get('target') || 'ALL';

  const { appointments, loading, cancelAppointment } = usePatientAppointments();
  const { members } = useFamilyMembers();

  // Filters state
  const [currentTab, setCurrentTab] = useState<AppointmentFilterTab>('UPCOMING');
  const [selectedProfile, setSelectedProfile] = useState<string>(initialTarget);
  const [searchQuery, setSearchQuery] = useState('');

  // Workflow Dialogs
  const [qrAppointment, setQrAppointment] = useState<PatientAppointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<PatientAppointment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmCancel = (id: string, reason: string) => {
    const res = cancelAppointment(id, reason);
    if (res.success) {
      showToast(`Đã hủy lịch hẹn ${res.appointment?.code} thành công.`);
    } else {
      showToast(res.error || 'Có lỗi xảy ra khi hủy lịch.');
    }
  };

  // Lọc danh sách lịch hẹn
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // 1. Tab filter
      if (currentTab === 'UPCOMING') {
        if (!['BOOKED', 'CHECKED_IN', 'IN_PROGRESS'].includes(apt.status)) return false;
      } else if (currentTab === 'HISTORY') {
        if (!['COMPLETED', 'NO_SHOW'].includes(apt.status)) return false;
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

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCode = apt.code.toLowerCase().includes(query);
        const matchesHospital = apt.hospitalName.toLowerCase().includes(query);
        const matchesDoctor = apt.doctorName.toLowerCase().includes(query);
        const matchesPatient = apt.patientName.toLowerCase().includes(query);
        if (!matchesCode && !matchesHospital && !matchesDoctor && !matchesPatient) return false;
      }

      return true;
    });
  }, [appointments, currentTab, selectedProfile, searchQuery]);

  // Counts cho 3 tab
  const tabCounts = useMemo(() => {
    const baseList = selectedProfile === 'ALL'
      ? appointments
      : selectedProfile === 'SELF'
      ? appointments.filter((a) => a.targetType === 'SELF')
      : appointments.filter((a) => a.patientId === selectedProfile);

    return {
      upcoming: baseList.filter((a) => ['BOOKED', 'CHECKED_IN', 'IN_PROGRESS'].includes(a.status)).length,
      history: baseList.filter((a) => ['COMPLETED', 'NO_SHOW'].includes(a.status)).length,
      cancelled: baseList.filter((a) => a.status === 'CANCELLED').length,
    };
  }, [appointments, selectedProfile]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">Cổng bệnh nhân</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-blue-700 font-bold">Danh sách lịch khám</span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Banner Top */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-full text-xs font-bold mb-2">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Theo dõi lịch khám liên viện 24/7</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Lịch khám của tôi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Xem chi tiết vé khám điện tử, mã QR tiếp đón và quản lý hủy/đổi lịch khám cho bản thân & người nhà.
            </p>
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

        {/* Thanh công cụ: Chọn hồ sơ & Tìm kiếm */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Dropdown chọn Hồ sơ (Mục 8.1: Bản thân / từng người nhà) */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Users className="w-4 h-4 text-blue-600 shrink-0" />
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Hồ sơ khám:</label>
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-800"
            >
              <option value="ALL">Toàn bộ gia đình (Tất cả)</option>
              <option value="SELF">Bản thân (Nguyễn Văn An)</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.relationship === 'ME' ? 'Mẹ' : m.relationship === 'CHA' ? 'Cha' : m.relationship === 'CON' ? 'Con' : 'Người thân'})
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã lịch, bệnh viện, bác sĩ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Tabs Filter (Sắp tới / Lịch sử khám / Đã hủy) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 pt-3">
            <AppointmentFilterTabs
              currentTab={currentTab}
              onTabChange={(tab) => setCurrentTab(tab)}
              counts={tabCounts}
            />
          </div>
        </div>

        {/* Danh sách thẻ lịch khám */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 text-sm">Đang tải danh sách lịch khám...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <CalendarClock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {currentTab === 'UPCOMING'
                ? 'Không có lịch khám sắp tới nào'
                : currentTab === 'CANCELLED'
                ? 'Không có lịch khám đã hủy'
                : 'Chưa có lịch sử khám bệnh'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
              {currentTab === 'UPCOMING'
                ? 'Bạn hiện chưa có cuộc hẹn khám bệnh nào sắp diễn ra cho hồ sơ đang chọn.'
                : 'Các thông tin lịch hẹn đã qua hoặc hủy sẽ được lưu giữ tại đây.'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onOpenQr={(a) => setQrAppointment(a)}
                onOpenCancel={(a) => setCancelTarget(a)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Workflows */}
      <AppointmentQrDialog
        isOpen={Boolean(qrAppointment)}
        appointment={qrAppointment}
        onClose={() => setQrAppointment(null)}
      />

      <CancelAppointmentDialog
        isOpen={Boolean(cancelTarget)}
        appointment={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
}
