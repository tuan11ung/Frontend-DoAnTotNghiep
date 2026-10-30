'use client';

import React, { useState } from 'react';
import { X, UserPlus, HeartHandshake, ShieldCheck, AlertCircle } from 'lucide-react';
import { FamilyRelationship, RELATIONSHIP_LABELS, FamilyMember } from '../models/types/family.types';
import { saveFamilyMember } from '@/src/shared/utils/patient-storage';

interface AddFamilyMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (data: Omit<FamilyMember, 'id' | 'createdAt' | 'totalAppointments'>) => void;
  onCreatedSuccess?: (newMember: FamilyMember) => void;
}

export function AddFamilyMemberDialog({ isOpen, onClose, onAdd, onCreatedSuccess }: AddFamilyMemberDialogProps) {
  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState<FamilyRelationship>('CON');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [dob, setDob] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [bhytNumber, setBhytNumber] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên của người thân');
      return;
    }
    if (!dob) {
      setError('Vui lòng nhập ngày sinh');
      return;
    }
    if (!nationalId.trim()) {
      setError('Vui lòng nhập số CCCD hoặc mã định danh cá nhân');
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      relationship,
      gender,
      dob,
      nationalId: nationalId.trim(),
      phone: phone.trim() || undefined,
      bhytNumber: bhytNumber.trim() || undefined,
      address: address.trim() || undefined,
      note: note.trim() || undefined,
    };

    if (onAdd) {
      onAdd(payload);
    }

    if (onCreatedSuccess) {
      const created = saveFamilyMember(payload);
      onCreatedSuccess(created);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Thêm người thân</h2>
              <p className="text-xs text-slate-500">Tạo hồ sơ người nhà để đặt lịch khám online</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Quan hệ với chủ tài khoản <span className="text-rose-500">*</span>
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value as FamilyRelationship)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-semibold text-slate-800"
            >
              {Object.entries(RELATIONSHIP_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Trần Thị Mai"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ngày sinh <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Giới tính <span className="text-rose-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-900"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Số CCCD / Mã định danh cá nhân <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="12 chữ số trên CCCD hoặc Giấy khai sinh"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-mono text-slate-900"
            />
            <p className="text-[11px] text-slate-400 mt-1">Trẻ em dùng mã số định danh trên Giấy khai sinh</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Số điện thoại (nếu có)
              </label>
              <input
                type="tel"
                placeholder="0987xxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mã thẻ BHYT (nếu có)
              </label>
              <input
                type="text"
                placeholder="VD: GD4010..."
                value={bhytNumber}
                onChange={(e) => setBhytNumber(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-mono text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Địa chỉ cư trú
            </label>
            <input
              type="text"
              placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tiền sử bệnh lý / Dị ứng thuốc (ghi chú)
            </label>
            <textarea
              rows={2}
              placeholder="VD: Dị ứng Penicillin, có tiền sử hen phế quản..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              type="button"
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              Lưu hồ sơ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
