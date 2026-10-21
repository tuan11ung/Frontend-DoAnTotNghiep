'use client';

import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { DoctorDetail } from '../types';

interface DoctorHeaderCardProps {
  doctor: DoctorDetail;
}

export const DoctorHeaderCard: React.FC<DoctorHeaderCardProps> = ({ doctor }) => {
  return (
    <div className="p-6 sm:p-8 border-b border-slate-100" data-purpose="doctor-header-card">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* Avatar */}
        <div className="relative shrink-0 mx-auto sm:mx-0">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-blue-50 shadow-inner bg-slate-100 flex items-center justify-center">
            <Image
              alt={doctor.name}
              src={doctor.avatarUrl}
              width={128}
              height={128}
              className="w-full h-full object-cover object-top"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 w-full text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {doctor.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>{doctor.titleBadge}</span>
            </span>
            <span className="text-xs text-slate-700 font-bold">
              <span className="font-extrabold text-slate-900">{doctor.experienceYears}</span> năm kinh nghiệm
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-sm space-y-2 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-1 sm:gap-2">
              <span className="text-slate-400 font-normal">Chuyên khoa</span>
              <span className="font-medium text-blue-600 hover:underline cursor-pointer">
                {doctor.specialty}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-1 sm:gap-2">
              <span className="text-slate-400 font-normal">Chức vụ</span>
              <span className="font-medium text-slate-800">{doctor.position}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-1 sm:gap-2">
              <span className="text-slate-400 font-normal">Nơi công tác</span>
              <span className="font-medium text-slate-800">{doctor.workplace}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-1 sm:gap-2 items-center pt-1">
              <span className="text-slate-400 font-normal">Phí khám</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-600 text-base">{doctor.fee}</span>
                {doctor.feeNote && (
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    {doctor.feeNote}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
