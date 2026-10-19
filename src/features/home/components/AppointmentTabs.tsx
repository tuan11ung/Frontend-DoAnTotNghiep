'use client';

import React from 'react';
import { Stethoscope, Hospital, BriefcaseMedical } from 'lucide-react';
import { AppointmentTabType } from '@/src/types/medical';

interface AppointmentTabsProps {
  activeTab: AppointmentTabType;
  onTabChange: (tab: AppointmentTabType) => void;
}

export const AppointmentTabs: React.FC<AppointmentTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <section
      className="bg-white border-b border-slate-200 relative -mt-8 mx-4 sm:mx-6 lg:mx-auto max-w-7xl rounded-2xl shadow-lg z-20"
      data-purpose="quick-appointment-category-tabs"
      id="sub-nav-tabs"
    >
      <div className="px-3 sm:px-6">
        <nav aria-label="Loại hình đặt khám" className="flex items-center justify-center sm:justify-start sm:gap-6 overflow-x-auto custom-scrollbar-hide">
          {/* Tab 1: Bác sĩ */}
          <button
            className={`flex-shrink-0 flex items-center gap-2.5 py-4 px-3 sm:px-5 text-sm transition-colors cursor-pointer ${
              activeTab === 'doctor'
                ? 'font-bold text-blue-600 border-b-2 border-blue-600'
                : 'font-semibold text-slate-600 hover:text-blue-600 border-b-2 border-transparent hover:border-slate-300'
            }`}
            onClick={() => onTabChange('doctor')}
            type="button"
            id="tab-btn-doctor"
          >
            <Stethoscope className={`w-4 h-4 ${activeTab === 'doctor' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Đặt khám Bác sĩ</span>
          </button>

          {/* Tab 2: Bệnh viện */}
          <button
            className={`flex-shrink-0 flex items-center gap-2.5 py-4 px-3 sm:px-5 text-sm transition-colors cursor-pointer ${
              activeTab === 'hospital'
                ? 'font-bold text-blue-600 border-b-2 border-blue-600'
                : 'font-semibold text-slate-600 hover:text-blue-600 border-b-2 border-transparent hover:border-slate-300'
            }`}
            onClick={() => onTabChange('hospital')}
            type="button"
            id="tab-btn-hospital"
          >
            <Hospital className={`w-4 h-4 ${activeTab === 'hospital' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Đặt khám Bệnh viện</span>
          </button>

          {/* Tab 3: Phòng khám */}
          <button
            className={`flex-shrink-0 flex items-center gap-2.5 py-4 px-3 sm:px-5 text-sm transition-colors cursor-pointer ${
              activeTab === 'clinic'
                ? 'font-bold text-blue-600 border-b-2 border-blue-600'
                : 'font-semibold text-slate-600 hover:text-blue-600 border-b-2 border-transparent hover:border-slate-300'
            }`}
            onClick={() => onTabChange('clinic')}
            type="button"
            id="tab-btn-clinic"
          >
            <BriefcaseMedical className={`w-4 h-4 ${activeTab === 'clinic' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Đặt khám Phòng khám</span>
          </button>
        </nav>
      </div>
    </section>
  );
};
