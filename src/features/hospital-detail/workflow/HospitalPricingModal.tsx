'use client';

import React from 'react';
import { CreditCard, X, Check, ShieldCheck } from 'lucide-react';
import { HospitalDetail } from '../types';

interface HospitalPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: HospitalDetail;
}

export const HospitalPricingModal: React.FC<HospitalPricingModalProps> = ({
  isOpen,
  onClose,
  hospital,
}) => {
  if (!isOpen) return null;

  const priceItems = [
    {
      category: 'Khám thường (Có BHYT)',
      price: '42.100đ',
      note: 'Áp dụng theo thông tư hiện hành của Bộ Y Tế cho bệnh nhân có thẻ BHYT hợp lệ.',
      highlight: false,
    },
    {
      category: 'Khám chuyên khoa hẹn giờ',
      price: '150.000đ',
      note: 'Chủ động chọn giờ khám trực tuyến, khám với bác sĩ chuyên khoa cấp I/II.',
      highlight: true,
    },
    {
      category: 'Khám Theo Yêu Cầu Chất Lượng Cao (VIP)',
      price: '300.000đ - 500.000đ',
      note: 'Khám trực tiếp cùng Phó Giáo Sư, Tiến sĩ, Trưởng/Phó khoa. Khu chờ VIP máy lạnh riêng.',
      highlight: false,
    },
    {
      category: 'Khám ngoài giờ (Thứ 7 & Chủ Nhật)',
      price: '150.000đ - 250.000đ',
      note: 'Phục vụ phụ huynh và bệnh nhi có nhu cầu thăm khám vào dịp cuối tuần.',
      highlight: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Bảng giá dịch vụ khám bệnh
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                {hospital.name} (Công khai theo quy định)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Giá niêm yết minh bạch, đồng bộ trực tiếp với hệ thống thanh toán BHYT & bảo hiểm tư nhân.</span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {priceItems.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 flex items-start justify-between gap-3 ${
                  item.highlight ? 'bg-blue-50/50' : 'bg-white'
                }`}
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    <span>{item.category}</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 pl-5 leading-relaxed">
                    {item.note}
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-blue-600 whitespace-nowrap bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  {item.price}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-right">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              Đóng bảng giá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
