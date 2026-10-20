'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import { getDoctorDetailById } from './data/doctor-detail-data';
import { DoctorHeaderCard } from './components/DoctorHeaderCard';
import { DoctorQuickBooking } from './components/DoctorQuickBooking';
import { DoctorBioSection } from './components/DoctorBioSection';
import { DoctorSpecialtiesSection } from './components/DoctorSpecialtiesSection';
import { DoctorClinicSection } from './components/DoctorClinicSection';
import { DoctorStickyBookingBar } from './components/DoctorStickyBookingBar';
import { DoctorBookingModal } from './components/DoctorBookingModal';

interface DoctorDetailScreenProps {
  doctorId: string;
}

export const DoctorDetailScreen: React.FC<DoctorDetailScreenProps> = ({ doctorId }) => {
  const doctor = getDoctorDetailById(doctorId);

  const [selectedDateId, setSelectedDateId] = useState(doctor.schedules[0]?.id || 'date-1');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const activeSchedule =
    doctor.schedules.find((s) => s.id === selectedDateId) || doctor.schedules[0];

  const selectedDateText = activeSchedule
    ? `${activeSchedule.dayText}, ${activeSchedule.dateText}`
    : 'Hôm nay';

  const handleTriggerBooking = () => {
    // If no slot is selected, default to the first morning slot
    if (!selectedSlot && doctor.morningSlots.length > 0) {
      setSelectedSlot(doctor.morningSlots[0]);
    }
    setIsBookingModalOpen(true);
  };

  return (
    <div className="flex-grow bg-slate-50/50 min-h-screen pb-28">
      {/* 1. Breadcrumbs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-4" data-purpose="breadcrumbs">
        <nav className="text-xs sm:text-sm text-slate-500 flex items-center space-x-2">
          <Link href="/" className="hover:text-blue-600 hover:underline flex items-center gap-1 font-medium">
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link href="/search?type=doctor" className="hover:text-blue-600 hover:underline font-medium">
            Bác sĩ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-none">
            {doctor.name}
          </span>
        </nav>
      </section>

      {/* 2. Doctor Profile Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header Card */}
          <DoctorHeaderCard doctor={doctor} />

          {/* Quick Booking */}
          <DoctorQuickBooking
            schedules={doctor.schedules}
            morningSlots={doctor.morningSlots}
            afternoonSlots={doctor.afternoonSlots}
            selectedDateId={selectedDateId}
            onSelectDate={setSelectedDateId}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />

          {/* Bio Section */}
          <DoctorBioSection bioP1={doctor.bioP1} expandableBio={doctor.expandableBio} />

          {/* Specialties Section */}
          <DoctorSpecialtiesSection specialties={doctor.treatmentSpecialties} />

          {/* Clinic Location & Gallery */}
          <DoctorClinicSection
            clinicAddress={doctor.clinicAddress}
            clinicMapQuery={doctor.clinicMapQuery}
            clinicImages={doctor.clinicImages}
          />
        </div>
      </main>

      {/* 3. Sticky Booking Bottom Bar */}
      <DoctorStickyBookingBar
        hotline={doctor.hotline}
        fee={doctor.fee}
        onBook={handleTriggerBooking}
      />

      {/* 4. Booking Dialog Modal */}
      <DoctorBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        doctor={doctor}
        selectedDateText={selectedDateText}
        selectedSlot={selectedSlot}
      />
    </div>
  );
};
