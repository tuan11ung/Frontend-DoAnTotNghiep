'use client';

import React from 'react';
import { AppointmentFilterTab } from '../models/types/appointment.types';

interface AppointmentFilterTabsProps {
  currentTab: AppointmentFilterTab;
  onTabChange: (tab: AppointmentFilterTab) => void;
  counts: {
    upcoming: number;
    history: number;
    cancelled: number;
  };
}

export function AppointmentFilterTabs({
  currentTab,
  onTabChange,
  counts,
}: AppointmentFilterTabsProps) {
  const tabs: { key: AppointmentFilterTab; label: string; count: number }[] = [
    { key: 'UPCOMING', label: 'Lịch sắp tới', count: counts.upcoming },
    { key: 'HISTORY', label: 'Lịch sử khám', count: counts.history },
    { key: 'CANCELLED', label: 'Lịch đã hủy', count: counts.cancelled },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            type="button"
            className={`flex items-center gap-2 py-3 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                isActive
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
