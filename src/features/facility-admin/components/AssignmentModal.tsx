'use client';

import { useMemo, useState } from 'react';
import { Search, UserCheck, X } from 'lucide-react';
import type { AssignmentState, Department, Room, Specialty, StaffAccount } from '../types';

interface AssignmentModalProps {
  assignment: AssignmentState;
  departments: Department[];
  specialties: Specialty[];
  rooms: Room[];
  staff: StaffAccount[];
  onClose: () => void;
  onSave: (staffId?: number) => void;
}

export function AssignmentModal({ assignment, departments, specialties, rooms, staff, onClose, onSave }: AssignmentModalProps) {
  const [query, setQuery] = useState('');
  const department = assignment.kind === 'department'
    ? departments.find((item) => item.id === assignment.id)
    : undefined;
  const specialty = assignment.kind === 'specialty'
    ? specialties.find((item) => item.id === assignment.id)
    : undefined;
  const room = assignment.kind === 'room'
    ? rooms.find((item) => item.id === assignment.id)
    : undefined;
  const target = department ?? specialty ?? room;
  const departmentId = department?.id ?? specialty?.departmentId ?? room?.departmentId;
  const currentStaffId = department?.headId ?? specialty?.leadId ?? room?.leadId;
  const [selectedId, setSelectedId] = useState<number | undefined>(currentStaffId);

  const candidates = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi');
    return staff.filter((item) =>
      item.active &&
      (item.roles.includes('DOCTOR') || item.roles.includes('DEPARTMENT_HEAD')) &&
      item.departmentId === departmentId &&
      (!normalizedQuery || `${item.fullName} ${item.staffCode}`.toLocaleLowerCase('vi').includes(normalizedQuery)),
    );
  }, [departmentId, query, staff]);

  const title = assignment.kind === 'department' ? 'Phân công trưởng khoa' : 'Phân công bác sĩ phụ trách';

  return (
    <div aria-modal="true" className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog">
      <div className="w-full max-w-lg rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"><UserCheck className="h-5 w-5" /></div>
          <div className="flex-1"><h2 className="text-lg font-extrabold text-slate-950">{title}</h2><p className="mt-0.5 text-xs text-slate-500">{target?.name}</p></div>
          <button aria-label="Đóng" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" onClick={onClose} type="button"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 sm:p-6">
          <label className="relative block"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên hoặc mã nhân viên" value={query} /></label>
          <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
            <button aria-pressed={!selectedId} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${!selectedId ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-200'}`} onClick={() => setSelectedId(undefined)} type="button"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">—</span><span><strong className="block text-sm text-slate-800">Chưa phân công</strong><small className="text-xs text-slate-500">Bỏ người đang giữ vai trò này</small></span></button>
            {candidates.map((item) => (
              <button aria-pressed={selectedId === item.id} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${selectedId === item.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-200'}`} key={item.id} onClick={() => setSelectedId(item.id)} type="button">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xs font-extrabold text-emerald-800">{item.fullName.split(' ').slice(-2).map((word) => word[0]).join('')}</span>
                <span className="flex-1"><strong className="block text-sm text-slate-800">{item.fullName}</strong><small className="text-xs text-slate-500">{item.staffCode} · {departments.find((department) => department.id === item.departmentId)?.name}</small></span>
                {selectedId === item.id && <UserCheck className="h-5 w-5 text-blue-700" />}
              </button>
            ))}
            {candidates.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Không có bác sĩ phù hợp trong khoa này.</p>}
          </div>
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900">Chỉ hiển thị bác sĩ đang hoạt động và thuộc đúng khoa. Thay đổi phân công sẽ cập nhật phạm vi trách nhiệm của nhân viên.</p>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4 sm:px-6"><button className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50" onClick={onClose} type="button">Hủy</button><button className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800" onClick={() => onSave(selectedId)} type="button"><UserCheck className="h-4 w-4" /> Lưu phân công</button></div>
      </div>
    </div>
  );
}
