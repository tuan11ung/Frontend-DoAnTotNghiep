'use client';

import React, { useState, useMemo } from 'react';
import { Search, MapPin, Clock, Phone, BriefcaseMedical, CheckCircle2 } from 'lucide-react';
import { ClinicProps } from '@/src/types/medical';
import { CLINICS_LIST } from '@/src/features/home/data/medical-data';

interface ClinicListSectionProps {
  clinics?: ClinicProps[];
}

export const ClinicListSection: React.FC<ClinicListSectionProps> = ({
  clinics = CLINICS_LIST,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('Tất cả');

  const filteredClinics = useMemo(() => {
    return clinics.filter((clinic) => {
      const matchSearch =
        searchTerm === '' ||
        clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDistrict =
        selectedDistrict === 'Tất cả' ||
        clinic.district.toLowerCase().includes(selectedDistrict.toLowerCase());

      return matchSearch && matchDistrict;
    });
  }, [clinics, searchTerm, selectedDistrict]);

  return (
    <section className="py-12 bg-white" data-purpose="clinic-booking-list" id="view-clinic">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Đặt khám tại các Phòng khám uy tín
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Mạng lưới phòng khám chuyên khoa &amp; đa khoa chất lượng cao
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8 relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
                placeholder="Tìm theo tên phòng khám, chuyên khoa (VD: Vinmec, Da liễu, CarePlus)..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="md:col-span-4">
              <select
                aria-label="Chọn Quận / Huyện"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                <option value="Tất cả">Tất cả Quận / Huyện</option>
                <option value="Quận 1">Quận 1</option>
                <option value="Quận 3">Quận 3</option>
                <option value="Quận 7">Quận 7</option>
                <option value="Quận 10">Quận 10</option>
                <option value="Phú Nhuận">Phú Nhuận</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clinic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClinics.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-500 text-sm">
              Không tìm thấy phòng khám phù hợp với tìm kiếm của bạn.
            </div>
          ) : (
            filteredClinics.map((clinic) => (
              <article
                key={clinic.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-lg card-hover-transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <BriefcaseMedical className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded mb-1">
                          {clinic.type}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors leading-snug">
                          {clinic.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 my-3">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{clinic.address}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{clinic.workingHours}</span>
                    </p>
                    {clinic.hotline && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Hotline: <strong className="text-slate-800">{clinic.hotline}</strong></span>
                      </p>
                    )}
                  </div>

                  {/* Specialties Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                    {clinic.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="px-2.5 py-1 text-[11px] font-medium bg-slate-50 text-slate-700 rounded-lg border border-slate-100"
                      >
                        {spec}
                      </span>
                    ))}
                    {clinic.hasInsurance && (
                      <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Có BHYT
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-100">
                  <button
                    className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    type="button"
                  >
                    Xem chi tiết
                  </button>
                  <button
                    className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                    type="button"
                  >
                    Đặt lịch ngay
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
