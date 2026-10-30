'use client';

import React, { useState } from 'react';
import {
  FileText,
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  User,
  CreditCard,
  ShieldCheck,
  Info,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  BookingMode,
  BookingTarget,
  DateOption,
  DoctorItem,
  HospitalItem,
  PatientInfo,
  SpecialtyItem,
} from '../types';

interface BookingStep4ConfirmProps {
  mode: BookingMode;
  target?: BookingTarget;
  hospital: HospitalItem;
  specialty: SpecialtyItem;
  doctor: DoctorItem | null;
  patient: PatientInfo;
  selectedDate: DateOption;
  selectedSlot: string;
  symptoms: string;
  onUpdateSymptoms: (symptoms: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}

export const BookingStep4Confirm: React.FC<BookingStep4ConfirmProps> = ({
  mode,
  target,
  hospital,
  specialty,
  doctor,
  patient,
  selectedDate,
  selectedSlot,
  symptoms,
  onUpdateSymptoms,
  onBack,
  onConfirm,
}) => {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError('Vui lòng nhập triệu chứng hoặc lý do khám để tiếp tục xác nhận');
      return;
    }
    setError('');
    setIsSubmitting(true);
    // Simulate booking creation delay
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirm();
    }, 600);
  };

  const isBhyt = mode === 'bhyt';
  const bhytStandardFee = 38700;
  const bhytDiscount = 30960;
  const bhytPatientPay = 7740;

  const demandPrice = doctor ? doctor.price : specialty.price;
  const demandPriceFormatted = doctor ? doctor.priceFormatted : specialty.priceFormatted;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Xác nhận thông tin đặt lịch
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          Vui lòng kiểm tra kỹ thông tin khám và nhập triệu chứng ban đầu
        </p>
      </div>

      {/* SECTION 1: NHẬP TRIỆU CHỨNG */}
      <section className="bg-white rounded-2xl shadow-sm border-2 border-emerald-500/20 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <label htmlFor="symptoms-input" className="text-sm sm:text-base font-bold text-slate-900">
              Triệu chứng / Lý do khám: <span className="text-rose-500">*</span>
            </label>
          </div>
          <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {symptoms.length}/500
          </span>
        </div>

        <div className="relative">
          <textarea
            id="symptoms-input"
            value={symptoms}
            onChange={(e) => {
              onUpdateSymptoms(e.target.value);
              if (error) setError('');
            }}
            maxLength={500}
            rows={4}
            placeholder="Ví dụ: Đau đầu kéo dài 3 ngày, sốt nhẹ về chiều, đã uống hạ sốt nhưng không đỡ..."
            className="w-full p-3.5 bg-slate-50 focus:bg-white rounded-xl text-sm text-slate-900 border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition resize-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-start gap-2 mt-2 text-slate-500 text-xs">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="italic">
            Thông tin chi tiết sẽ giúp bác sĩ chuẩn bị tốt hơn cho buổi tiếp nhận và thăm khám
          </p>
        </div>

        {error && (
          <div className="mt-2.5 text-rose-600 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {/* SECTION 2: BẢNG TỔNG HỢP THÔNG TIN */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider">
            THÔNG TIN ĐẶT LỊCH
          </h2>
        </div>

        <div className="space-y-2.5 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Bệnh nhân / Đối tượng:</span>
            <div className="sm:text-right">
              <span className="font-bold text-slate-900 block">{patient.name}</span>
              <span className="text-xs text-blue-700 font-medium">
                {target?.type === 'FAMILY'
                  ? `Người nhà (${target.relationshipLabel || 'Thân nhân'})`
                  : 'Bản thân (Chính chủ)'}
                {target?.dob ? ` • NS: ${target.dob}` : ''}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Cơ sở khám:</span>
            <span className="font-semibold text-slate-900 sm:text-right">{hospital.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Phương thức:</span>
            <span className="font-semibold text-slate-900">
              {isBhyt ? 'Khám theo BHYT (Đúng tuyến)' : 'Khám theo yêu cầu'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Chuyên khoa:</span>
            <span className="font-semibold text-slate-900">{specialty.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Ngày khám:</span>
            <span className="font-semibold text-slate-900 font-mono">{selectedDate.fullDate}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Giờ khám:</span>
            <span className="font-bold text-blue-600 font-mono text-base">{selectedSlot}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Phòng khám / Bác sĩ:</span>
            <span className="font-semibold text-slate-900 sm:text-right">
              {isBhyt
                ? `${specialty.room} • Phân công tại chỗ`
                : `${doctor?.room || specialty.room} • ${doctor ? doctor.name : 'Theo chuyên khoa'}`}
            </span>
          </div>

          {/* Breakdown Chi phí BHYT vs Theo yêu cầu */}
          {isBhyt ? (
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Giá dịch vụ khám BHYT:</span>
                <span className="font-medium">{bhytStandardFee.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700">
                <span>BHYT chi trả (80%):</span>
                <span className="font-medium">-{bhytDiscount.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900">Bệnh nhân đồng chi trả:</span>
                <span className="text-lg font-extrabold text-emerald-700 tracking-tight">
                  {bhytPatientPay.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="font-bold text-slate-900">Phí khám dự kiến:</span>
              <span className="text-lg font-extrabold text-blue-600 tracking-tight">
                {demandPriceFormatted}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: LƯU Ý QUAN TRỌNG */}
      <section className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3 text-amber-800">
          <Info className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider">LƯU Ý QUAN TRỌNG</h3>
        </div>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold leading-none mt-1">•</span>
            <span>Vui lòng có mặt trước 15 phút so với giờ hẹn để làm thủ tục tiếp đón</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold leading-none mt-1">•</span>
            <span>
              Mang theo CCCD/hộ chiếu và thẻ BHYT (hoặc ứng dụng VssID / VNeID)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold leading-none mt-1">•</span>
            <span>Có thể hủy hoặc đổi lịch trước 2 tiếng qua cổng bệnh nhân</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold leading-none mt-1">•</span>
            <span>
              Liên hệ hotline tiếp nhận nếu cần hỗ trợ khẩn cấp:{' '}
              <strong className="text-blue-700 font-mono">1900 888 866</strong>
            </span>
          </li>
        </ul>
      </section>

      {/* STICKY BOTTOM BAR */}
      <div className="sticky bottom-4 z-40 w-full max-w-5xl mx-auto mt-4">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200 py-3.5 px-5 sm:px-6 rounded-2xl shadow-xl flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition text-sm cursor-pointer"
          >
            Quay lại
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm sm:text-base px-8 py-3 rounded-lg shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Xác nhận đặt lịch</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
