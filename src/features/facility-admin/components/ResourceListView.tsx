'use client';

import { useMemo, useState } from 'react';
import {
  BadgeDollarSign,
  Building2,
  DoorOpen,
  Pencil,
  Plus,
  Search,
  Stethoscope,
  UsersRound,
} from 'lucide-react';
import {
  DEPARTMENT_TYPE_LABELS,
  ROOM_TYPE_LABELS,
  STAFF_ROLE_LABELS,
} from '../data/facility-admin-data';
import type {
  AdminEntity,
  Department,
  EntityKind,
  MedicalService,
  Room,
  Specialty,
  StaffAccount,
} from '../types';

interface ResourceListViewProps {
  kind: EntityKind;
  items: AdminEntity[];
  departments: Department[];
  staff: StaffAccount[];
  onAdd: (kind: EntityKind) => void;
  onEdit: (kind: EntityKind, id: number) => void;
  onToggle: (kind: EntityKind, id: number) => Promise<void>;
}

const SECTION_META = {
  department: {
    title: 'Quản lý khoa',
    subtitle: 'Quản lý đơn vị chuyên môn cấp một của cơ sở y tế.',
    addLabel: 'Thêm khoa',
    search: 'Tìm theo mã hoặc tên khoa',
    icon: Building2,
  },
  specialty: {
    title: 'Quản lý chuyên khoa',
    subtitle: 'Cấu hình chuyên môn bệnh nhân có thể lựa chọn khi đặt lịch.',
    addLabel: 'Thêm chuyên khoa',
    search: 'Tìm theo mã hoặc tên chuyên khoa',
    icon: Stethoscope,
  },
  room: {
    title: 'Quản lý phòng',
    subtitle: 'Quản lý phòng khám, phòng cận lâm sàng và năng lực tiếp nhận.',
    addLabel: 'Thêm phòng',
    search: 'Tìm theo mã, tên hoặc vị trí phòng',
    icon: DoorOpen,
  },
  staff: {
    title: 'Tài khoản nhân viên',
    subtitle: 'Quản lý tài khoản trưởng khoa, bác sĩ, dược sĩ và lễ tân của cơ sở.',
    addLabel: 'Thêm nhân viên',
    search: 'Tìm mã, họ tên, email hoặc số điện thoại',
    icon: UsersRound,
  },
  service: {
    title: 'Dịch vụ khám & Bảng giá',
    subtitle: 'Quản lý danh mục dịch vụ, thời lượng, phạm vi BHYT và giá niêm yết.',
    addLabel: 'Thêm dịch vụ',
    search: 'Tìm theo mã hoặc tên dịch vụ',
    icon: BadgeDollarSign,
  },
} satisfies Record<EntityKind, { title: string; subtitle: string; addLabel: string; search: string; icon: typeof Building2 }>;

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {active ? 'Đang hoạt động' : 'Tạm ngừng'}
    </span>
  );
}

function StaffStatusBadge({ status }: { status: StaffAccount['status'] }) {
  const meta = {
    ACTIVE: { label: 'Đang hoạt động', className: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
    LOCKED: { label: 'Đã khóa', className: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
    DEACTIVATED: { label: 'Đã nghỉ việc', className: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
  }[status];
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${meta.className}`}><span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />{meta.label}</span>;
}

function Toggle({ active, disabled = false, label, onClick }: { active: boolean; disabled?: boolean; label: string; onClick: () => void }) {
  return (
    <button aria-label={label} aria-pressed={active} className={`relative h-7 w-12 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${active ? 'bg-emerald-600' : 'bg-slate-300'}`} disabled={disabled} onClick={onClick} type="button">
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function ActionButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button aria-label={label} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700" onClick={onClick} type="button">
      {children}
    </button>
  );
}

export function ResourceListView({ kind, items, departments, staff, onAdd, onEdit, onToggle }: ResourceListViewProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const meta = SECTION_META[kind];
  const SectionIcon = meta.icon;

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi');
    return items.filter((item) => {
      if (status === 'ACTIVE' && !item.active) return false;
      if (status === 'INACTIVE' && item.active) return false;
      if (!normalizedQuery) return true;

      const searchable = 'staffCode' in item
        ? `${item.staffCode} ${item.fullName} ${item.email} ${item.rankName ?? ''} ${item.roles.join(' ')}`
        : 'location' in item
          ? `${item.code} ${item.name} ${item.location}`
          : `${item.code} ${item.name}`;
      return searchable.toLocaleLowerCase('vi').includes(normalizedQuery);
    });
  }, [items, query, status]);

  const departmentName = (id?: number) => departments.find((item) => item.id === id)?.name ?? 'Chưa phân khoa';
  const departmentHeadNames = (departmentId: number) => staff
    .filter((item) => item.active && item.departmentId === departmentId && item.roles.includes('DEPARTMENT_HEAD'))
    .map((item) => item.fullName);
  const activeCount = items.filter((item) => item.active).length;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <SectionIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">{meta.title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{meta.subtitle}</p>
          </div>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-800" onClick={() => onAdd(kind)} type="button">
          <Plus className="h-4 w-4" /> {meta.addLabel}
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
        <label className="min-w-[240px] flex-1 sm:max-w-md">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Tìm kiếm</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => setQuery(event.target.value)} placeholder={meta.search} type="search" value={query} />
          </span>
        </label>
        <label className="w-44">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Trạng thái</span>
          <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => setStatus(event.target.value as typeof status)} value={status}>
            <option value="ALL">Tất cả</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Tạm ngừng</option>
          </select>
        </label>
        <p className="ml-auto pb-2 text-xs font-medium text-slate-500">{items.length} bản ghi · {activeCount} đang hoạt động</p>
      </div>

      <div className="overflow-x-auto">
        {kind === 'department' && (
          <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Khoa</th><th className="px-4 py-3">Loại khoa</th><th className="px-4 py-3">Trưởng khoa</th><th className="px-4 py-3">Mô tả</th><th className="px-4 py-3">Trạng thái</th><th className="px-5 py-3 text-right">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(filteredItems as Department[]).map((item) => (
                <tr className={!item.active ? 'bg-slate-50/70' : 'hover:bg-blue-50/20'} key={item.id}>
                  <td className="px-5 py-4"><p className="font-bold text-slate-900">{item.name}</p><p className="mt-1 font-mono text-xs text-slate-400">{item.code}</p></td>
                  <td className="px-4 py-4"><span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{DEPARTMENT_TYPE_LABELS[item.type]}</span></td>
                  <td className="px-4 py-4">{departmentHeadNames(item.id).length > 0 ? <div className="space-y-1">{departmentHeadNames(item.id).map((name) => <p className="font-semibold text-slate-700" key={name}>{name}</p>)}</div> : <span className="italic text-slate-400">Chưa phân công</span>}</td>
                  <td className="max-w-sm px-4 py-4 text-slate-600">{item.description || 'Chưa có mô tả'}</td>
                  <td className="px-4 py-4"><StatusBadge active={item.active} /></td>
                  <td className="px-5 py-4"><div className="flex items-center justify-end gap-2"><ActionButton label={`Sửa ${item.name}`} onClick={() => onEdit('department', item.id)}><Pencil className="h-3.5 w-3.5" /> Sửa</ActionButton><Toggle active={item.active} label={`Đổi trạng thái ${item.name}`} onClick={() => void onToggle('department', item.id)} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {kind === 'specialty' && (
          <table className="min-w-[940px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Chuyên khoa</th><th className="px-4 py-3">Mô tả danh mục</th><th className="px-4 py-3">Mã danh mục</th><th className="px-4 py-3">Trạng thái</th><th className="px-5 py-3 text-right">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(filteredItems as Specialty[]).map((item) => (
                <tr className={!item.active ? 'bg-slate-50/70' : 'hover:bg-blue-50/20'} key={item.id}>
                  <td className="px-5 py-4"><p className="font-bold text-slate-900">{item.name}</p><p className="mt-1 font-mono text-xs text-slate-400">{item.code}</p></td>
                  <td className="max-w-md px-4 py-4 text-slate-600">{item.description || 'Chưa có mô tả'}</td>
                  <td className="px-4 py-4 font-mono text-xs text-slate-500">#{item.specialtyId}</td>
                  <td className="px-4 py-4"><StatusBadge active={item.active} /></td>
                  <td className="px-5 py-4"><div className="flex items-center justify-end gap-2"><Toggle active={item.active} label={`Đổi trạng thái ${item.name}`} onClick={() => void onToggle('specialty', item.id)} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {kind === 'room' && (
          <table className="min-w-[1120px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Phòng</th><th className="px-4 py-3">Loại & vị trí</th><th className="px-4 py-3">Năng lực tiếp nhận</th><th className="px-4 py-3">Trạng thái</th><th className="px-5 py-3 text-right">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(filteredItems as Room[]).map((item) => (
                <tr className={!item.active ? 'bg-slate-50/70' : 'hover:bg-blue-50/20'} key={item.id}>
                  <td className="px-5 py-4"><p className="font-bold text-slate-900">{item.name}</p><p className="mt-1 font-mono text-xs text-slate-400">{item.code}</p></td>
                  <td className="px-4 py-4"><p className="font-semibold text-slate-700">{ROOM_TYPE_LABELS[item.type]}{item.type === 'EXAM' && ` · ${item.serviceType === 'BHYT' ? 'BHYT' : 'Dịch vụ'}`}</p><p className="mt-1 text-xs text-slate-500">{item.location}</p></td>
                  <td className="px-4 py-4"><p className="font-semibold text-slate-700">{item.maxPatients == null ? 'Theo cấu hình bệnh viện' : `${item.maxPatients} bệnh nhân / khung`}</p><p className="mt-1 text-xs text-slate-500">{item.slotMinutes == null ? 'Thời lượng theo bệnh viện' : `${item.slotMinutes} phút mỗi khung`}</p></td>
                  <td className="px-4 py-4"><StatusBadge active={item.active} /></td>
                  <td className="px-5 py-4"><div className="flex items-center justify-end gap-2"><ActionButton label={`Sửa ${item.name}`} onClick={() => onEdit('room', item.id)}><Pencil className="h-3.5 w-3.5" /> Sửa</ActionButton><Toggle active={item.active} label={`Đổi trạng thái ${item.name}`} onClick={() => void onToggle('room', item.id)} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {kind === 'staff' && (
          <table className="min-w-[1020px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Nhân viên</th><th className="px-4 py-3">Vai trò</th><th className="px-4 py-3">Khoa / Chức danh</th><th className="px-4 py-3">Email cơ quan</th><th className="px-4 py-3">Trạng thái</th><th className="px-5 py-3 text-right">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(filteredItems as StaffAccount[]).map((item) => (
                <tr className={!item.active ? 'bg-slate-50/70' : 'hover:bg-blue-50/20'} key={item.id}>
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-700">{item.fullName.split(' ').slice(-2).map((word) => word[0]).join('')}</div><div><p className="font-bold text-slate-900">{item.fullName}</p><p className="mt-1 font-mono text-xs text-slate-400">{item.staffCode}</p></div></div></td>
                  <td className="px-4 py-4"><div className="flex max-w-xs flex-wrap gap-1.5">{item.roles.map((role) => <span className="rounded-md bg-violet-50 px-2 py-1 text-xs font-bold text-violet-700" key={role}>{STAFF_ROLE_LABELS[role]}</span>)}</div></td>
                  <td className="px-4 py-4"><p className="font-medium text-slate-700">{departmentName(item.departmentId)}</p><p className="mt-1 text-xs text-slate-500">{item.rankName || 'Không có chức danh bác sĩ'}</p></td>
                  <td className="px-4 py-4 font-medium text-slate-700">{item.email}</td>
                  <td className="px-4 py-4"><StaffStatusBadge status={item.status} /></td>
                  <td className="px-5 py-4"><div className="flex items-center justify-end gap-2"><ActionButton label={`Sửa ${item.fullName}`} onClick={() => onEdit('staff', item.id)}><Pencil className="h-3.5 w-3.5" /> Sửa</ActionButton><Toggle active={item.active} disabled={item.status === 'DEACTIVATED'} label={`Đổi trạng thái ${item.fullName}`} onClick={() => void onToggle('staff', item.id)} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {kind === 'service' && (
          <table className="min-w-[1000px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Dịch vụ</th><th className="px-4 py-3">Nhóm dịch vụ</th><th className="px-4 py-3">Mô tả</th><th className="px-4 py-3 text-right">Giá niêm yết</th><th className="px-4 py-3">Trạng thái</th><th className="px-5 py-3 text-right">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(filteredItems as MedicalService[]).map((item) => (
                <tr className={!item.active ? 'bg-slate-50/70' : 'hover:bg-blue-50/20'} key={item.id}>
                  <td className="px-5 py-4"><p className="font-bold text-slate-900">{item.name}</p><p className="mt-1 font-mono text-xs text-slate-400">{item.code}</p></td>
                  <td className="px-4 py-4"><span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{item.serviceCategoryName}</span><p className="mt-1 font-mono text-[11px] text-slate-400">{item.serviceCategoryCode}</p></td>
                  <td className="max-w-sm px-4 py-4 text-slate-600">{item.description || 'Chưa có mô tả'}</td>
                  <td className="px-4 py-4 text-right text-base font-extrabold text-slate-900">{new Intl.NumberFormat('vi-VN').format(item.price)} ₫</td>
                  <td className="px-4 py-4"><StatusBadge active={item.active} /></td>
                  <td className="px-5 py-4"><div className="flex items-center justify-end gap-2"><ActionButton label={`Sửa ${item.name}`} onClick={() => onEdit('service', item.id)}><Pencil className="h-3.5 w-3.5" /> Sửa giá</ActionButton><Toggle active={item.active} label={`Đổi trạng thái ${item.name}`} onClick={() => void onToggle('service', item.id)} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {filteredItems.length === 0 && (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
            <Search className="h-9 w-9 text-slate-300" />
            <p className="mt-3 font-bold text-slate-700">Không tìm thấy dữ liệu phù hợp</p>
            <p className="mt-1 text-sm text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc trạng thái.</p>
          </div>
        )}
      </div>
    </section>
  );
}
