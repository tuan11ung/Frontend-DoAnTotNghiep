import type { ReactNode } from 'react';
import type { AppointmentTabType } from '@/src/types/medical';
import { AppointmentTabs } from './AppointmentTabs';

export function AppointmentContainer({currentTab,onTabChange,children}:{
  currentTab: AppointmentTabType;
  onTabChange: (tab:AppointmentTabType)=>void;
  children: ReactNode;
}) {
  return <div className="relative"><AppointmentTabs activeTab={currentTab} onTabChange={onTabChange}/>{children}</div>;
}
