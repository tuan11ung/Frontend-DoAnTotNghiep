'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { FamilyMember, RELATIONSHIP_LABELS } from '../models/types/family.types';

interface DeleteFamilyMemberDialogProps {
  isOpen: boolean;
  member: FamilyMember | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function DeleteFamilyMemberDialog({ isOpen, member, onClose, onConfirm }: DeleteFamilyMemberDialogProps) {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Xác nhận xóa hồ sơ</span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 text-sm text-slate-600 space-y-2">
          <p>
            Bạn có chắc chắn muốn xóa hồ sơ của người thân{' '}
            <strong className="text-slate-900 font-bold">
              {member.fullName} ({RELATIONSHIP_LABELS[member.relationship]})
            </strong>{' '}
            khỏi sổ gia đình?
          </p>
          <p className="text-xs text-slate-500">
            Lịch sử các đợt khám đã hoàn tất trước đây của thành viên này vẫn được lưu trữ theo quy định bảo mật hồ sơ y tế.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              onConfirm(member.id);
              onClose();
            }}
            type="button"
            className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa thành viên</span>
          </button>
        </div>
      </div>
    </div>
  );
}
