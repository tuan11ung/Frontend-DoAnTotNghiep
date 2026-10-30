'use client';

import React, { useState } from 'react';
import { AppointmentTabType } from '@/src/shared/types/medical';
import { HeroSection } from './components/HeroSection';
import { AppointmentContainer } from './components/AppointmentContainer';
import { TrustAndValuesSection } from './components/TrustAndValuesSection';

export function HomePage() {
  const [activeTab, setActiveTab] = useState<AppointmentTabType>('doctor');

  const handleSelectTab = (tab: AppointmentTabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col flex-1">
      {/* 1. Hero Search & Banner */}
      <HeroSection onSelectTab={handleSelectTab} />

      {/* 2. Interactive Appointment Container (Tabs + Content) */}
      <AppointmentContainer currentTab={activeTab} onTabChange={handleSelectTab} />

      {/* 3. Trust & Core Values */}
      <TrustAndValuesSection onSelectTab={handleSelectTab} />
    </div>
  );
}

// Backward compatibility alias
export { HomePage as HomeScreen };
