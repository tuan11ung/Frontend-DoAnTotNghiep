'use client';

import React from 'react';
import { PatientNotificationBell } from './components/PatientNotificationBell';

export function NotificationsPage() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <h1 className="text-xl font-bold text-slate-800">Thông báo của bạn</h1>
        <PatientNotificationBell />
      </div>
      <p className="text-sm text-slate-500">
        Xem tất cả thông báo cập nhật về lịch hẹn và trạng thái xử lý hồ sơ y tế.
      </p>
    </div>
  );
}
