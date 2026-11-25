'use client';

import { useState } from 'react';
import {
  Building2,
  Clock3,
  ExternalLink,
  ImagePlus,
  MapPin,
  RotateCcw,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { getGoogleMapsSearchHref } from '@/src/shared/lib/google-maps';
import { AdminApiError } from '../api/admin-api-client';
import type { FacilityInfo } from '../types';

interface FacilityInfoViewProps {
  facility: FacilityInfo;
  onSave: (facility: FacilityInfo) => Promise<FacilityInfo>;
  onSaveFailure: (message: string) => void;
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

const facilityLevelLabels: Record<FacilityInfo['level'], string> = {
  CENTRAL: 'Trung ương',
  PROVINCIAL: 'Tuyến tỉnh',
  DISTRICT: 'Tuyến huyện',
  PRIVATE: 'Tư nhân',
};

const timeGroups = [
  { label: 'Buổi sáng', fields: ['morningStart', 'morningEnd'] },
  { label: 'Buổi chiều', fields: ['afternoonStart', 'afternoonEnd'] },
] as const;
const checkInFields = [
  { field: 'slotMinutes', label: 'Thời lượng mỗi khung', unit: 'phút', min: 5 },
  { field: 'slotCapacity', label: 'Tổng số chỗ mỗi khung', unit: 'chỗ', min: 1, max: 50, step: 1, required: true },
  { field: 'onlinePercent', label: 'Tỷ lệ đặt online', unit: '%', min: 0, max: 100, step: 1, required: true },
] as const;
const bookingHorizonField = { field: 'bookingWeeksAhead', label: 'Cho phép đặt trước tối đa', unit: 'tuần', min: 1 } as const;

type TimeField = typeof timeGroups[number]['fields'][number];
type NumberField = typeof checkInFields[number]['field'] | typeof bookingHorizonField.field;
type SettingsField = TimeField | NumberField;
type SettingsErrors = Partial<Record<SettingsField | 'workingHours', string>>;
type NumberSetting = { field: NumberField; label: string; unit: string; min: number; max?: number; step?: number; required?: boolean };

const settingsFields = new Set<string>([
  ...timeGroups.flatMap(group => group.fields),
  ...checkInFields.map(item => item.field),
  bookingHorizonField.field,
]);

function readSettingsErrors(failure: unknown): SettingsErrors {
  if (!(failure instanceof AdminApiError) || typeof failure.details !== 'object' || failure.details === null) return {};
  const errors: SettingsErrors = {};
  for (const [field, messages] of Object.entries(failure.details)) {
    if (!settingsFields.has(field) || !Array.isArray(messages)) continue;
    const message = messages.find((entry): entry is string => typeof entry === 'string' && Boolean(entry.trim()));
    if (message) errors[field as SettingsField] = message;
  }
  return errors;
}

const errorTextClass = 'mt-1.5 block text-xs leading-5 font-medium text-rose-700';
const invalidInputClass = 'aria-invalid:border-rose-400';

export function FacilityInfoView({ facility, onSave, onSaveFailure, onUploadLogo }: FacilityInfoViewProps) {
  const [draft, setDraft] = useState(facility);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState('');
  const [settingsErrors, setSettingsErrors] = useState<SettingsErrors>({});
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

  function updateSetting<K extends SettingsField>(key: K, value: FacilityInfo[K]) {
    update(key, value);
    setSettingsErrors(current => ({
      ...current,
      [key]: undefined,
      workingHours: typeof value === 'string' ? undefined : current.workingHours,
    }));
  }

  function renderNumberSetting({ field, label, unit, min, max, step, required }: NumberSetting) {
    const fieldError = settingsErrors[field];
    const unitId = `facility-${field}-unit`;
    const hintId = field === 'bookingWeeksAhead' ? ' facility-booking-horizon' : '';
    return (
      <div key={field} className="min-w-0">
        <label htmlFor={`facility-${field}`} className={labelClass}>{label}</label>
        <div className="relative">
          <input id={`facility-${field}`} name={field === 'slotCapacity' || field === 'onlinePercent' ? field : undefined}
            type="number" min={min} max={max} step={step} required={required} value={draft[field]}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={`${unitId}${hintId}${fieldError ? ` facility-${field}-error` : ''}`}
            className={`${inputClass} min-w-0 pr-14 tabular-nums ${invalidInputClass}`}
            onChange={event => updateSetting(field, Number(event.target.value))}
            onInvalid={event => {
              const message = event.currentTarget.validationMessage;
              setSettingsErrors(current => ({ ...current, [field]: message }));
            }} />
          <span id={unitId} className="pointer-events-none absolute right-7 top-1/2 -translate-y-1/2 text-xs text-slate-600">{unit}</span>
        </div>
        {fieldError && <span id={`facility-${field}-error`} className={errorTextClass} role="alert">{fieldError}</span>}
      </div>
    );
  }

  const { slotCapacity, onlinePercent, bookingWeeksAhead } = draft;
  const mapHref = getGoogleMapsSearchHref(draft.address, draft.name);
  const canPreviewAllocation = Number.isInteger(slotCapacity) && slotCapacity >= 1 && slotCapacity <= 50
    && Number.isInteger(onlinePercent) && onlinePercent >= 0 && onlinePercent <= 100;
  const onlineSlots = canPreviewAllocation ? Math.floor((slotCapacity * onlinePercent + 50) / 100) : null;
  const validBookingHorizon = Number.isInteger(bookingWeeksAhead) && bookingWeeksAhead >= 1 && bookingWeeksAhead <= 12;

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
        setSettingsErrors({});
        setSaving(true);
        try {
          const savedFacility = await onSave(draft);
          setDraft(savedFacility);
        } catch (saveError) {
          if (saveError instanceof AdminApiError && saveError.code === 'FACILITY_HOSPITAL_TIME_INVALID') {
            setSettingsErrors({ workingHours: saveError.message });
          } else {
            const fieldErrors = readSettingsErrors(saveError);
            setSettingsErrors(fieldErrors);
            const hasOtherErrors = saveError instanceof AdminApiError && saveError.details !== null
              && typeof saveError.details === 'object' && Object.keys(saveError.details).some(field => !settingsFields.has(field));
            const message = saveError instanceof Error ? saveError.message : 'Không thể lưu thông tin cơ sở.';
            if (hasOtherErrors) {
              setError(message);
            } else if (!Object.keys(fieldErrors).length) {
              onSaveFailure(message);
            }
          }
        } finally {
          setSaving(false);
        }
      }}
    >
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
            <p className="mt-2 text-[11px] leading-5 text-slate-400">Chọn ảnh logo định dạng PNG, dung lượng tối đa 2 MB.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className={labelClass}>Tên cơ sở y tế <span className="text-rose-600">*</span></span>
              <input className={inputClass} maxLength={200} onChange={(event) => update('name', event.target.value)} required value={draft.name} />
            </label>
            <dl className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
              <div className="min-w-0">
                <dt className={labelClass}>Mã cơ sở</dt>
                <dd className="break-words text-sm text-slate-900">{draft.code || 'Chưa cập nhật'}</dd>
              </div>
              <div>
                <dt className={labelClass}>Tuyến cơ sở</dt>
                <dd className="text-sm text-slate-900">{facilityLevelLabels[draft.level] ?? 'Chưa cập nhật'}</dd>
              </div>
            </dl>
            <label>
              <span className={labelClass}>Tỉnh / Thành phố</span>
              <input className={inputClass} maxLength={100} onChange={(event) => update('province', event.target.value)} value={draft.province} />
            </label>
            <div className="sm:col-span-2">
              <label htmlFor="facility-address" className={labelClass}>Địa chỉ <span className="text-rose-600">*</span></label>
              <div className="relative">
                <MapPin aria-hidden="true" className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input id="facility-address" autoComplete="street-address" className={`${inputClass} pl-10`}
                  onChange={(event) => update('address', event.target.value)} placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố"
                  required value={draft.address} />
              </div>
              {mapHref && (
                <a href={mapHref} target="_blank" rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                  Xem trên Google Maps <ExternalLink aria-hidden="true" className="size-3.5" />
                  <span className="sr-only"> (mở tab mới)</span>
                </a>
              )}
            </div>
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
            <p className="mt-0.5 text-xs text-slate-600">Giờ mặc định khi tạo ca và quy tắc đặt khám của cơ sở.</p>
          </div>
        </div>
        <div className="@container p-5 sm:p-6">
          <div className="grid items-start gap-6 @min-[54rem]:grid-cols-[minmax(0,9fr)_minmax(0,11fr)] @min-[54rem]:gap-8">
            <section aria-labelledby="facility-working-days-title" className="space-y-4">
              <h3 id="facility-working-days-title" className="text-base font-bold text-slate-900">Lịch làm việc</h3>
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
              <div className="grid max-w-[25rem] gap-4">
                {timeGroups.map(({ label, fields }) => (
                  <fieldset key={label} className="min-w-0"
                    aria-describedby={settingsErrors.workingHours ? 'facility-working-hours-error' : undefined}>
                    <legend className="mb-2 text-sm font-semibold text-slate-800">{label}</legend>
                    <div className="grid grid-cols-2 gap-3">
                      {fields.map((field, index) => {
                        const fieldError = settingsErrors[field];
                        const description = [
                          fieldError ? `facility-${field}-error` : '',
                          settingsErrors.workingHours ? 'facility-working-hours-error' : '',
                        ].filter(Boolean).join(' ');
                        return (
                          <div key={field} className="min-w-0">
                            <label className={labelClass} htmlFor={`facility-${field}`}>{index === 0 ? 'Bắt đầu' : 'Kết thúc'}</label>
                            <input id={`facility-${field}`} type="time" value={draft[field]}
                              className={`${inputClass} min-w-0 px-2 sm:px-3.5 ${invalidInputClass}`}
                              aria-invalid={fieldError || settingsErrors.workingHours ? true : undefined}
                              aria-describedby={description || undefined}
                              onChange={event => updateSetting(field, event.target.value)} />
                            {fieldError && <span id={`facility-${field}-error`} className={errorTextClass} role="alert">{fieldError}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
              {settingsErrors.workingHours && <p id="facility-working-hours-error" className={errorTextClass} role="alert">{settingsErrors.workingHours}</p>}
            </section>

            <div className="min-w-0 max-w-[45rem] space-y-5">
              <section aria-labelledby="facility-check-in-settings-title" className="space-y-4">
                <h3 id="facility-check-in-settings-title" className="text-base font-bold text-slate-900">Cấu hình khung check-in</h3>
                <div className="grid max-w-56 gap-3 @min-[29rem]:max-w-none @min-[29rem]:grid-cols-3 @min-[29rem]:gap-x-4 @min-[29rem]:gap-y-0 @min-[29rem]:[&>div]:row-span-3 @min-[29rem]:[&>div]:grid @min-[29rem]:[&>div]:grid-rows-subgrid">
                  {checkInFields.map(renderNumberSetting)}
                </div>
                <div className="space-y-2.5 rounded-xl bg-slate-50 px-4 py-3" aria-live="polite">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="text-sm font-semibold text-slate-900">Phân bổ số chỗ mỗi khung</p>
                    {onlineSlots !== null && <p className="text-sm text-slate-600">Tổng <strong className="text-base font-bold tabular-nums text-slate-900">{slotCapacity} chỗ</strong></p>}
                  </div>
                  {onlineSlots !== null ? (
                    <>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm text-slate-700">
                        <p>Đặt online <strong className="text-base font-bold tabular-nums text-blue-800">{onlineSlots} chỗ</strong></p>
                        <p>Số chỗ còn lại <strong className="text-base font-bold tabular-nums text-slate-900">{slotCapacity - onlineSlots} chỗ</strong></p>
                      </div>
                      <div aria-hidden="true" className="h-2 rounded-full bg-slate-300">
                        <div className="h-full rounded-full bg-blue-700" style={{ width: `${(onlineSlots / slotCapacity) * 100}%` }} />
                      </div>
                    </>
                  ) : <p className="text-sm text-slate-600">Nhập sức chứa và tỷ lệ online hợp lệ để xem phân bổ.</p>}
                  <p className="text-xs leading-5 text-slate-600">Phân bổ trên dùng sức chứa mặc định và áp dụng khi tạo khung mới. Thời lượng có thể theo cấu hình riêng của phòng khám dịch vụ.</p>
                </div>
              </section>
              <section aria-labelledby="facility-booking-horizon-title" className="space-y-3">
                <h3 id="facility-booking-horizon-title" className="text-base font-bold text-slate-900">Phạm vi đặt lịch</h3>
                <div className="grid gap-2 @min-[29rem]:grid-cols-[13rem_minmax(0,1fr)] @min-[29rem]:items-start @min-[29rem]:gap-4">
                  <div className="max-w-56">{renderNumberSetting(bookingHorizonField)}</div>
                  <p id="facility-booking-horizon" className="text-sm leading-5 text-slate-600 @min-[29rem]:pt-6">
                    {validBookingHorizon ? <>Bệnh nhân có thể đặt trước tối đa <strong className="font-semibold text-slate-800">{bookingWeeksAhead} tuần</strong> kể từ hôm nay, tùy ca đã mở và số chỗ còn trống.</>
                      : 'Số tuần xác định giới hạn đặt trước. Lịch khả dụng phụ thuộc vào ca đã mở và số chỗ còn trống.'}
                  </p>
                </div>
              </section>
            </div>
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
        <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!dirty || saving} onClick={() => { setDraft(facility); setSettingsErrors({}); }} type="button">
          <RotateCcw className="h-4 w-4" /> Hủy
        </button>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={saving || !dirty} type="submit">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
}
