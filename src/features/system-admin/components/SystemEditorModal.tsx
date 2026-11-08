'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Eye, EyeOff, LoaderCircle, Save, UserPlus, X } from 'lucide-react';
import type {
  ArticleItem,
  EditableSection,
  HospitalDetail,
  HospitalSummary,
  HospitalAdminFormValues,
  IngredientItem,
  MedicineItem,
  ServiceCategoryItem,
  SpecialtyItem,
  SystemResource,
} from '../types';

interface ResourceEditorProps {
  section: EditableSection;
  item?: SystemResource;
  ingredients: IngredientItem[];
  serviceCategories: ServiceCategoryItem[];
  specialties: SpecialtyItem[];
  onSave: (section: EditableSection, payload: Record<string, unknown>) => Promise<void>;
}

type SystemEditorModalProps = { onClose: () => void } & (
  | (ResourceEditorProps & { mode?: 'resource' })
  | { mode: 'hospital-admin'; hospital: HospitalSummary; preview?: boolean; onCreateHospitalAdmin: (values: HospitalAdminFormValues) => Promise<void> }
);

const SECTION_TITLES: Record<EditableSection, { create: string; edit: string }> = {
  hospitals: { create: 'Thêm cơ sở y tế', edit: 'Cập nhật cơ sở y tế' },
  specialties: { create: 'Thêm chuyên khoa', edit: 'Cập nhật chuyên khoa' },
  'service-categories': { create: 'Thêm nhóm dịch vụ', edit: 'Cập nhật nhóm dịch vụ' },
  icd10: { create: 'Thêm mã bệnh ICD-10', edit: 'Cập nhật mã bệnh ICD-10' },
  ingredients: { create: 'Thêm hoạt chất', edit: 'Cập nhật hoạt chất' },
  medicines: { create: 'Thêm thuốc', edit: 'Cập nhật thuốc' },
  articles: { create: 'Viết bài sức khỏe', edit: 'Biên tập bài viết' },
};

const inputClass = 'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500';
const textareaClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

function Field({ children, label, required = false, wide = false }: { children: ReactNode; label: string; required?: boolean; wide?: boolean }) {
  return <label className={wide ? 'sm:col-span-2' : ''}><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}{required && <span className="text-rose-600"> *</span>}</span>{children}</label>;
}

function HospitalFields({ item }: { item?: SystemResource }) {
  const hospital = item as HospitalDetail | undefined;
  return (
    <>
      <Field label="Mã cơ sở" required><input className={inputClass} defaultValue={hospital?.code ?? ''} disabled={Boolean(hospital)} maxLength={20} name="code" placeholder="VD: BVCR" required /></Field>
      <Field label="Tên cơ sở" required><input className={inputClass} defaultValue={hospital?.name ?? ''} maxLength={255} name="name" required /></Field>
      <Field label="Tuyến bệnh viện" required><select className={inputClass} defaultValue={hospital?.level ?? 'PROVINCIAL'} name="level" required><option value="CENTRAL">Trung ương</option><option value="PROVINCIAL">Tuyến tỉnh</option><option value="DISTRICT">Tuyến xã</option></select></Field>
      <Field label="Tỉnh / Thành phố"><input className={inputClass} defaultValue={hospital?.province ?? ''} maxLength={100} name="province" /></Field>
      <Field label="Địa chỉ" wide><input className={inputClass} defaultValue={hospital?.address ?? ''} maxLength={300} name="address" /></Field>
      <Field label="Hotline"><input className={inputClass} defaultValue={hospital?.hotline ?? ''} maxLength={20} name="hotline" /></Field>
      <Field label="Email"><input className={inputClass} defaultValue={hospital?.email ?? ''} maxLength={255} name="email" type="email" /></Field>
      <Field label="Giới thiệu" wide><textarea className={textareaClass} defaultValue={hospital?.introduction ?? ''} name="introduction" rows={3} /></Field>
      <Field label="Bắt đầu buổi sáng" required><input className={inputClass} defaultValue={hospital?.morningStart?.slice(0, 5) ?? '07:00'} name="morningStart" required type="time" /></Field>
      <Field label="Kết thúc buổi sáng" required><input className={inputClass} defaultValue={hospital?.morningEnd?.slice(0, 5) ?? '11:30'} name="morningEnd" required type="time" /></Field>
      <Field label="Bắt đầu buổi chiều" required><input className={inputClass} defaultValue={hospital?.afternoonStart?.slice(0, 5) ?? '13:00'} name="afternoonStart" required type="time" /></Field>
      <Field label="Kết thúc buổi chiều" required><input className={inputClass} defaultValue={hospital?.afternoonEnd?.slice(0, 5) ?? '17:00'} name="afternoonEnd" required type="time" /></Field>
      <Field label="Ngày làm việc" required><input className={inputClass} defaultValue={hospital?.workingDays ?? '1,2,3,4,5,6'} name="workingDays" pattern="[1-7](,[1-7])*" placeholder="1,2,3,4,5,6" required /></Field>
      <Field label="Phút / khung khám" required><input className={inputClass} defaultValue={hospital?.slotMinutes ?? 30} max={120} min={5} name="slotMinutes" required type="number" /></Field>
      <Field label="Tổng số chỗ / khung check-in" required><input className={inputClass} defaultValue={hospital?.slotCapacity ?? 3} max={50} min={1} name="slotCapacity" required step={1} type="number" /></Field>
      <Field label="Tỷ lệ đặt online (%)" required><input className={inputClass} defaultValue={hospital?.onlinePercent ?? 60} max={100} min={0} name="onlinePercent" required step={1} type="number" /></Field>
      <Field label="Số tuần cho đặt trước" required><input className={inputClass} defaultValue={hospital?.bookingWeeksAhead ?? 4} max={12} min={1} name="bookingWeeksAhead" required type="number" /></Field>
      <Field label="Giờ hủy trước lịch" required><input className={inputClass} defaultValue={hospital?.cancelBeforeHours ?? 24} min={0} name="cancelBeforeHours" required type="number" /></Field>
      <Field label="Tỷ lệ hoàn tiền (%)" required><input className={inputClass} defaultValue={hospital?.refundPercent ?? 100} max={100} min={0} name="refundPercent" required step="0.01" type="number" /></Field>
      <Field label="Chính sách đặt / hủy lịch" wide><textarea className={textareaClass} defaultValue={hospital?.policyText ?? ''} name="policyText" rows={4} /></Field>
    </>
  );
}

function SectionFields({ section, item, ingredients, serviceCategories, specialties }: Pick<ResourceEditorProps, 'section' | 'item' | 'ingredients' | 'serviceCategories' | 'specialties'>) {
  if (section === 'hospitals') return <HospitalFields item={item} />;
  if (section === 'specialties') {
    const value = item as SpecialtyItem | undefined;
    return <><Field label="Mã chuyên khoa" required><input className={inputClass} defaultValue={value?.code ?? ''} maxLength={20} name="code" required /></Field><Field label="Tên chuyên khoa" required><input className={inputClass} defaultValue={value?.name ?? ''} maxLength={255} name="name" required /></Field><Field label="Mô tả" wide><textarea className={textareaClass} defaultValue={value?.description ?? ''} name="description" rows={5} /></Field></>;
  }
  if (section === 'service-categories') {
    const value = item as ServiceCategoryItem | undefined;
    return <><Field label="Mã nhóm" required><input className={inputClass} defaultValue={value?.code ?? ''} maxLength={20} name="code" required /></Field><Field label="Tên nhóm" required><input className={inputClass} defaultValue={value?.name ?? ''} maxLength={255} name="name" required /></Field><Field label="Nhóm cha" wide><select className={inputClass} defaultValue={value?.parentId ?? ''} name="parentId"><option value="">— Danh mục gốc —</option>{serviceCategories.filter((entry) => entry.id !== value?.id).map((entry) => <option key={entry.id} value={entry.id}>{entry.code} · {entry.name}</option>)}</select></Field></>;
  }
  if (section === 'icd10') {
    const value = item as { code?: string; name?: string } | undefined;
    return <><Field label="Mã ICD-10" required><input className={inputClass} defaultValue={value?.code ?? ''} maxLength={10} name="code" placeholder="VD: A00.0" required /></Field><Field label="Tên bệnh / Chẩn đoán" required><input className={inputClass} defaultValue={value?.name ?? ''} maxLength={255} name="name" required /></Field></>;
  }
  if (section === 'ingredients') {
    const value = item as IngredientItem | undefined;
    return <Field label="Tên hoạt chất" required wide><input className={inputClass} defaultValue={value?.name ?? ''} maxLength={255} name="name" required /></Field>;
  }
  if (section === 'medicines') {
    const value = item as MedicineItem | undefined;
    const ingredientLines = value?.ingredients.map((entry) => `${entry.ingredientId}${entry.strength ? ` | ${entry.strength}` : ''}`).join('\n') ?? '';
    return <><Field label="Mã thuốc" required><input className={inputClass} defaultValue={value?.code ?? ''} maxLength={30} name="code" required /></Field><Field label="Tên thuốc" required><input className={inputClass} defaultValue={value?.name ?? ''} maxLength={255} name="name" required /></Field><Field label="Hàm lượng tổng"><input className={inputClass} defaultValue={value?.strength ?? ''} maxLength={50} name="strength" /></Field><Field label="Đường dùng"><input className={inputClass} defaultValue={value?.route ?? ''} maxLength={30} name="route" placeholder="Uống, tiêm, bôi..." /></Field><Field label="Thành phần hoạt chất" required wide><textarea className={textareaClass} defaultValue={ingredientLines} name="ingredientLines" placeholder={'Mỗi dòng: ID hoạt chất | Hàm lượng\nVD: 12 | 500mg'} required rows={5} /><p className="mt-2 text-xs leading-5 text-slate-500">ID khả dụng: {ingredients.slice(0, 12).map((entry) => `${entry.id} – ${entry.name}`).join('; ') || 'Chưa tải được danh mục hoạt chất'}{ingredients.length > 12 ? '…' : ''}</p></Field><Field label="Trạng thái" wide><label className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700"><input className="h-4 w-4 accent-emerald-600" defaultChecked={value?.active ?? true} name="active" type="checkbox" /> Cho phép sử dụng thuốc</label></Field></>;
  }
  const value = item as ArticleItem | undefined;
  return <><Field label="Tiêu đề" required wide><input className={inputClass} defaultValue={value?.title ?? ''} maxLength={255} name="title" required /></Field><Field label="Chuyên khoa"><select className={inputClass} defaultValue={value?.specialtyId ?? ''} name="specialtyId"><option value="">— Tin sức khỏe chung —</option>{specialties.map((entry) => <option key={entry.id} value={entry.id}>{entry.code} · {entry.name}</option>)}</select></Field><Field label="Ảnh đại diện JPEG"><input accept="image/jpeg" className={`${inputClass} py-2`} name="thumbnailFile" type="file" /><p className="mt-1.5 text-xs text-slate-500">Tối đa 5 MB. Bỏ trống để giữ ảnh hiện tại.</p></Field><Field label="Tóm tắt" wide><input className={inputClass} defaultValue={value?.summary ?? ''} maxLength={500} name="summary" /></Field><Field label="Nội dung bài viết" required wide><textarea className={textareaClass} defaultValue={value?.content ?? ''} name="content" required rows={12} /></Field></>;
}

function optionalText(form: FormData, key: string) {
  const value = String(form.get(key) ?? '').trim();
  return value || undefined;
}

function buildPayload(section: EditableSection, item: SystemResource | undefined, form: FormData) {
  const id = item?.id;
  if (section === 'hospitals') {
    const payload: Record<string, unknown> = {
      name: String(form.get('name') ?? '').trim(), level: form.get('level'), province: optionalText(form, 'province'), address: optionalText(form, 'address'), hotline: optionalText(form, 'hotline'), email: optionalText(form, 'email'), introduction: optionalText(form, 'introduction'), morningStart: form.get('morningStart'), morningEnd: form.get('morningEnd'), afternoonStart: form.get('afternoonStart'), afternoonEnd: form.get('afternoonEnd'), workingDays: form.get('workingDays'), slotMinutes: Number(form.get('slotMinutes')), slotCapacity: Number(form.get('slotCapacity')), onlinePercent: Number(form.get('onlinePercent')), bookingWeeksAhead: Number(form.get('bookingWeeksAhead')), cancelBeforeHours: Number(form.get('cancelBeforeHours')), refundPercent: Number(form.get('refundPercent')), policyText: optionalText(form, 'policyText'),
    };
    if (id) payload.id = id;
    else payload.code = String(form.get('code') ?? '').trim();
    return payload;
  }
  if (section === 'specialties') return { ...(id ? { id } : {}), code: String(form.get('code')).trim(), name: String(form.get('name')).trim(), description: optionalText(form, 'description') };
  if (section === 'service-categories') return { ...(id ? { id } : {}), parentId: optionalText(form, 'parentId') ? Number(form.get('parentId')) : undefined, code: String(form.get('code')).trim(), name: String(form.get('name')).trim() };
  if (section === 'icd10') return { ...(id ? { id } : {}), code: String(form.get('code')).trim(), name: String(form.get('name')).trim() };
  if (section === 'ingredients') return { ...(id ? { id } : {}), name: String(form.get('name')).trim() };
  if (section === 'medicines') {
    const ingredients = String(form.get('ingredientLines') ?? '').split('\n').map((line) => line.trim()).filter(Boolean).map((line) => { const [ingredientId, strength] = line.split('|').map((part) => part.trim()); return { ingredientId: Number(ingredientId), strength: strength || undefined }; });
    if (ingredients.some((entry) => !Number.isInteger(entry.ingredientId) || entry.ingredientId <= 0)) throw new Error('ID hoạt chất phải là số nguyên dương.');
    return { ...(id ? { id } : {}), code: String(form.get('code')).trim(), name: String(form.get('name')).trim(), strength: optionalText(form, 'strength'), route: optionalText(form, 'route'), active: form.get('active') === 'on', ingredients };
  }
  const thumbnailFile = form.get('thumbnailFile');
  if (thumbnailFile instanceof File && thumbnailFile.size > 5 * 1024 * 1024) throw new Error('Ảnh đại diện không được vượt quá 5 MB.');
  return { ...(id ? { id } : {}), specialtyId: optionalText(form, 'specialtyId') ? Number(form.get('specialtyId')) : undefined, title: String(form.get('title')).trim(), summary: optionalText(form, 'summary'), content: String(form.get('content')).trim(), thumbnailFile: thumbnailFile instanceof File && thumbnailFile.size > 0 ? thumbnailFile : undefined };
}

function HospitalAdminFields({ hospital, preview = false }: { hospital: HospitalSummary; preview?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2">
        <p className="text-sm font-bold text-slate-900">{hospital.name}</p>
        <p className="mt-1 text-xs text-slate-500">Mã cơ sở: {hospital.code} · Vai trò: Quản trị cơ sở</p>
      </div>
      <p className="text-sm text-slate-500 sm:col-span-2">{preview ? 'Bản xem trước — thông tin nhập ở đây chưa tạo tài khoản thực tế.' : 'Tài khoản mới được cấp quyền quản trị cho cơ sở y tế này.'}</p>
      <Field label="Họ và tên" required><input autoComplete="name" className={inputClass} maxLength={100} name="fullName" required /></Field>
      <Field label="Email cơ quan" required><input autoComplete="off" className={inputClass} maxLength={100} name="corporateEmail" placeholder="admin@benhvien.vn" required type="email" /><span className="mt-1.5 block text-xs text-slate-500">Dùng để đăng nhập. Không sử dụng Gmail.</span></Field>
      <Field label="Mã nhân viên" required><input autoComplete="off" className={inputClass} maxLength={20} name="staffCode" placeholder="VD: ADMIN001" required /></Field>
      <Field label="Giới tính" required><select className={inputClass} defaultValue="" name="gender" required><option disabled value="">Chọn giới tính</option><option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option></select></Field>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500" htmlFor="hospital-admin-password">Mật khẩu ban đầu <span className="text-rose-600">*</span></label>
        <div className="relative">
          <input aria-describedby="hospital-admin-password-hint" autoComplete="new-password" className={`${inputClass} pr-12`} id="hospital-admin-password" maxLength={255} minLength={8} name="initialPassword" required type={showPassword ? 'text' : 'password'} />
          <button aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-500 hover:text-slate-800" onClick={() => setShowPassword((value) => !value)} type="button">{showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}</button>
        </div>
        <p className="mt-1.5 text-xs text-slate-500" id="hospital-admin-password-hint">Ít nhất 8 ký tự, gồm chữ cái và chữ số. Bàn giao mật khẩu ban đầu cho quản trị viên.</p>
      </div>
    </>
  );
}

function buildHospitalAdminValues(form: FormData): HospitalAdminFormValues {
  const corporateEmail = String(form.get('corporateEmail') ?? '').trim().toLowerCase();
  const fullName = String(form.get('fullName') ?? '').trim();
  const staffCode = String(form.get('staffCode') ?? '').trim().toUpperCase();
  const initialPassword = String(form.get('initialPassword') ?? '');
  const gender = String(form.get('gender') ?? '');
  if (!fullName || !staffCode) throw new Error('Vui lòng nhập họ tên và mã nhân viên, không chỉ khoảng trắng.');
  if (!/^(?![A-Z0-9._%+-]+@gmail\.com$)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(corporateEmail)) {
    throw new Error('Vui lòng nhập email cơ quan hợp lệ, không sử dụng Gmail.');
  }
  if (initialPassword.length < 8 || !/[A-Za-z]/.test(initialPassword) || !/\d/.test(initialPassword)) {
    throw new Error('Mật khẩu cần ít nhất 8 ký tự, gồm chữ cái và chữ số.');
  }
  if (gender !== 'MALE' && gender !== 'FEMALE' && gender !== 'OTHER') throw new Error('Vui lòng chọn giới tính.');
  return { corporateEmail, fullName, staffCode, initialPassword, gender };
}

export function SystemEditorModal(props: SystemEditorModalProps) {
  const { onClose } = props;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const isHospitalAdmin = props.mode === 'hospital-admin';
  const title = isHospitalAdmin ? 'Cấp tài khoản quản trị' : props.item ? SECTION_TITLES[props.section].edit : SECTION_TITLES[props.section].create;

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel.current?.querySelector<HTMLElement>('input:not(:disabled), select:not(:disabled), button')?.focus();
    return () => previous?.focus();
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (!submitting.current) onClose();
    }
    if (event.key !== 'Tab') return;
    const focusable = panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href]');
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setSaving(true);
    setError('');
    try {
      const form = new FormData(event.currentTarget);
      if (props.mode === 'hospital-admin') {
        if (props.hospital.status !== 'ACTIVE') throw new Error('Không thể cấp tài khoản cho cơ sở đang tạm ngừng.');
        await props.onCreateHospitalAdmin(buildHospitalAdminValues(form));
      } else {
        await props.onSave(props.section, buildPayload(props.section, props.item, form));
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không thể lưu dữ liệu.');
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return (
    <div aria-labelledby="system-editor-title" className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" onKeyDown={handleKeyDown} role="dialog" aria-modal="true">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" ref={panel}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="text-lg font-extrabold text-slate-950" id="system-editor-title">{title}</h2><p className="mt-1 text-xs text-slate-500">Các trường có dấu * là bắt buộc.</p></div><button aria-label="Đóng" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50" disabled={saving} onClick={onClose} type="button"><X className="h-5 w-5" /></button></div>
        <form className="min-h-0 flex-1 overflow-y-auto" onSubmit={submit}>
          <fieldset className="grid gap-4 px-5 py-5 disabled:opacity-70 sm:grid-cols-2 sm:px-6" disabled={saving}>{props.mode === 'hospital-admin' ? <HospitalAdminFields hospital={props.hospital} preview={props.preview} /> : <SectionFields {...props} />}</fieldset>
          {error && <p className="mx-5 mb-3 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 sm:mx-6" role="alert">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6"><button className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50" disabled={saving} onClick={onClose} type="button">Hủy</button><button className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60" disabled={saving} type="submit">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : isHospitalAdmin ? <UserPlus className="h-4 w-4" /> : <Save className="h-4 w-4" />}{saving ? 'Đang xử lý...' : isHospitalAdmin ? 'Cấp tài khoản' : 'Lưu thay đổi'}</button></div>
        </form>
      </div>
    </div>
  );
}
