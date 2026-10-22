'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Info,
  Download,
  Home,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';
import {
  BookingMode,
  DateOption,
  DoctorItem,
  HospitalItem,
  PatientInfo,
  SpecialtyItem,
} from '../types';

interface BookingStepSuccessProps {
  mode: BookingMode;
  hospital: HospitalItem;
  specialty: SpecialtyItem;
  doctor: DoctorItem | null;
  patient: PatientInfo;
  selectedDate: DateOption;
  selectedSlot: string;
  appointmentCode: string;
  onReset: () => void;
}

export const BookingStepSuccess: React.FC<BookingStepSuccessProps> = ({
  mode,
  hospital,
  specialty,
  doctor,
  patient,
  selectedDate,
  selectedSlot,
  appointmentCode,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(appointmentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const isBhyt = mode === 'bhyt';
  const priceDisplay = isBhyt ? '7.740 VNĐ' : doctor?.priceFormatted || specialty.priceFormatted;

  return (
    <div className="relative w-full max-w-xl mx-auto py-6 px-4">
      {/* Background Ambient Glow */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-20 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Success Pass Card */}
      <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden border border-slate-200">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-emerald-600 to-teal-500" />

        {/* Large Check-Circle Icon */}
        <div className="w-16 h-16 text-emerald-600 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner ring-4 ring-emerald-100">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Đã đặt lịch thành công!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
          Cảm ơn bạn đã tin tưởng dịch vụ khám chữa bệnh tại MedConnect.
        </p>

        {/* Highlighted Appointment Code Box */}
        <div className="bg-slate-50 rounded-2xl py-3 px-6 my-5 inline-flex flex-col items-center justify-center border border-slate-200/80 shadow-xs">
          <span className="text-[11px] tracking-wider font-semibold text-blue-700 uppercase">
            MÃ LỊCH HẸN TRỰC TUYẾN
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-xl sm:text-2xl font-bold text-blue-600 tracking-wider">
              {appointmentCode}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
              title="Sao chép mã"
              aria-label="Sao chép mã lịch hẹn"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {copied && <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">Đã sao chép vào bộ nhớ tạm!</span>}
        </div>

        {/* QR Code Section */}
        <div className="my-3 flex flex-col items-center">
          <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-3 flex flex-col items-center justify-center shadow-md border border-slate-200 relative group">
            {/* Brackets */}
            <div className="absolute top-2 left-2 w-3 h-3 rounded-tl border-t-2 border-l-2 border-blue-600" />
            <div className="absolute top-2 right-2 w-3 h-3 rounded-tr border-t-2 border-r-2 border-blue-600" />
            <div className="absolute bottom-2 left-2 w-3 h-3 rounded-bl border-b-2 border-l-2 border-blue-600" />
            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-br border-b-2 border-r-2 border-blue-600" />

            {/* Crisp QR Code Vector */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg
                className="w-full h-full text-slate-900"
                fill="none"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Finders */}
                <rect fill="currentColor" height="24" rx="3" width="24" x="6" y="6" />
                <rect fill="white" height="16" rx="2" width="16" x="10" y="10" />
                <rect fill="currentColor" height="8" rx="1" width="8" x="14" y="14" />

                <rect fill="currentColor" height="24" rx="3" width="24" x="70" y="6" />
                <rect fill="white" height="16" rx="2" width="16" x="74" y="10" />
                <rect fill="currentColor" height="8" rx="1" width="8" x="78" y="14" />

                <rect fill="currentColor" height="24" rx="3" width="24" x="6" y="70" />
                <rect fill="white" height="16" rx="2" width="16" x="10" y="74" />
                <rect fill="currentColor" height="8" rx="1" width="8" x="14" y="78" />

                {/* Timing lines */}
                <rect fill="currentColor" height="4" width="4" x="34" y="16" />
                <rect fill="currentColor" height="4" width="4" x="42" y="16" />
                <rect fill="currentColor" height="4" width="4" x="50" y="16" />
                <rect fill="currentColor" height="4" width="4" x="58" y="16" />
                <rect fill="currentColor" height="4" width="4" x="16" y="34" />
                <rect fill="currentColor" height="4" width="4" x="16" y="42" />
                <rect fill="currentColor" height="4" width="4" x="16" y="50" />
                <rect fill="currentColor" height="4" width="4" x="16" y="58" />

                {/* Matrix modules */}
                <rect fill="currentColor" height="4" width="4" x="34" y="6" />
                <rect fill="currentColor" height="4" width="4" x="42" y="10" />
                <rect fill="currentColor" height="4" width="4" x="58" y="6" />
                <rect fill="currentColor" height="4" width="4" x="54" y="10" />
                <rect fill="currentColor" height="4" width="4" x="6" y="34" />
                <rect fill="currentColor" height="4" width="4" x="10" y="42" />
                <rect fill="currentColor" height="4" width="4" x="6" y="58" />
                <rect fill="currentColor" height="4" width="4" x="34" y="34" />
                <rect fill="currentColor" height="4" width="4" x="38" y="38" />
                <rect fill="currentColor" height="4" width="4" x="58" y="34" />
                <rect fill="currentColor" height="4" width="4" x="62" y="38" />
                <rect fill="currentColor" height="4" width="4" x="70" y="34" />
                <rect fill="currentColor" height="4" width="4" x="78" y="38" />
                <rect fill="currentColor" height="4" width="4" x="86" y="34" />
                <rect fill="currentColor" height="4" width="4" x="90" y="42" />
                <rect fill="currentColor" height="4" width="4" x="34" y="62" />
                <rect fill="currentColor" height="4" width="4" x="42" y="66" />
                <rect fill="currentColor" height="4" width="4" x="58" y="62" />
                <rect fill="currentColor" height="4" width="4" x="62" y="66" />
                <rect fill="currentColor" height="4" width="4" x="34" y="74" />
                <rect fill="currentColor" height="4" width="4" x="38" y="82" />
                <rect fill="currentColor" height="4" width="4" x="42" y="90" />
                <rect fill="currentColor" height="4" width="4" x="50" y="78" />
                <rect fill="currentColor" height="4" width="4" x="58" y="86" />
                <rect fill="currentColor" height="4" width="4" x="62" y="74" />
                <rect fill="currentColor" height="4" width="4" x="70" y="54" />
                <rect fill="currentColor" height="4" width="4" x="78" y="58" />
                <rect fill="currentColor" height="4" width="4" x="86" y="54" />
                <rect fill="currentColor" height="4" width="4" x="74" y="66" />
                <rect fill="currentColor" height="4" width="4" x="82" y="74" />
                <rect fill="currentColor" height="4" width="4" x="90" y="70" />
                <rect fill="currentColor" height="4" width="4" x="70" y="86" />
                <rect fill="currentColor" height="4" width="4" x="78" y="90" />
                <rect fill="currentColor" height="4" width="4" x="86" y="82" />
                <rect fill="currentColor" height="4" width="4" x="90" y="90" />

                {/* Central MedConnect Cross */}
                <rect fill="white" height="18" rx="4" width="18" x="41" y="41" />
                <rect fill="#2563eb" height="14" rx="3" width="14" x="43" y="43" />
                <path d="M50 46V54M46 50H54" stroke="white" strokeLinecap="round" strokeWidth="2.5" />
              </svg>
            </div>
          </div>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full">
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs text-slate-600 font-medium">
              Quét để check-in tại Kiosk tự động
            </span>
          </div>
        </div>

        {/* Informative Help Box */}
        <div className="text-xs text-slate-600 bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 mb-5 text-left flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Vui lòng tải hoặc chụp màn hình mã QR này để xuất trình tại quầy lễ tân hoặc Kiosk tiếp đón thông minh của bệnh viện.
          </p>
        </div>

        {/* Appointment Details Summary Table */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 text-left mb-6 space-y-2.5 border border-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Thông tin chi tiết
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Đã xác thực
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-1">
            <span className="text-xs text-slate-500">Bệnh nhân</span>
            <span className="text-sm font-bold text-slate-900 text-left sm:text-right">
              {patient.name}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-1">
            <span className="text-xs text-slate-500">Cơ sở y tế</span>
            <span className="text-sm font-semibold text-slate-900 text-left sm:text-right">
              {hospital.name}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-1">
            <span className="text-xs text-slate-500">Chuyên khoa / Phòng</span>
            <div className="text-left sm:text-right">
              <span className="text-sm font-semibold text-slate-900 block">{specialty.name}</span>
              <span className="text-xs text-blue-600 font-medium">
                {doctor?.room || specialty.room}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-1">
            <span className="text-xs text-slate-500">Bác sĩ phụ trách</span>
            <span className="text-sm font-semibold text-slate-900 text-left sm:text-right">
              {mode === 'demand' && doctor ? doctor.name : 'Phòng khám phân công'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-1">
            <span className="text-xs text-slate-500">Thời gian khám</span>
            <div className="text-left sm:text-right">
              <span className="font-mono text-sm font-bold text-slate-900">{selectedSlot}</span>
              <span className="text-xs text-slate-500 block">{selectedDate.fullDate}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-1">
            <span className="text-xs text-slate-500">Hình thức &amp; phí khám</span>
            <div className="text-left sm:text-right">
              <div className="text-xs text-slate-700 font-medium">
                {isBhyt ? 'Khám BHYT • Đúng tuyến' : 'Khám theo yêu cầu'}
              </div>
              <div className="text-base font-bold text-blue-600 tracking-tight mt-0.5">
                {priceDisplay}
              </div>
              {isBhyt && (
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  (BHYT chi trả: 30.960 VNĐ)
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 border-t border-slate-200">
            <span className="text-xs text-slate-500">Thanh toán</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Chờ thanh toán tại quầy lễ tân
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Đã lưu ảnh phiếu hẹn!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-blue-600" />
                <span>Tải ảnh phiếu hẹn</span>
              </>
            )}
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
        </div>

        {/* Secondary Action */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Đặt thêm lịch khám mới</span>
          </button>
        </div>
      </div>

      {/* Security Note */}
      <div className="mt-6 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Hệ thống lưu trữ tuân thủ tiêu chuẩn an toàn dữ liệu y tế MOH &amp; HIPAA</span>
        </div>
        <p className="text-xs text-slate-400">
          Cần hỗ trợ đổi giờ hẹn? Vui lòng liên hệ Hotline:{' '}
          <strong className="text-slate-600">1900 888 866</strong>
        </p>
      </div>
    </div>
  );
};
