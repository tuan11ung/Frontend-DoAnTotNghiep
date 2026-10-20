'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DoctorBioSectionProps {
  bioP1: string;
  expandableBio?: string;
}

export const DoctorBioSection: React.FC<DoctorBioSectionProps> = ({
  bioP1,
  expandableBio,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="p-6 sm:p-8 border-b border-slate-100" data-purpose="doctor-bio">
      <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Giới thiệu</h2>
      <div className="text-sm leading-relaxed text-slate-600 space-y-3">
        <p>{bioP1}</p>
        {isExpanded && expandableBio && (
          <p className="animate-in fade-in duration-200">{expandableBio}</p>
        )}
        {expandableBio && (
          <div>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{isExpanded ? 'Thu gọn' : '...Xem thêm'}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
