'use client';

import { useState, type FormEvent } from 'react';
import { BadgeDollarSign, Building2, DoorOpen, Save, Stethoscope, UserPlus, X } from 'lucide-react';
import { STAFF_ROLE_LABELS } from '../data/facility-admin-data';
import type {
  AdminEntity,
  Department,
  EntityKind,
  MedicalService,
  RankCatalogItem,
  Room,
  ServiceCategory,
  Specialty,
  SpecialtyCatalogItem,
  StaffAccount,
  StaffRole,
} from '../types';

interface EntityEditorModalProps {
  kind: EntityKind;
  entity?: AdminEntity;
  departments: Department[];
  specialtyCatalog: SpecialtyCatalogItem[];
  rankCatalog: RankCatalogItem[];
  serviceCategories: ServiceCategory[];
  onClose: () => void;
  onSave: (entity: AdminEntity) => Promise<void>;
}

type FormState = Record<string, string | boolean | string[]>;

const META = {
  department: { singular: 'Khoa', icon: Building2 },
  specialty: { singular: 'Chuyên khoa', icon: Stethoscope },
  room: { singular: 'Phòng', icon: DoorOpen },
  staff: { singular: 'Nhân viên', icon: UserPlus },
  service: { singular: 'Dịch vụ', icon: BadgeDollarSign },
};

const STAFF_ROLES: StaffRole[] = [
  'DOCTOR',
  'DEPARTMENT_HEAD',
  'RECEPTIONIST',
  'PHARMACIST',
  'PARACLINICAL_TECHNICIAN',
  'HOSPITAL_LEADER',
  'HOSPITAL_ADMIN',
];

const inputClass = 'h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';
const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';

function initialForm(kind: EntityKind, entity?: AdminEntity): FormState {
  if (kind === 'department') {
    const item = entity as Department | undefined;
    return { code: item?.code ?? '', name: item?.name ?? '', type: item?.type ?? 'CLINICAL', description: item?.description ?? '' };
  }
  if (kind === 'specialty') {
    const item = entity as Specialty | undefined;
    return { specialtyId: String(item?.specialtyId ?? '') };
  }
  if (kind === 'room') {
    const item = entity as Room | undefined;
    return {
      code: item?.code ?? '', name: item?.name ?? '', type: item?.type ?? 'EXAM', location: item?.location ?? '',
      slotMinutes: String(item?.slotMinutes ?? 15), maxPatients: String(item?.maxPatients ?? 1),
    };
  }
  if (kind === 'staff') {
    const item = entity as StaffAccount | undefined;
    return {
      staffCode: item?.staffCode ?? '', fullName: item?.fullName ?? '', email: item?.email ?? '',
      gender: item?.gender ?? 'MALE', roles: item?.roles ?? ['DOCTOR'],
      departmentId: String(item?.departmentId ?? ''), rankId: String(item?.rankId ?? ''), initialPassword: '',
    };
  }
  const item = entity as MedicalService | undefined;
  return {
    code: item?.code ?? '', name: item?.name ?? '',
    serviceCategoryId: String(item?.serviceCategoryId ?? ''),
    price: String(item?.price ?? 0), description: item?.description ?? '',
  };
}

export function EntityEditorModal({
  kind,
  entity,
  departments,
  specialtyCatalog,
  rankCatalog,
  serviceCategories,
  onClose,
  onSave,
}: EntityEditorModalProps) {
  const [form, setForm] = useState<FormState>(() => initialForm(kind, entity));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const meta = META[kind];
  const ModalIcon = meta.icon;
  const isEditing = Boolean(entity);

  const update = (key: string, value: string | boolean | string[]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const toggleRole = (role: StaffRole) => {
    const roles = form.roles as string[];
    update('roles', roles.includes(role) ? roles.filter((item) => item !== role) : [...roles, role]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = entity?.id ?? -1;
    const active = entity?.active ?? true;

    setError('');
    setSubmitting(true);
    try {
      if (kind === 'department') {
        await onSave({ id, active, code: String(form.code).trim().toUpperCase(), name: String(form.name).trim(), type: form.type as Department['type'], description: String(form.description).trim() });
        return;
      }
      if (kind === 'specialty') {
        const catalogItem = specialtyCatalog.find((item) => item.id === Number(form.specialtyId));
        if (!catalogItem) throw new Error('Vui lòng chọn chuyên khoa trong danh mục chung.');
        await onSave({ id, active, specialtyId: catalogItem.id, code: catalogItem.code, name: catalogItem.name, description: catalogItem.description });
        return;
      }
      if (kind === 'room') {
        await onSave({
          id, active, code: String(form.code).trim().toUpperCase(), name: String(form.name).trim(),
          type: form.type as Room['type'], location: String(form.location).trim(),
          slotMinutes: Number(form.slotMinutes), maxPatients: Number(form.maxPatients),
        });
        return;
      }
      if (kind === 'staff') {
        const roles = form.roles as StaffRole[];
        if (roles.length === 0) throw new Error('Vui lòng chọn ít nhất một vai trò.');
        if (roles.includes('DOCTOR') && !form.rankId) throw new Error('Bác sĩ phải được gắn chức danh chuyên môn.');
        if (!roles.includes('DOCTOR') && form.rankId) throw new Error('Chỉ tài khoản bác sĩ mới được gắn chức danh chuyên môn.');
        await onSave({
          id,
          active,
          staffCode: String(form.staffCode).trim().toUpperCase(),
          fullName: String(form.fullName).trim(),
          email: String(form.email).trim(),
          gender: form.gender as StaffAccount['gender'],
          roles,
          departmentId: form.departmentId ? Number(form.departmentId) : undefined,
          rankId: form.rankId ? Number(form.rankId) : undefined,
          status: (entity as StaffAccount | undefined)?.status ?? 'ACTIVE',
          initialPassword: isEditing ? undefined : String(form.initialPassword),
        });
        return;
      }

      const category = serviceCategories.find((item) => item.id === Number(form.serviceCategoryId));
      if (!category) throw new Error('Vui lòng chọn nhóm dịch vụ.');
      await onSave({
        id,
        active,
        code: String(form.code).trim().toUpperCase(),
        name: String(form.name).trim(),
        serviceCategoryId: category.id,
        serviceCategoryCode: category.code,
        serviceCategoryName: category.name,
        price: Number(form.price),
        description: String(form.description).trim(),
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể lưu dữ liệu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div aria-modal="true" className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog">
      <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100"><ModalIcon className="h-5 w-5" /></div>
          <div className="flex-1"><h2 className="text-lg font-extrabold text-slate-950">{isEditing ? 'Cập nhật' : 'Thêm'} {meta.singular}</h2><p className="mt-0.5 text-xs text-slate-500">Các trường có dấu * là bắt buộc.</p></div>
          <button aria-label="Đóng" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={onClose} type="button"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            {(kind === 'department' || kind === 'room' || kind === 'service') && (
              <label><span className={labelClass}>Mã {meta.singular} <span className="text-rose-600">*</span></span><input className={`${inputClass} font-mono uppercase`} maxLength={20} onChange={(event) => update('code', event.target.value)} required value={String(form.code)} /></label>
            )}
            {kind === 'staff' && (
              <label><span className={labelClass}>Mã nhân viên <span className="text-rose-600">*</span></span><input className={`${inputClass} font-mono uppercase`} maxLength={20} onChange={(event) => update('staffCode', event.target.value)} required value={String(form.staffCode)} /></label>
            )}
            {kind !== 'specialty' && <label><span className={labelClass}>{kind === 'staff' ? 'Họ và tên' : `Tên ${meta.singular}`} <span className="text-rose-600">*</span></span><input className={inputClass} maxLength={255} onChange={(event) => update(kind === 'staff' ? 'fullName' : 'name', event.target.value)} required value={String(form[kind === 'staff' ? 'fullName' : 'name'])} /></label>}

            {kind === 'department' && (
              <><label><span className={labelClass}>Loại khoa <span className="text-rose-600">*</span></span><select className={inputClass} onChange={(event) => update('type', event.target.value)} value={String(form.type)}><option value="CLINICAL">Lâm sàng</option><option value="PARACLINICAL">Cận lâm sàng</option><option value="EMERGENCY">Cấp cứu</option><option value="ADMINISTRATIVE">Hành chính</option></select></label><label className="sm:col-span-2"><span className={labelClass}>Mô tả</span><textarea className={`${inputClass} min-h-24 py-3`} onChange={(event) => update('description', event.target.value)} value={String(form.description)} /></label></>
            )}

            {kind === 'specialty' && (
              <label className="sm:col-span-2"><span className={labelClass}>Danh mục chuyên khoa chung <span className="text-rose-600">*</span></span><select className={inputClass} onChange={(event) => update('specialtyId', event.target.value)} required value={String(form.specialtyId)}><option value="">Chọn chuyên khoa</option>{specialtyCatalog.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select><span className="mt-2 block text-xs text-slate-500">Tên, mã và mô tả do Super Admin quản lý trong danh mục chung.</span></label>
            )}

            {kind === 'room' && (
              <>
                <label><span className={labelClass}>Loại phòng <span className="text-rose-600">*</span></span><select className={inputClass} onChange={(event) => update('type', event.target.value)} value={String(form.type)}><option value="EXAM">Phòng khám</option><option value="XRAY">X-quang</option><option value="ULTRASOUND">Siêu âm</option><option value="LAB">Xét nghiệm</option><option value="PROCEDURE">Thủ thuật</option><option value="RECEPTION">Tiếp đón</option><option value="CASHIER">Thu ngân</option><option value="PHARMACY">Nhà thuốc</option></select></label>
                <label><span className={labelClass}>Vị trí</span><input className={inputClass} maxLength={255} onChange={(event) => update('location', event.target.value)} placeholder="VD: Tầng 2 · Khu A" value={String(form.location)} /></label>
                <label><span className={labelClass}>Thời lượng mỗi khung (phút)</span><input className={inputClass} max={120} min={5} onChange={(event) => update('slotMinutes', event.target.value)} type="number" value={String(form.slotMinutes)} /></label>
                <label><span className={labelClass}>Số bệnh nhân / khung</span><input className={inputClass} max={50} min={1} onChange={(event) => update('maxPatients', event.target.value)} required type="number" value={String(form.maxPatients)} /></label>
              </>
            )}

            {kind === 'staff' && (
              <>
                <label><span className={labelClass}>Email cơ quan <span className="text-rose-600">*</span></span><input className={inputClass} maxLength={255} onChange={(event) => update('email', event.target.value)} required type="email" value={String(form.email)} /><span className="mt-1 block text-xs text-slate-400">Backend không chấp nhận địa chỉ @gmail.com.</span></label>
                <label><span className={labelClass}>Giới tính <span className="text-rose-600">*</span></span><select className={inputClass} onChange={(event) => update('gender', event.target.value)} value={String(form.gender)}><option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option></select></label>
                <label><span className={labelClass}>Khoa công tác</span><select className={inputClass} onChange={(event) => update('departmentId', event.target.value)} value={String(form.departmentId)}><option value="">Không phân khoa</option>{departments.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label><span className={labelClass}>Chức danh bác sĩ</span><select className={inputClass} onChange={(event) => update('rankId', event.target.value)} value={String(form.rankId)}><option value="">Không áp dụng</option>{rankCatalog.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></label>
                <fieldset className="sm:col-span-2"><legend className={labelClass}>Vai trò <span className="text-rose-600">*</span></legend><div className="grid gap-2 sm:grid-cols-2">{STAFF_ROLES.map((role) => <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700" key={role}><input checked={(form.roles as string[]).includes(role)} className="h-4 w-4 accent-blue-700" onChange={() => toggleRole(role)} type="checkbox" />{STAFF_ROLE_LABELS[role]}</label>)}</div></fieldset>
                <p className="sm:col-span-2 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">Để phân công trưởng khoa, chọn vai trò “Trưởng khoa” và chọn khoa công tác tương ứng.</p>
                {!isEditing && <label className="sm:col-span-2"><span className={labelClass}>Mật khẩu ban đầu <span className="text-rose-600">*</span></span><input autoComplete="new-password" className={inputClass} minLength={8} onChange={(event) => update('initialPassword', event.target.value)} pattern="(?=.*[A-Za-z])(?=.*\d).{8,}" required type="password" value={String(form.initialPassword)} /><span className="mt-1 block text-xs text-slate-400">Tối thiểu 8 ký tự, có ít nhất một chữ cái và một chữ số.</span></label>}
              </>
            )}

            {kind === 'service' && (
              <>
                <label className="sm:col-span-2"><span className={labelClass}>Nhóm dịch vụ <span className="text-rose-600">*</span></span><select className={inputClass} onChange={(event) => update('serviceCategoryId', event.target.value)} required value={String(form.serviceCategoryId)}><option value="">Chọn nhóm dịch vụ</option>{serviceCategories.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></label>
                <label><span className={labelClass}>Giá niêm yết (VNĐ) <span className="text-rose-600">*</span></span><input className={inputClass} max={999999999999} min={0} onChange={(event) => update('price', event.target.value)} required step={1} type="number" value={String(form.price)} /></label>
                <label className="sm:col-span-2"><span className={labelClass}>Mô tả</span><textarea className={`${inputClass} min-h-24 py-3`} onChange={(event) => update('description', event.target.value)} value={String(form.description)} /></label>
              </>
            )}

            {error && <p className="sm:col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700" role="alert">{error}</p>}
          </div>
          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
            <button className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50" onClick={onClose} type="button">Hủy</button>
            <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} type="submit"><Save className="h-4 w-4" /> {submitting ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : `Thêm ${meta.singular}`}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
