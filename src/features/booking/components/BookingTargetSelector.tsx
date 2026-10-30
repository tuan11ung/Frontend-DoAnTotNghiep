'use client';

import React, { useState, useEffect } from 'react';
import { User, Users, Plus, Check, ShieldCheck, Heart, Sparkles, ChevronDown } from 'lucide-react';
import { BookingTarget } from '../types';
import {
  INITIAL_PATIENT_PROFILE,
  getStoredFamilyMembers,
} from '@/src/shared/utils/patient-storage';
import { FamilyMember, RELATIONSHIP_LABELS } from '@/src/shared/types/family';
import { AddFamilyMemberDialog } from '@/src/features/patient-family/workflow/AddFamilyMemberDialog';

interface BookingTargetSelectorProps {
  currentTarget: BookingTarget;
  onSelectTarget: (target: BookingTarget) => void;
}

export const BookingTargetSelector: React.FC<BookingTargetSelectorProps> = ({
  currentTarget,
  onSelectTarget,
}) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadMembers = () => {
    setFamilyMembers(getStoredFamilyMembers());
  };

  useEffect(() => {
    loadMembers();
    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail || customEvent.detail.key === 'medconnect.patient_family') {
        loadMembers();
      }
    };
    window.addEventListener('medconnect:storage_update', handleStorageUpdate);
    return () => window.removeEventListener('medconnect:storage_update', handleStorageUpdate);
  }, []);

  const selectSelf = () => {
    onSelectTarget({
      type: 'SELF',
      id: INITIAL_PATIENT_PROFILE.id,
      name: INITIAL_PATIENT_PROFILE.fullName,
      gender: INITIAL_PATIENT_PROFILE.gender,
      dob: INITIAL_PATIENT_PROFILE.dob,
      nationalId: INITIAL_PATIENT_PROFILE.nationalId,
      phone: INITIAL_PATIENT_PROFILE.phone,
      bhytNumber: INITIAL_PATIENT_PROFILE.bhytNumber,
    });
  };

  const selectMember = (m: FamilyMember) => {
    onSelectTarget({
      type: 'FAMILY',
      id: m.id,
      name: m.fullName,
      relationshipLabel: RELATIONSHIP_LABELS[m.relationship] || 'Người nhà',
      gender: m.gender,
      dob: m.dob,
      nationalId: m.nationalId,
      phone: m.phone || INITIAL_PATIENT_PROFILE.phone,
      bhytNumber: m.bhytNumber,
      note: m.note,
    });
  };

  const handleCreatedSuccess = (newMember: FamilyMember) => {
    loadMembers();
    selectMember(newMember);
  };

  const isSelf = currentTarget.type === 'SELF';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm mb-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Đối tượng khám bệnh
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Đang chọn: {isSelf ? 'Bản thân' : `${currentTarget.relationshipLabel} - ${currentTarget.name}`}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Bạn có thể đặt lịch cho chính mình hoặc đặt hộ cho người thân trong gia đình
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100/80 rounded-xl transition cursor-pointer border border-blue-200/60 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Thêm người nhà</span>
        </button>
      </div>

      {/* Target selection list / pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Bản thân */}
        <div
          onClick={selectSelf}
          className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all relative flex flex-col justify-between ${
            isSelf
              ? 'border-blue-600 bg-blue-50/50 shadow-sm shadow-blue-500/10'
              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                  isSelf
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                  Bản thân
                </span>
                <p className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">
                  {INITIAL_PATIENT_PROFILE.fullName}
                </p>
              </div>
            </div>
            {isSelf && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>CCCD: ••••{INITIAL_PATIENT_PROFILE.nationalId.slice(-4)}</span>
            <span className="text-emerald-700 font-medium">BHYT sẵn sàng</span>
          </div>
        </div>

        {/* Danh sách người nhà */}
        {familyMembers.map((m) => {
          const isSelected = !isSelf && currentTarget.id === m.id;
          const relText = RELATIONSHIP_LABELS[m.relationship] || 'Người nhà';

          return (
            <div
              key={m.id}
              onClick={() => selectMember(m)}
              className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/40 shadow-sm shadow-emerald-500/10'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                      {relText}
                    </span>
                    <p className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">
                      {m.fullName}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
                <span>{m.dob}</span>
                <span className="text-slate-600 font-medium">{m.gender === 'MALE' ? 'Nam' : 'Nữ'}</span>
              </div>
            </div>
          );
        })}

        {/* Nút card thêm người nhà trực tiếp */}
        <div
          onClick={() => setIsAddModalOpen(true)}
          className="cursor-pointer rounded-2xl p-3.5 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center text-center group min-h-[95px]"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-600 flex items-center justify-center transition">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-700 mt-1.5">
            Thêm người thân mới
          </span>
          <span className="text-[10px] text-slate-400">Đặt lịch cho bố mẹ, con cái...</span>
        </div>
      </div>

      {/* Thông tin đối tượng đang chọn */}
      <div className="mt-4 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Hồ sơ y tế khám:{' '}
            <strong className="text-slate-900 font-bold">{currentTarget.name}</strong>
            {currentTarget.relationshipLabel ? ` (${currentTarget.relationshipLabel})` : ' (Chính chủ)'}
            {' • '}CCCD: <span className="font-mono">{currentTarget.nationalId || 'Chưa cập nhật'}</span>
            {currentTarget.bhytNumber && (
              <>
                {' • '}Mã BHYT: <span className="font-mono text-blue-700 font-semibold">{currentTarget.bhytNumber}</span>
              </>
            )}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 italic">
          Được bảo mật theo hồ sơ sức khỏe điện tử cá nhân
        </span>
      </div>

      {/* Modal thêm người nhà nhanh */}
      <AddFamilyMemberDialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreatedSuccess={handleCreatedSuccess}
      />
    </div>
  );
};
