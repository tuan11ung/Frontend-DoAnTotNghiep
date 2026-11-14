'use client';

import React, { useState } from 'react';
import { X, Edit3, AlertCircle } from 'lucide-react';
import { FamilyRelationship, RELATIONSHIP_LABELS, FamilyMember, FamilyMemberSummary } from '../models/types/family.types';

interface EditFamilyMemberDialogProps {
  isOpen: boolean;
  member: FamilyMemberSummary | null;
  basicOnly?: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<FamilyMember>) => void | Promise<void>;
}

export function EditFamilyMemberDialog({ isOpen, member, onClose, onSave, basicOnly = false }: EditFamilyMemberDialogProps) {
  if (!isOpen || !member) return null;
  return <EditFamilyMemberForm key={member.id} member={member} onClose={onClose} onSave={onSave} basicOnly={basicOnly} />;
}

function EditFamilyMemberForm({ member, onClose, onSave, basicOnly }: Omit<EditFamilyMemberDialogProps, 'isOpen' | 'member'> & { member: FamilyMemberSummary }) {
  const [fullName, setFullName] = useState(member.fullName);
  const [relationship, setRelationship] = useState<FamilyRelationship>(member.relationship);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>(member.gender);
  const [dob, setDob] = useState(member.dob);
  const [nationalId, setNationalId] = useState(basicOnly ? '' : member.nationalId);
  const [phone, setPhone] = useState(basicOnly ? '' : member.phone ?? '');
  const [bhytNumber, setBhytNumber] = useState(member.bhytNumber ?? '');
  const [address, setAddress] = useState(member.address ?? '');
  const [note, setNote] = useState(member.note ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên');
      return;
    }
    if (!dob) {
      setError('Vui lòng nhập ngày sinh');
      return;
    }

    if (basicOnly && nationalId.trim() && !/^\d{12}$/.test(nationalId.trim())) { setError('CCCD mới cần đủ 12 chữ số.'); return; }
    if (basicOnly && phone.trim() && !/^(?:\+84|84|0)(?:3|5|7|8|9)\d{8}$/.test(phone.trim())) { setError('Số điện thoại mới chưa hợp lệ.'); return; }
    setSaving(true);
    setError('');
    try {
    await onSave(member.id, {
      fullName: fullName.trim(),
      relationship,
      gender,
      dob,
      nationalId: nationalId.trim(),
      phone: phone.trim() || undefined,
      bhytNumber: bhytNumber.trim() || undefined,
      address: address.trim() || undefined,
      note: note.trim() || undefined,
    });

    onClose();
    } catch (error) { setError(error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ.'); }
    finally { setSaving(false); }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="edit-family-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="edit-family-title" className="text-lg font-bold text-slate-900">Sửa hồ sơ người thân</h2>
              <p className="text-xs text-slate-500">Cập nhật thông tin thành viên gia đình</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {basicOnly && <p className="text-xs leading-6 text-slate-500">Để trống CCCD và điện thoại để giữ nguyên. Chỉ nhập khi muốn thay đổi; CCCD thay đổi sẽ cần xác minh lại.</p>}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Quan hệ với chủ tài khoản
            </label>
            <select
              value={relationship}
              disabled={saving}
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Họ và tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày sinh</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Giới tính</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Số CCCD / Mã định danh</label>
            <input
              type="text"
              value={nationalId}
              placeholder={basicOnly ? member.nationalId : undefined}
              disabled={saving}
              onChange={(e) => setNationalId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-mono text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                placeholder={basicOnly ? member.phone : undefined}
                disabled={saving}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mã thẻ BHYT</label>
              <input
                type="text"
                value={bhytNumber}
                onChange={(e) => setBhytNumber(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-mono text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Địa chỉ</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Ghi chú / Tiền sử</label>
            <textarea
              rows={2}
              value={note}
              disabled={basicOnly || saving}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              type="button"
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              {saving ? 'Đang lưu…' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
