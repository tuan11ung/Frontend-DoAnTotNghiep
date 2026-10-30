'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  Calendar,
  CreditCard,
  Phone,
  ShieldAlert,
  CalendarClock,
  Edit2,
  Trash2,
  HeartHandshake,
  MapPin,
} from 'lucide-react';
import { FamilyMember, RELATIONSHIP_LABELS } from '../models/types/family.types';

interface FamilyMemberCardProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
}

export function FamilyMemberCard({ member, onEdit, onDelete }: FamilyMemberCardProps) {
  const relationshipText = RELATIONSHIP_LABELS[member.relationship] || 'Người thân';
  const age = member.dob
    ? new Date().getFullYear() - new Date(member.dob).getFullYear()
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all p-5 flex flex-col justify-between group">
      <div>
        {/* Header card */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${
              member.gender === 'FEMALE'
                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                : 'bg-blue-50 text-blue-600 border border-blue-100'
            }`}>
              {member.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">
                  {member.fullName}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100/80 text-blue-700 border border-blue-200">
                  {relationshipText}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {member.gender === 'MALE' ? 'Nam' : member.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                {age !== null ? ` · ${age} tuổi (${member.dob})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(member)}
              type="button"
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Chỉnh sửa thông tin"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(member)}
              type="button"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Xóa hồ sơ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="py-4 space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
            <span>CCCD / Mã ĐD:</span>
            <span className="font-semibold text-slate-800 ml-auto font-mono">
              {member.nationalId ? `${member.nationalId.slice(0, 3)}****${member.nationalId.slice(-3)}` : 'Chưa cập nhật'}
            </span>
          </div>

          {member.bhytNumber && (
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Mã BHYT:</span>
              <span className="font-semibold text-emerald-700 ml-auto font-mono">
                {member.bhytNumber}
              </span>
            </div>
          )}

          {member.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Số điện thoại:</span>
              <span className="font-semibold text-slate-800 ml-auto">
                {member.phone}
              </span>
            </div>
          )}

          {member.note && (
            <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-800 text-[11px] leading-relaxed">
              <span className="font-semibold">Tiền sử / Ghi chú: </span>
              {member.note}
            </div>
          )}
        </div>
      </div>

      {/* Action footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
        <Link
          href={`/patient/appointments?target=${member.id}`}
          className="text-xs text-slate-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 transition-colors"
        >
          <span>Lịch sử khám</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
            {member.totalAppointments || 0}
          </span>
        </Link>

        <Link
          href={`/booking?target=family&memberId=${member.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <CalendarClock className="w-3.5 h-3.5" />
          <span>Đặt khám</span>
        </Link>
      </div>
    </div>
  );
}
