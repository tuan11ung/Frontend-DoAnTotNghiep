'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface DoctorSpecialtiesSectionProps {
  specialties: string[];
}

export const DoctorSpecialtiesSection: React.FC<DoctorSpecialtiesSectionProps> = ({
  specialties,
}) => {
  return (
    <section className="p-6 sm:p-8 border-b border-slate-100" data-purpose="doctor-specialties">
      <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Chuyên khám</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {specialties.map((spec, index) => (
          <div
            key={index}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm hover:border-blue-200 transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
            <span className="font-medium">{spec}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
