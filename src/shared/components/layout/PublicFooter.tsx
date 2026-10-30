'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Phone, Mail, MapPin, Award, Smartphone } from 'lucide-react';
import { AppointmentTabType } from '@/src/shared/types/medical';

interface PublicFooterProps {
  onSelectTab?: (tab: AppointmentTabType) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onSelectTab }) => {
  const router = useRouter();

  const handleServiceClick = (tab: AppointmentTabType) => {
    if (onSelectTab) {
      onSelectTab(tab);
    }
    router.push(`/search?type=${tab}`);
  };
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800" data-purpose="site-main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Contact Col */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-white">
                Med<span className="text-emerald-400">Connect</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
              Nền tảng công nghệ y tế kết nối người bệnh với mạng lưới bác sĩ và bệnh viện uy tín hàng đầu trên toàn quốc.
            </p>
            <div className="space-y-2.5 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>
                  Hotline: <strong className="text-white">(028) 3822-5555</strong> (24/7)
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>
                  Hỗ trợ: <span className="text-white">hotro@medconnect.vn</span>
                </span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Tòa nhà MedConnect, Quận 1, TP. Hồ Chí Minh</span>
              </p>
            </div>
          </div>

          {/* Links Col 1: Medical Services */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Dịch vụ y tế</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => handleServiceClick('doctor')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                  type="button"
                >
                  Đặt khám Bác sĩ Chuyên khoa
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleServiceClick('hospital')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                  type="button"
                >
                  Đặt khám Bệnh viện Công &amp; Tư
                </button>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="#tu-van-tu-xa">
                  Tư vấn sức khỏe từ xa (Telehealth)
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Col 2: About MedConnect */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Về MedConnect</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link className="hover:text-white transition-colors" href="#gioi-thieu">
                  Giới thiệu về chúng tôi
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="#co-van-y-khoa">
                  Đội ngũ cố vấn y khoa
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="#tuyen-dung">
                  Tuyển dụng nhân tài
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="#bao-mat">
                  Chính sách bảo mật dữ liệu
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="#dieu-khoan">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* App & Certifications */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Tải ứng dụng MedConnect</h4>
            <p className="text-xs text-slate-400 mb-3">
              Chủ động theo dõi số khám và kết quả xét nghiệm ngay trên điện thoại
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
              <button
                type="button"
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <Smartphone className="w-5 h-5 text-sky-400" />
                <div className="text-left leading-tight">
                  <span className="block text-[9px] text-slate-400">Tải về trên</span>
                  <span className="font-bold text-xs">App Store</span>
                </div>
              </button>
              <button
                type="button"
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <div className="text-left leading-tight">
                  <span className="block text-[9px] text-slate-400">Tải về trên</span>
                  <span className="font-bold text-xs">Google Play</span>
                </div>
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <Award className="w-4 h-4 flex-shrink-0" />
              <span>Chứng nhận Bộ Y Tế &amp; Tiêu chuẩn HIPAA</span>
            </div>
          </div>
        </div>

        {/* Copyright Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2025 MedConnect Medical Services JSC. Tất cả các quyền được bảo lưu.</p>
          <div className="flex items-center space-x-4">
            <Link className="hover:text-slate-400 transition-colors" href="#chinh-sach-rieng-tu">
              Chính sách quyền riêng tư
            </Link>
            <span>•</span>
            <Link className="hover:text-slate-400 transition-colors" href="#quy-che-san">
              Quy chế hoạt động sàn TMĐT y tế
            </Link>
            <span>•</span>
            <Link className="hover:text-slate-400 transition-colors" href="#khieu-nai">
              Giải quyết khiếu nại
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
