'use client';

import React from 'react';
import { Users, HeartPulse, ShieldCheck, UserPlus } from 'lucide-react';

interface FamilyHeaderStatsProps {
  totalMembers: number;
  onOpenAddModal: () => void;
}

export function FamilyHeaderStats({ totalMembers, onOpenAddModal }: FamilyHeaderStatsProps) {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 mb-8 relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute left-1/2 -top-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100 border border-white/20">
            <Users className="w-3.5 h-3.5" />
            <span>Sổ sức khỏe gia đình</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Quản lý hồ sơ người thân
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl leading-relaxed">
            Thêm hồ sơ cha mẹ, con cái hoặc người thân để dễ dàng theo dõi sức khỏe và đặt lịch khám online trực tiếp không cần đăng nhập lại.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 text-center min-w-[110px]">
            <p className="text-2xl sm:text-3xl font-black">{totalMembers}</p>
            <p className="text-xs text-blue-100 font-medium mt-0.5">Thành viên</p>
          </div>

          <button
            onClick={onOpenAddModal}
            type="button"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm người nhà</span>
          </button>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-blue-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Hồ sơ được bảo mật và liên thông với mã định danh công dân VNeID</span>
        </div>
        <div className="flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Hỗ trợ đặt khám BHYT đúng tuyến & Khám chuyên gia cho người nhà</span>
        </div>
      </div>
    </div>
  );
}
