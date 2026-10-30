'use client';

import { useState } from 'react';
import {
  Building2,
  CalendarDays,
  Clock3,
  ImagePlus,
  Info,
  MapPin,
  RotateCcw,
  Save,
  ShieldCheck,
} from 'lucide-react';
import type { FacilityInfo } from '../types';

interface FacilityInfoViewProps {
  facility: FacilityInfo;
  onSave: (facility: FacilityInfo) => Promise<FacilityInfo>;
  onUploadLogo: (file: File) => Promise<string>;
}

const WEEKDAYS = [
  { id: 1, short: 'T2', full: 'Thứ 2' },
  { id: 2, short: 'T3', full: 'Thứ 3' },
  { id: 3, short: 'T4', full: 'Thứ 4' },
  { id: 4, short: 'T5', full: 'Thứ 5' },
  { id: 5, short: 'T6', full: 'Thứ 6' },
  { id: 6, short: 'T7', full: 'Thứ 7' },
  { id: 7, short: 'CN', full: 'Chủ nhật' },
];

const inputClass = 'h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';
const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';

export function FacilityInfoView({ facility, onSave, onUploadLogo }: FacilityInfoViewProps) {
  const [draft, setDraft] = useState(facility);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState('');
  const dirty = JSON.stringify(draft) !== JSON.stringify(facility);

  const update = <K extends keyof FacilityInfo>(key: K, value: FacilityInfo[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const toggleWorkingDay = (day: number) => {
    update(
      'workingDays',
      draft.workingDays.includes(day)
        ? draft.workingDays.filter((item) => item !== day)
        : [...draft.workingDays, day].sort(),
    );
  };

  const handleLogoChange = async (file?: File) => {
    if (!file) return;
    if (file.type !== 'image/png' || file.size > 2 * 1024 * 1024) {
      setError('Logo phải là ảnh PNG và có dung lượng không quá 2 MB.');
      return;
    }

    setError('');
    setUploadingLogo(true);
    try {
      const logoUrl = await onUploadLogo(file);
      setDraft((current) => ({ ...current, logoUrl }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Không thể tải logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setError('');
        setSaving(true);
        try {
          const savedFacility = await onSave(draft);
          setDraft(savedFacility);
        } catch (saveError) {
          setError(saveError instanceof Error ? saveError.message : 'Không thể lưu thông tin cơ sở.');
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-900">
        <Info className="h-4 w-4 shrink-0 text-blue-700" />
        Thông tin này được hiển thị trên hồ sơ công khai và dùng để cấu hình lịch khám.
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" role="alert">{error}</p>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <Building2 className="h-5 w-5 text-blue-700" />
          <div>
            <h2 className="font-bold text-slate-900">Thông tin nhận diện</h2>
            <p className="mt-0.5 text-xs text-slate-500">Tên, tuyến và thông tin liên hệ chính thức.</p>
          </div>
        </div>
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[180px_1fr]">
          <div>
            <div
              aria-label={draft.logoUrl ? `Logo ${draft.name}` : undefined}
              className="flex aspect-square w-32 items-center justify-center overflow-hidden rounded-2xl bg-cover bg-center text-3xl font-extrabold text-white shadow-lg shadow-blue-100"
              role={draft.logoUrl ? 'img' : undefined}
              style={draft.logoUrl ? { backgroundImage: `url(${JSON.stringify(draft.logoUrl)})` } : undefined}
            >
              {!draft.logoUrl && <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-700 to-emerald-500">{draft.name.split(' ').slice(-2).map((word) => word[0]).join('').toUpperCase()}</span>}
            </div>
            <label className="mt-3 inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
              <ImagePlus className="h-4 w-4" /> {uploadingLogo ? 'Đang tải...' : 'Thay logo'}
              <input accept="image/png" className="sr-only" disabled={uploadingLogo} onChange={(event) => void handleLogoChange(event.target.files?.[0])} type="file" />
            </label>
            <p className="mt-2 text-[11px] leading-5 text-slate-400">PNG, tối đa 2 MB theo quy định backend.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className={labelClass}>Tên cơ sở y tế <span className="text-rose-600">*</span></span>
              <input className={inputClass} maxLength={200} onChange={(event) => update('name', event.target.value)} required value={draft.name} />
            </label>
            <label>
              <span className={labelClass}>Mã cơ sở</span>
              <input className={`${inputClass} cursor-not-allowed text-slate-500`} disabled value={draft.code} />
            </label>
            <label>
              <span className={labelClass}>Tuyến cơ sở</span>
              <select className={`${inputClass} cursor-not-allowed text-slate-500`} disabled value={draft.level}>
                <option value="CENTRAL">Trung ương</option><option value="PROVINCIAL">Tuyến tỉnh</option><option value="DISTRICT">Tuyến huyện</option><option value="PRIVATE">Tư nhân</option>
              </select>
            </label>
            <label>
              <span className={labelClass}>Tỉnh / Thành phố</span>
              <input className={inputClass} maxLength={100} onChange={(event) => update('province', event.target.value)} value={draft.province} />
            </label>
            <label className="sm:col-span-2">
              <span className={labelClass}>Địa chỉ <span className="text-rose-600">*</span></span>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input className={`${inputClass} pl-10`} onChange={(event) => update('address', event.target.value)} required value={draft.address} />
              </div>
            </label>
            <label>
              <span className={labelClass}>Hotline <span className="text-rose-600">*</span></span>
              <input className={inputClass} onChange={(event) => update('hotline', event.target.value)} required value={draft.hotline} />
            </label>
            <label>
              <span className={labelClass}>Email liên hệ <span className="text-rose-600">*</span></span>
              <input className={inputClass} onChange={(event) => update('email', event.target.value)} required type="email" value={draft.email} />
            </label>
            <label className="sm:col-span-2">
              <span className={labelClass}>Giới thiệu cơ sở</span>
              <textarea className="min-h-28 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" maxLength={1000} onChange={(event) => update('introduction', event.target.value)} value={draft.introduction} />
              <span className="mt-1 block text-right text-xs text-slate-400">{draft.introduction.length}/1000</span>
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <Clock3 className="h-5 w-5 text-blue-700" />
          <div>
            <h2 className="font-bold text-slate-900">Giờ làm việc và lịch khám</h2>
            <p className="mt-0.5 text-xs text-slate-500">Cấu hình mặc định áp dụng khi phòng chưa có lịch riêng.</p>
          </div>
        </div>
        <div className="space-y-6 p-5 sm:p-6">
          <div>
            <p className={labelClass}>Ngày làm việc</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const selected = draft.workingDays.includes(day.id);
                return (
                  <button aria-label={day.full} aria-pressed={selected} className={`flex h-10 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-bold transition ${selected ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300'}`} key={day.id} onClick={() => toggleWorkingDay(day.id)} type="button">
                    {day.short}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label><span className={labelClass}>Buổi sáng từ</span><input className={inputClass} onChange={(event) => update('morningStart', event.target.value)} type="time" value={draft.morningStart} /></label>
            <label><span className={labelClass}>Đến</span><input className={inputClass} onChange={(event) => update('morningEnd', event.target.value)} type="time" value={draft.morningEnd} /></label>
            <label><span className={labelClass}>Buổi chiều từ</span><input className={inputClass} onChange={(event) => update('afternoonStart', event.target.value)} type="time" value={draft.afternoonStart} /></label>
            <label><span className={labelClass}>Đến</span><input className={inputClass} onChange={(event) => update('afternoonEnd', event.target.value)} type="time" value={draft.afternoonEnd} /></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className={labelClass}>Tổng số chỗ / khung check-in</span><input name="slotCapacity" className={inputClass} min={1} max={50} step={1} required onChange={(event) => update('slotCapacity', Number(event.target.value))} type="number" value={draft.slotCapacity} /></label>
            <label><span className={labelClass}>Tỷ lệ dành cho đặt online (%)</span><input name="onlinePercent" className={inputClass} min={0} max={100} step={1} required onChange={(event) => update('onlinePercent', Number(event.target.value))} type="number" value={draft.onlinePercent} /></label>
            <p className="sm:col-span-2 text-xs text-slate-500">Mỗi khung mới có {Math.floor((draft.slotCapacity * draft.onlinePercent + 50) / 100)} chỗ online trên tổng {draft.slotCapacity} chỗ. Thay đổi áp dụng khi tạo slot mới.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label><span className={labelClass}>Khung khám mặc định</span><div className="relative"><input className={`${inputClass} pr-14`} min={5} onChange={(event) => update('slotMinutes', Number(event.target.value))} type="number" value={draft.slotMinutes} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">phút</span></div></label>
            <label><span className={labelClass}>Cho phép đặt trước</span><div className="relative"><input className={`${inputClass} pr-12`} min={1} onChange={(event) => update('bookingWeeksAhead', Number(event.target.value))} type="number" value={draft.bookingWeeksAhead} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">tuần</span></div></label>
            <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-100"><CalendarDays className="mb-2 h-5 w-5 text-emerald-700" /><strong>Phạm vi mở lịch:</strong><br />Tối đa {draft.bookingWeeksAhead} tuần kể từ hôm nay.</div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <ShieldCheck className="h-5 w-5 text-blue-700" />
          <div>
            <h2 className="font-bold text-slate-900">Chính sách đặt và hủy lịch</h2>
            <p className="mt-0.5 text-xs text-slate-500">Nội dung được hiển thị trước khi bệnh nhân xác nhận đặt khám.</p>
          </div>
        </div>
        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[220px_220px_1fr]">
          <label><span className={labelClass}>Được hủy trước tối thiểu</span><div className="relative"><input className={`${inputClass} pr-12`} min={0} onChange={(event) => update('cancelBeforeHours', Number(event.target.value))} type="number" value={draft.cancelBeforeHours} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">giờ</span></div></label>
          <label><span className={labelClass}>Tỷ lệ hoàn phí</span><div className="relative"><input className={`${inputClass} pr-9`} max={100} min={0} onChange={(event) => update('refundPercent', Number(event.target.value))} type="number" value={draft.refundPercent} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span></div></label>
          <label><span className={labelClass}>Nội dung chính sách</span><textarea className="min-h-28 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" onChange={(event) => update('policyText', event.target.value)} value={draft.policyText} /></label>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        {dirty && <span className="mr-auto rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Có thay đổi chưa lưu</span>}
        <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!dirty || saving} onClick={() => setDraft(facility)} type="button">
          <RotateCcw className="h-4 w-4" /> Hủy
        </button>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={saving || !dirty} type="submit">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
}
