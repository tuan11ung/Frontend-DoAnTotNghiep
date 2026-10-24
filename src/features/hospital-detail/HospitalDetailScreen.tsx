'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getHospitalDetailById } from './data/hospital-detail-data';
import { HospitalDetailHeader } from './components/HospitalDetailHeader';
import { HospitalPhotoGallery } from './components/HospitalPhotoGallery';
import { HospitalInfoTab } from './components/HospitalInfoTab';
import { HospitalServicesTab } from './components/HospitalServicesTab';
import { HospitalPricingModal } from './components/HospitalPricingModal';
import { ClinicalServiceItem } from './types';
import { BellRing, X } from 'lucide-react';

interface HospitalDetailScreenProps {
  hospitalId: string;
}

export const HospitalDetailScreen: React.FC<HospitalDetailScreenProps> = ({
  hospitalId,
}) => {
  const router = useRouter();
  const hospital = getHospitalDetailById(hospitalId);
  const [activeTab, setActiveTab] = useState<'info' | 'services'>('info');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);

  const handleOpenBooking = (_serviceName?: string) => {
    router.push(`/booking?step=1&hospitalId=${encodeURIComponent(hospital.id)}`);
  };

  const handleBookService = (_service: ClinicalServiceItem) => {
    router.push(`/booking?step=1&hospitalId=${encodeURIComponent(hospital.id)}`);
  };

  const handleScrollToMap = () => {
    if (activeTab !== 'info') {
      setActiveTab('info');
    }
    setTimeout(() => {
      const mapSection = document.getElementById('hospital-map-section');
      if (mapSection) {
        mapSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleScheduleAlert = () => {
    setScheduleNotice(
      `Lịch bác sĩ ${hospital.name} trực tuần này đã cập nhật! Đã sẵn sàng các chuyên gia Khoa Hô hấp, Sơ sinh và Dinh dưỡng.`
    );
  };

  return (
    <div className="flex-grow bg-slate-50/40 min-h-screen">
      {/* Schedule notice toast */}
      {scheduleNotice && (
        <div className="fixed top-24 right-4 z-50 max-w-md bg-white border border-blue-200 shadow-xl rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-5 duration-200">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <BellRing className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h5 className="font-bold text-xs sm:text-sm text-slate-900">Thông báo lịch trực</h5>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{scheduleNotice}</p>
          </div>
          <button
            type="button"
            onClick={() => setScheduleNotice(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header & Identity */}
      <HospitalDetailHeader
        hospital={hospital}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenBooking={() => handleOpenBooking()}
        onScrollToMap={handleScrollToMap}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        {/* 2. Photo Gallery Grid Section */}
        <HospitalPhotoGallery gallery={hospital.gallery} />

        {/* 3. Tab Views */}
        {activeTab === 'info' ? (
          <HospitalInfoTab
            hospital={hospital}
            onOpenPricingModal={() => setIsPricingOpen(true)}
            onScheduleAlert={handleScheduleAlert}
          />
        ) : (
          <HospitalServicesTab
            hospital={hospital}
            onBackToInfo={() => setActiveTab('info')}
            onBookService={handleBookService}
          />
        )}
      </div>

      {/* Modals */}

      <HospitalPricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        hospital={hospital}
      />
    </div>
  );
};
