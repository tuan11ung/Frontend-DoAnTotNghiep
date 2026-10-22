'use client';

import React, { useState } from 'react';
import {
  Building2,
  Stethoscope,
  MapPin,
  Phone,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { HospitalItem, SpecialtyItem, InsuranceRouteType, PatientInfo } from '../types';
import { HospitalSelectModal } from './HospitalSelectModal';
import { SpecialtySelectModal } from './SpecialtySelectModal';

interface BookingStep2BhytProps {
  hospital: HospitalItem;
  specialty: SpecialtyItem;
  patient: PatientInfo;
  routeType: InsuranceRouteType;
  onUpdateHospital: (hospital: HospitalItem) => void;
  onUpdateSpecialty: (specialty: SpecialtyItem) => void;
  onUpdateRouteType: (route: InsuranceRouteType) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const BookingStep2Bhyt: React.FC<BookingStep2BhytProps> = ({
  hospital,
  specialty,
  patient,
  routeType,
  onUpdateHospital,
  onUpdateSpecialty,
  onUpdateRouteType,
  onBack,
  onContinue,
}) => {
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);

  const getRouteLabel = () => {
    switch (routeType) {
      case 'thong-tuyen':
        return '(Thông tuyến BHYT)';
      case 'chuyen-vien':
        return '(Trái tuyến có giấy chuyển)';
      default:
        return '(Đúng tuyến BHYT)';
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: CHỌN CƠ SỞ Y TẾ */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm" data-purpose="hospital-selection-section">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Chọn cơ sở y tế</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Chỉ hiển thị các cơ sở có liên thông tiếp nhận khám chữa bệnh BHYT.
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            {hospital.tier}
          </span>
        </div>

        {/* Selected Hospital Display Card */}
        <div className="relative rounded-xl p-4 sm:p-5 border-2 border-blue-600 bg-blue-50/40 transition hover:shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {hospital.name}
                </h3>
                {hospital.tag && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
                    {hospital.tag}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 flex flex-wrap items-center gap-2 pl-0 sm:pl-9">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {hospital.address}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  Hotline: {hospital.hotline}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-blue-700 font-semibold bg-blue-100/70 px-2 py-0.5 rounded">
                  Mã ĐKKCB: {hospital.code}
                </span>
              </p>
            </div>

            <div className="shrink-0 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsHospitalModalOpen(true)}
                className="px-4 py-2.5 rounded-lg border border-blue-600 bg-white text-blue-600 text-xs sm:text-sm font-bold hover:bg-blue-600 hover:text-white transition shadow-xs active:scale-95 cursor-pointer"
              >
                Đổi cơ sở y tế
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CHỌN CHUYÊN KHOA & TUYẾN KHÁM */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm" data-purpose="specialty-insurance-section">
        <div className="mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Chọn chuyên khoa</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Chọn xong chuyên khoa sẽ chuyển sang bước chọn ngày khám.
          </p>
        </div>

        <div className="space-y-4">
          {/* Specialty Picker Row */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 hover:border-blue-400 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500">Chuyên khoa khám</div>
                <div className="text-sm sm:text-base font-bold text-slate-900">{specialty.name}</div>
                <div className="text-xs text-slate-500">{specialty.sub}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSpecialtyModalOpen(true)}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg border border-blue-600 bg-white text-blue-600 text-xs sm:text-sm font-bold hover:bg-blue-600 hover:text-white transition shadow-xs active:scale-95 cursor-pointer"
            >
              Đổi chuyên khoa
            </button>
          </div>

          {/* BHYT Card Verification Row */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-0.5">Thẻ BHYT Bệnh nhân</label>
                <div className="text-sm sm:text-base font-bold text-slate-800 tracking-wide font-mono">
                  {patient.bhytNumber}{' '}
                  <span className="text-slate-400 font-sans font-normal mx-1">•</span>{' '}
                  <span className="text-slate-600 font-sans font-medium text-xs sm:text-sm">
                    Hạn: {patient.expiryDate}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Còn hiệu lực
              </span>
            </div>
          </div>

          {/* Tuyến Khám Dropdown */}
          <div>
            <label htmlFor="tuyen-kham-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Tuyến khám
            </label>
            <div className="relative">
              <select
                id="tuyen-kham-select"
                value={routeType}
                onChange={(e) => onUpdateRouteType(e.target.value as InsuranceRouteType)}
                className="block w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-semibold text-slate-900 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer appearance-none outline-none"
              >
                <option value="dung-tuyen">Đúng tuyến</option>
                <option value="thong-tuyen">Thông tuyến khám chữa bệnh ngoại trú</option>
                <option value="chuyen-vien">Trái tuyến (Có giấy chuyển tuyến hợp lệ)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: BOTTOM ACTION BAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Quay lại</span>
        </button>

        {/* Dynamic Selection Summary Display */}
        <div className="text-center md:text-left flex-1 md:px-6">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Đã chọn:</div>
          <div className="text-sm sm:text-base font-extrabold text-slate-900">{hospital.name}</div>
          <div className="text-xs text-slate-600">
            Chuyên khoa: <span className="font-semibold text-slate-800">{specialty.name}</span>{' '}
            <span className="text-emerald-700 font-semibold">{getRouteLabel()}</span>
          </div>
        </div>

        {/* Next Step Button */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-bold shadow-md shadow-blue-500/25 transition active:scale-95 cursor-pointer"
        >
          <span>Tiếp tục</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modals */}
      <HospitalSelectModal
        isOpen={isHospitalModalOpen}
        selectedHospitalId={hospital.id}
        onSelect={onUpdateHospital}
        onClose={() => setIsHospitalModalOpen(false)}
      />

      <SpecialtySelectModal
        isOpen={isSpecialtyModalOpen}
        selectedSpecialtyId={specialty.id}
        onSelect={onUpdateSpecialty}
        onClose={() => setIsSpecialtyModalOpen(false)}
      />
    </div>
  );
};
