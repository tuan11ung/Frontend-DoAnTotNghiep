'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { patientFamilyApi, type FamilyProfiles } from './api/patient-family-api';
import type { FamilyMember, FamilyMemberFormData, FamilyMemberSummary } from './models/types/family.types';
import { FamilyMemberCard } from './components/FamilyMemberCard';
import { AddFamilyMemberDialog } from './workflow/AddFamilyMemberDialog';
import { EditFamilyMemberDialog } from './workflow/EditFamilyMemberDialog';
import { DeleteFamilyMemberDialog } from './workflow/DeleteFamilyMemberDialog';
export function FamilyProfilesPanel({ token }: { token: string }) {
  const [profiles, setProfiles] = useState<FamilyProfiles | null>(null);
  const [loadError, setLoadError] = useState('');
  const [revision, setRevision] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMemberSummary | null>(null);
  const [openingEdit, setOpeningEdit] = useState(false);
  const [deletingMember, setDeletingMember] = useState<FamilyMemberSummary | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    patientFamilyApi.getProfiles(token, controller.signal).then(result => {
      if (!controller.signal.aborted) setProfiles(result);
    }).catch(error => {
      if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : 'Không thể tải hồ sơ gia đình.');
    });
    return () => controller.abort();
  }, [token, revision]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const members = profiles?.members ?? [];
  const loading = !profiles && !loadError;

  async function handleAddMember(data: FamilyMemberFormData) {
    const created = await patientFamilyApi.createMember(token, data);
    setProfiles(current => current && {
      ...current,
      members: [...current.members.filter(member => member.relationId !== created.relationId), created],
    });
    setToastMessage(`Đã thêm hồ sơ người thân "${data.fullName}".`);
  }

  async function handleDeleteMember(id: string) {
    const member = profiles?.members.find(item => item.id === id);
    if (!member) throw new Error('Không tìm thấy hồ sơ người thân.');
    await patientFamilyApi.removeMember(token, member.relationId);
    setProfiles(current => current && {
      ...current,
      members: current.members.filter(item => item.relationId !== member.relationId),
    });
    setToastMessage('Đã gỡ hồ sơ người thân khỏi sổ gia đình.');
  }

  async function handleEditMember(id: string) {
    if (openingEdit) return;
    setOpeningEdit(true);
    try {
      const member = await patientFamilyApi.getMember(token, Number(id));
      if (!member) throw new Error('Không tìm thấy hồ sơ người thân.');
      setEditingMember(member);
    } catch (error) { setToastMessage(error instanceof Error ? error.message : 'Không thể tải hồ sơ.'); }
    finally { setOpeningEdit(false); }
  }

  async function handleUpdateMember(id: string, updates: Partial<FamilyMember>) {
    const updated = await patientFamilyApi.updateMember(token, Number(id), updates);
    setProfiles(current => current && { ...current, members: current.members.map(item => item.id === id ? updated : item) });
    setToastMessage('Đã cập nhật thông tin hồ sơ người thân.');
  }

  return (
    <section aria-labelledby="family-profiles-heading" className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
          <div>
            <h2 id="family-profiles-heading" className="text-lg font-bold text-slate-900">Hồ sơ gia đình</h2>
            {profiles && <p className="mt-1 text-sm text-slate-600">{members.length} hồ sơ người thân</p>}
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            type="button"
            disabled={Boolean(loading || loadError)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm người nhà</span>
          </button>
        </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div role="status" className="py-20 text-center text-slate-400 text-sm">Đang tải sổ gia đình...</div>
        ) : loadError ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p role="alert" className="text-sm text-rose-700">{loadError}</p>
            <button type="button" className="mt-4 font-bold text-blue-700" onClick={() => {
              setLoadError('');
              setRevision(current => current + 1);
            }}>Thử lại</button>
          </div>
        ) : members.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Chưa có hồ sơ người thân nào</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
              Bạn chưa thêm người nhà vào sổ sức khỏe gia đình. Hãy thêm hồ sơ để quản lý thông tin y tế thuận tiện.
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
          <ul className="space-y-2.5">
            {members.map((member) => (
              <li key={member.id}>
                <FamilyMemberCard
                  member={member}
                  onEdit={() => void handleEditMember(member.id)}
                  onDelete={() => setDeletingMember(member)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div role="status" className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals Workflow */}
      {openingEdit && <p role="status" className="fixed bottom-6 left-6 rounded-lg border bg-white p-4 text-sm shadow">Đang tải hồ sơ người thân…</p>}
      {isAddOpen && <AddFamilyMemberDialog
        isOpen
        showNote={!token}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddMember}
      />}

      <EditFamilyMemberDialog
        isOpen={Boolean(editingMember)}
        member={editingMember}
        basicOnly={Boolean(token)}
        onClose={() => setEditingMember(null)}
        onSave={handleUpdateMember}
      />

      {deletingMember && <DeleteFamilyMemberDialog
        isOpen
        member={deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleDeleteMember}
      />}
    </section>
  );
}
