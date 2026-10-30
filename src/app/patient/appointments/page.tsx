import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { PublicHeader, PublicFooter } from '@/src/shared';
import { PatientAppointmentsPage } from '@/src/features/patient-appointments/PatientAppointmentsPage';

export const metadata: Metadata = {
  title: 'Lịch khám của tôi | MedConnect',
  description: 'Theo dõi, tra cứu mã QR check-in và hủy lịch khám online thuận tiện',
};

function AppointmentsFallback() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
      <div className="h-8 bg-slate-200 rounded-xl w-64" />
      <div className="h-28 bg-slate-100 rounded-3xl" />
      <div className="space-y-4">
        <div className="h-44 bg-slate-100 rounded-3xl" />
        <div className="h-44 bg-slate-100 rounded-3xl" />
      </div>
    </div>
  );
}

export default function PatientAppointmentsRoute() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />
      <main className="flex-1">
        <Suspense fallback={<AppointmentsFallback />}>
          <PatientAppointmentsPage />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
