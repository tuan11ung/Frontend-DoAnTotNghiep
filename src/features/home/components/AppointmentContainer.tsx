'use client';

import React, { useState } from 'react';
import { AppointmentTabType } from '@/src/types/medical';
import { AppointmentTabs } from './AppointmentTabs';
import { FeaturedDoctorsSection } from './FeaturedDoctorsSection';
import { HospitalSection } from './HospitalSection';
import { MedicalSpecialtiesSection } from './MedicalSpecialtiesSection';
import { FeatureGuarantees } from './FeatureGuarantees';

interface AppointmentContainerProps {
  initialTab?: AppointmentTabType;
  currentTab?: AppointmentTabType;
  onTabChange?: (tab: AppointmentTabType) => void;
}

export const AppointmentContainer: React.FC<AppointmentContainerProps> = ({
  initialTab = 'doctor',
  currentTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<AppointmentTabType>(initialTab);
  const activeTab = currentTab ?? internalTab;

  const handleTabChange = (tab: AppointmentTabType) => {
    setInternalTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <div className="relative">
      {/* Quick Navigation Tabs */}
      <AppointmentTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Conditional Rendering according to React state */}
      {activeTab === 'doctor' && (
        <>
          <FeaturedDoctorsSection />
          <MedicalSpecialtiesSection />
        </>
      )}

      {activeTab === 'hospital' && (
        <>
          <HospitalSection />
          <FeatureGuarantees />
        </>
      )}
    </div>
  );
};
