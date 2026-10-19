'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Hospital,
  Activity,
  HeartPulse,
  Sparkles,
  User,
  PlusSquare,
  Award,
  ChevronRight,
} from 'lucide-react';
import { HospitalProps } from '@/src/types/medical';
import { HOSPITALS_LIST } from '@/src/features/home/data/medical-data';

interface HospitalSectionProps {
  hospitals?: HospitalProps[];
}

export const HospitalSection: React.FC<HospitalSectionProps> = ({
  hospitals = HOSPITALS_LIST,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('Tất cả');
  const [selectedLevel, setSelectedLevel] = useState('Tất cả');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((hosp) => {
      const matchSearch =
        searchTerm === '' ||
        hosp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hosp.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDistrict =
        selectedDistrict === 'Tất cả' ||
        hosp.address.toLowerCase().includes(selectedDistrict.toLowerCase());

      const matchLevel =
        selectedLevel === 'Tất cả' ||
        (hosp.level && hosp.level.toLowerCase().includes(selectedLevel.toLowerCase()));

      const matchQuickFilter =
        !activeQuickFilter ||
        (activeQuickFilter === 'Khám có BHYT' ? hosp.hasInsurance : hosp.name.toLowerCase().includes(activeQuickFilter.toLowerCase()));

      return matchSearch && matchDistrict && matchLevel && matchQuickFilter;
    });
  }, [hospitals, searchTerm, selectedDistrict, selectedLevel, activeQuickFilter]);

  const renderIcon = (iconName: HospitalProps['iconName']) => {
    switch (iconName) {
      case 'hospital':
        return <Hospital className="w-6 h-6" />;
      case 'notes-medical':
        return <Activity className="w-6 h-6" />;
      case 'heart-pulse':
        return <HeartPulse className="w-6 h-6" />;
      case 'tooth':
        return <Sparkles className="w-6 h-6" />;
      case 'hospital-user':
        return <User className="w-6 h-6" />;
      case 'square-plus':
        return <PlusSquare className="w-6 h-6" />;
      case 'ribbon':
        return <Award className="w-6 h-6" />;
      default:
        return <Hospital className="w-6 h-6" />;
    }
  };

  return (
    <section className="py-12 bg-white" data-purpose="hospital-booking-list" id="view-hospital">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Đặt khám trực tuyến với các Bệnh viện
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Chủ động chọn lịch hẹn - Đi khám không đợi chờ
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
                placeholder="Tìm tên bệnh viện (VD: Nhi đồng 2, Ung Bướu)"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <select
                aria-label="Chọn Quận / Huyện"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                <option value="Tất cả">Tất cả Quận / Huyện</option>
                <option value="Quận 1">Quận 1</option>
                <option value="Quận 3">Quận 3</option>
                <option value="Quận 5">Quận 5</option>
                <option value="Quận 10">Quận 10</option>
                <option value="Bình Thạnh">Bình Thạnh</option>
                <option value="Thủ Đức">TP. Thủ Đức</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <select
                aria-label="Chọn Tuyến bệnh viện"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="Tất cả">Tất cả Tuyến</option>
                <option value="Trung ương">Tuyến Trung ương</option>
                <option value="Thành phố">Tuyến Thành phố</option>
                <option value="Huyện">Tuyến Quận / Huyện</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                type="button"
              >
                <Search className="w-4 h-4" />
                <span>Tìm kiếm</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-200/80 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Phổ biến:</span>
            {['Đa khoa', 'Nhi khoa', 'Răng Hàm Mặt', 'Y học cổ truyền', 'Ung Bướu'].map((filter) => (
              <button
                key={filter}
                className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                  activeQuickFilter === filter
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-slate-200 hover:border-blue-500 hover:text-blue-600'
                }`}
                type="button"
                onClick={() => setActiveQuickFilter(activeQuickFilter === filter ? null : filter)}
              >
                {filter}
              </button>
            ))}
            <button
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                activeQuickFilter === 'Khám có BHYT'
                  ? 'bg-blue-600 text-white border border-blue-600'
                  : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
              }`}
              type="button"
              onClick={() => setActiveQuickFilter(activeQuickFilter === 'Khám có BHYT' ? null : 'Khám có BHYT')}
            >
              Khám có BHYT
            </button>
          </div>
        </div>

        {/* Hospital List */}
        <div className="border-t border-slate-200 divide-y divide-slate-100">
          {filteredHospitals.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Không tìm thấy bệnh viện phù hợp với điều kiện tìm kiếm.
            </div>
          ) : (
            filteredHospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border border-slate-200 p-1 flex items-center justify-center bg-white shadow-xs flex-shrink-0">
                    <div
                      className={`w-full h-full rounded-full border-2 ${hospital.iconBorderClass} ${hospital.iconTextClass} ${hospital.iconBgClass} flex items-center justify-center`}
                    >
                      {renderIcon(hospital.iconName)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors">
                        {hospital.name}
                      </h3>
                      {hospital.level && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 rounded">
                          {hospital.level}
                        </span>
                      )}
                      {hospital.hasInsurance && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 rounded">
                          Có BHYT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{hospital.address}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <button
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    type="button"
                  >
                    Xem lịch khoa phòng
                  </button>
                  <button
                    className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                    type="button"
                  >
                    Đặt khám ngay
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Hospital Pagination */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <button className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer">
            1
          </button>
          <button className="w-9 h-9 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer">
            2
          </button>
          <button className="w-9 h-9 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer">
            3
          </button>
          <button className="w-9 h-9 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer">
            4
          </button>
          <button
            aria-label="Trang tiếp theo"
            className="w-9 h-9 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
