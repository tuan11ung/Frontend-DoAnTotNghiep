'use client';

import React from 'react';
import { X, QrCode, Download, Building2, Calendar, Clock, MapPin, Stethoscope, CheckCircle2 } from 'lucide-react';
import { PatientAppointment } from '../models/types/appointment.types';

interface AppointmentQrDialogProps {
  isOpen: boolean;
  appointment: PatientAppointment | null;
  onClose: () => void;
}

export function AppointmentQrDialog({ isOpen, appointment, onClose }: AppointmentQrDialogProps) {
  if (!isOpen || !appointment) return null;

  const handleDownload = () => {
    alert(`Đã lưu vé khám điện tử mã [${appointment.code}] về thiết bị của bạn.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-200" />
            <h2 className="text-base font-extrabold tracking-tight">Thẻ khám bệnh điện tử</h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center space-y-5">
          {/* QR Code Container */}
          <div className="inline-block p-4 bg-white rounded-3xl border-2 border-dashed border-blue-300 shadow-inner">
            <div className="w-48 h-48 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white p-3 relative overflow-hidden group">
              {/* Simulated QR Code matrix */}
              <div className="grid grid-cols-6 gap-1.5 w-full h-full p-2 bg-white rounded-xl">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${
                      [0, 1, 4, 5, 6, 11, 14, 17, 20, 23, 24, 29, 30, 31, 34, 35].includes(i)
                        ? 'bg-blue-900'
                        : i % 2 === 0
                        ? 'bg-slate-900'
                        : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="font-mono font-bold text-slate-800 text-sm mt-3 tracking-wider">
              {appointment.code}
            </p>
          </div>

          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Đưa mã này vào máy quét tại kiosk hoặc quầy tiếp đón của bệnh viện để in phiếu khám số thứ tự tự động.
          </p>

          {/* Chi tiết tiếp nhận */}
          <div className="bg-blue-50/60 rounded-2xl p-4 text-left border border-blue-100 text-xs space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-blue-200/60">
              <span className="text-slate-500">Bệnh nhân:</span>
              <strong className="text-slate-900 font-bold text-sm">
                {appointment.patientName} {appointment.patientRelationship ? `(${appointment.patientRelationship})` : ''}
              </strong>
            </div>

            <div className="flex items-start gap-2 text-slate-700">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{appointment.hospitalName}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{appointment.roomName} ({appointment.departmentName})</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Giờ khám: <strong>{appointment.timeSlot}</strong> ngày <strong>{appointment.workDate}</strong></span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Stethoscope className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Bác sĩ: {appointment.doctorTitle} {appointment.doctorName}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={handleDownload}
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải mã QR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
