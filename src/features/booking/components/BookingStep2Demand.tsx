'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Building2,
  Stethoscope,
  UserCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Edit,
  BadgePercent,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  HospitalItem,
  SpecialtyItem,
  DoctorItem,
  DemandSubtype,
  PatientInfo,
} from '../types';
import { MOCK_HOSPITALS } from '../data/booking-mock-data';
import { HospitalSelectModal } from './HospitalSelectModal';
import { SpecialtySelectModal } from './SpecialtySelectModal';
import { DoctorSelectModal } from './DoctorSelectModal';

interface BookingStep2DemandProps {
  hospital: HospitalItem;
  demandType: DemandSubtype;
  specialty: SpecialtyItem;
  doctor: DoctorItem | null;
  patient: PatientInfo;
  onUpdateHospital: (hospital: HospitalItem) => void;
  onUpdateDemandType: (type: DemandSubtype) => void;
  onUpdateSpecialty: (specialty: SpecialtyItem) => void;
  onUpdateDoctor: (doctor: DoctorItem) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const BookingStep2Demand: React.FC<BookingStep2DemandProps> = ({
  hospital,
  demandType,
  specialty,
  doctor,
  patient,
  onUpdateHospital,
  onUpdateDemandType,
  onUpdateSpecialty,
  onUpdateDoctor,
  onBack,
  onContinue,
}) => {
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

  const activeName = demandType === 'doctor' && doctor ? doctor.name : specialty.name;
  const activePrice = demandType === 'doctor' && doctor ? doctor.priceFormatted : specialty.priceFormatted;
  const activeDesc = demandType === 'doctor' && doctor ? doctor.desc : specialty.desc;

  return (
    <div className="space-y-6">
      {/* Step Container Card */}
      <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-slate-200 space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Bước 2: Chọn cơ sở khám &amp; Hình thức tiếp đón chuyên sâu
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Chọn bệnh viện tiếp đón trước, sau đó xác định hình thức phân luồng chi tiết
              </p>
            </div>
          </div>
          <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full font-semibold">
            Bắt buộc
          </span>
        </div>

        {/* Phần 1: Chọn bệnh viện tiếp đón */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-900 flex items-center justify-between">
            <span>
              Bệnh viện tiếp đón <span className="text-rose-500">*</span>
            </span>
            <button
              type="button"
              onClick={() => setIsHospitalModalOpen(true)}
              className="text-xs sm:text-sm text-blue-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" /> Đổi cơ sở khác
            </button>
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <select
              value={hospital.id}
              onChange={(e) => {
                const found = MOCK_HOSPITALS.find((h) => h.id === e.target.value);
                if (found) onUpdateHospital(found);
              }}
              className="w-full h-12 pl-11 pr-10 bg-white rounded-xl text-sm font-semibold text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none cursor-pointer border border-slate-200"
            >
              {MOCK_HOSPITALS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.address})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Phần 2: Chọn 1 trong 2 hình thức chuyên sâu */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-slate-900">
              Chọn 1 trong 2 hình thức chuyên sâu: <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Bấm vào từng thẻ để đổi phương thức tiếp đón
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Theo chuyên khoa */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                onUpdateDemandType('specialty');
                setIsSpecialtyModalOpen(true);
              }}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between shadow-xs text-left ${
                demandType === 'specialty'
                  ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      demandType === 'specialty'
                        ? 'border-blue-600 bg-white'
                        : 'border-slate-300 bg-slate-50'
                    }`}
                  >
                    {demandType === 'specialty' ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-transparent" />
                    )}
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Theo chuyên khoa</h3>
                <p className="text-xs text-slate-500">Phòng khám chuyên khoa bệnh viện phân công</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between text-blue-600 font-semibold text-xs">
                <span className="truncate">{specialty.name}</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </div>
            </div>

            {/* Card 2: Theo bác sĩ */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                onUpdateDemandType('doctor');
                setIsDoctorModalOpen(true);
              }}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between shadow-xs text-left ${
                demandType === 'doctor'
                  ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      demandType === 'doctor'
                        ? 'border-blue-600 bg-white'
                        : 'border-slate-300 bg-slate-50'
                    }`}
                  >
                    {demandType === 'doctor' ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-transparent" />
                    )}
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Theo bác sĩ</h3>
                <p className="text-xs text-slate-500">Chỉ định đích danh chuyên gia thăm khám</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between text-blue-600 font-semibold text-xs">
                <span className="truncate">{doctor ? doctor.name : 'Chưa chọn bác sĩ'}</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Profile chi tiết lựa chọn đã chọn */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            {demandType === 'doctor' && doctor ? (
              <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-500/20 shadow-sm">
                <Image
                  src={doctor.avatar}
                  alt={doctor.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Stethoscope className="w-7 h-7" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-slate-900">{activeName}</span>
                <span className="text-xs text-blue-700 bg-blue-100/70 font-semibold px-2 py-0.5 rounded">
                  {activePrice}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{activeDesc}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (demandType === 'doctor') setIsDoctorModalOpen(true);
              else setIsSpecialtyModalOpen(true);
            }}
            className="bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            <span>Đổi lựa chọn</span>
          </button>
        </div>
      </section>

      {/* THÔNG TIN BỆNH NHÂN RÚT GỌN */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs shrink-0">
            <BadgePercent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-slate-900">
                Bệnh nhân: {patient.name}
              </span>
              <span className="text-slate-300 font-light hidden sm:inline">|</span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                Mã BN: {patient.code}
              </span>
              <span className="text-slate-300 font-light hidden sm:inline">|</span>
              <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded font-mono border border-emerald-200">
                BHYT: {patient.bhytNumber}
              </span>
              <span className="text-slate-300 font-light hidden sm:inline">|</span>
              <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                CCCD: {patient.cccd}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Cơ sở ĐK KCB ban đầu: {patient.initialHospital} • Hiệu lực BHYT: Đang hoạt động
            </p>
          </div>
        </div>
      </div>

      {/* STICKY FLOATING ACTION BAR */}
      <div className="sticky bottom-4 z-40 w-full max-w-5xl mx-auto mt-4">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200 py-3.5 px-5 sm:px-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left side */}
          <div className="w-full sm:w-auto text-left">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-slate-500 font-medium">Hình thức đang chọn:</span>
              <span className="text-sm font-bold text-blue-600 tracking-tight">
                Khám theo yêu cầu (Chuyên sâu)
              </span>
            </div>
            <p className="text-xs text-emerald-700 flex items-center gap-1 mt-0.5 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Đang chọn: {activeName} (Phí khám: {activePrice})
            </p>
          </div>

          {/* Right side */}
          <div className="w-full sm:w-auto flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>

            <button
              type="button"
              onClick={onContinue}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base px-7 py-3 rounded-lg shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer"
            >
              <span>Tiếp tục</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
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

      <DoctorSelectModal
        isOpen={isDoctorModalOpen}
        selectedDoctorId={doctor?.id || ''}
        onSelect={onUpdateDoctor}
        onClose={() => setIsDoctorModalOpen(false)}
      />
    </div>
  );
};
