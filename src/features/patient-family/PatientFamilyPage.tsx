'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Home,
  ChevronRight,
  Search,
  Heart,
  ShieldCheck,
  UserCheck,
  CalendarClock,
  Sparkles,
} from 'lucide-react';
import { useFamilyMembers } from './hooks/useFamilyMembers';
import { FamilyHeaderStats } from './components/FamilyHeaderStats';
import { FamilyMemberCard } from './components/FamilyMemberCard';
import { AddFamilyMemberDialog } from './workflow/AddFamilyMemberDialog';
import { EditFamilyMemberDialog } from './workflow/EditFamilyMemberDialog';
import { DeleteFamilyMemberDialog } from './workflow/DeleteFamilyMemberDialog';
import { FamilyMember } from './models/types/family.types';
import { INITIAL_PATIENT_PROFILE } from '@/src/shared/utils/patient-storage';

export function PatientFamilyPage() {
  const { members, loading, addMember, updateMember, removeMember } = useFamilyMembers();
  const [searchQuery, setSearchQuery] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState<string>('ALL');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);

  // Toast notice
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddMember = (data: Parameters<typeof addMember>[0]) => {
    addMember(data);
    showToast(`Đã thêm hồ sơ người thân "${data.fullName}" thành công!`);
  };

  const handleUpdateMember = (id: string, updates: Parameters<typeof updateMember>[1]) => {
    updateMember(id, updates);
    showToast('Đã cập nhật thông tin hồ sơ người thân!');
  };

  const handleDeleteMember = (id: string) => {
    removeMember(id);
    showToast('Đã xóa thành viên khỏi sổ gia đình.');
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nationalId.includes(searchQuery) ||
      (m.phone && m.phone.includes(searchQuery));
    const matchesRel = relationshipFilter === 'ALL' || m.relationship === relationshipFilter;
    return matchesSearch && matchesRel;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">Cổng bệnh nhân</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-blue-700 font-bold">Quản lý gia đình</span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Banner stats & intro */}
        <FamilyHeaderStats
          totalMembers={members.length}
          onOpenAddModal={() => setIsAddOpen(true)}
        />

        {/* Chủ tài khoản Card (Bản thân) */}
        <div className="mb-8 bg-white rounded-2xl border-2 border-blue-200/90 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                A
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {INITIAL_PATIENT_PROFILE.fullName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Chủ tài khoản (Bản thân)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Ngày sinh: <strong>15/08/1990</strong></span>
                  <span>CCCD: <strong className="font-mono">001090****45</strong></span>
                  <span>BHYT: <strong className="font-mono text-emerald-700">{INITIAL_PATIENT_PROFILE.bhytNumber}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/booking?target=self"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <CalendarClock className="w-3.5 h-3.5" />
                <span>Đặt khám cho tôi</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Thanh tìm kiếm & lọc người nhà */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, CCCD, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Lọc theo:</span>
            {['ALL', 'ME', 'CHA', 'CON', 'VO', 'CHONG'].map((rel) => (
              <button
                key={rel}
                onClick={() => setRelationshipFilter(rel)}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  relationshipFilter === rel
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {rel === 'ALL' ? 'Tất cả' : rel === 'ME' ? 'Mẹ' : rel === 'CHA' ? 'Cha' : rel === 'CON' ? 'Con cái' : rel === 'VO' ? 'Vợ' : 'Chồng'}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách thẻ người thân */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Đang tải sổ gia đình...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Chưa có người thân nào phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
              Bạn chưa thêm người nhà hoặc không tìm thấy kết quả phù hợp với từ khóa tìm kiếm.
            </p>
            <button
              onClick={() => setIsAddOpen(true)}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md hover:bg-blue-700 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm người thân ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMembers.map((member) => (
              <FamilyMemberCard
                key={member.id}
                member={member}
                onEdit={(m) => setEditingMember(m)}
                onDelete={(m) => setDeletingMember(m)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals Workflow */}
      <AddFamilyMemberDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddMember}
      />

      <EditFamilyMemberDialog
        isOpen={Boolean(editingMember)}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSave={handleUpdateMember}
      />

      <DeleteFamilyMemberDialog
        isOpen={Boolean(deletingMember)}
        member={deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleDeleteMember}
      />
    </div>
  );
}
