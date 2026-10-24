'use client';

import React from 'react';
import {
  Baby,
  Syringe,
  Apple,
  Sparkles,
  Brain,
  Stethoscope,
  Activity,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { ClinicalServiceItem, HospitalDetail } from '../types';

interface HospitalServicesTabProps {
  hospital: HospitalDetail;
  onBackToInfo: () => void;
  onBookService: (service: ClinicalServiceItem) => void;
}

export const HospitalServicesTab: React.FC<HospitalServicesTabProps> = ({
  hospital,
  onBackToInfo,
  onBookService,
}) => {
  const renderServiceIcon = (iconType: ClinicalServiceItem['iconType'], accentColor?: string) => {
    switch (iconType) {
      case 'child':
        return (
          <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Baby className="w-5 h-5" />
          </span>
        );
      case 'vaccine':
        return (
          <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Syringe className="w-5 h-5" />
          </span>
        );
      case 'nutrition':
        return (
          <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Apple className="w-5 h-5" />
          </span>
        );
      case 'vip':
        return (
          <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </span>
        );
      case 'psychology':
        return (
          <span className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </span>
        );
      case 'surgery':
        return (
          <span className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </span>
        );
      default:
        return (
          <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Danh mục Chuyên khoa & Phòng khám {hospital.name}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Chọn gói khám hoặc chuyên khoa phù hợp để lấy số thứ tự trực tuyến
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToInfo}
            className="text-blue-600 hover:text-blue-700 hover:underline text-xs sm:text-sm font-bold flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại thông tin chung</span>
          </button>
        </div>

        {/* Clinical Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hospital.servicesList.map((service) => (
            <div
              key={service.id}
              className="p-5 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/70 hover:border-blue-200 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  {renderServiceIcon(service.iconType, service.accentColor)}
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-2xs">
                    {service.location}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-4 line-clamp-3 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="pt-3.5 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Chi phí dự kiến</span>
                  <span className="font-mono text-sm font-bold text-blue-600">
                    {service.price}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onBookService(service)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Đặt lịch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
