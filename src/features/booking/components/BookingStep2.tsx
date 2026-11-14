'use client';

import { BookingSearchSelect } from '../workflow/BookingSearchSelect';
import { matchesBookingQuery, matchesHospital } from '../workflow/hospital-search';
import { doctorQualifications, type DoctorQualification } from '../models/doctor-qualification';
import { bookingBackClass, bookingButtonClass, bookingInputClass } from './BhytBookingSteps';

interface BookingStep2Props<H extends string | number, S extends string | number> {
  hospitals: { id: H; name: string; code: string; address?: string }[];
  hospitalId: H | null;
  onSelectHospital: (id: H) => void;
  specialties: { id: S; name: string }[];
  specialtyId: S | null;
  onSelectSpecialty: (id: S) => void;
  specialtiesLoading?: boolean;
  specialtyError?: string;
  patientName?: string;
  qualification?: {
    value: DoctorQualification | null;
    available: boolean;
    onSelect: (value: DoctorQualification | null) => void;
  };
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
}

export function BookingStep2<H extends string | number, S extends string | number>({
  hospitals, hospitalId, onSelectHospital, specialties, specialtyId, onSelectSpecialty,
  specialtiesLoading, specialtyError, patientName, qualification, canContinue, onBack, onContinue,
}: BookingStep2Props<H, S>) {
  const hasHospital = hospitals.some((hospital) => hospital.id === hospitalId);
  const hasSpecialty = specialties.some((specialty) => specialty.id === specialtyId);

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Chọn cơ sở y tế và chuyên khoa</h1>
        {patientName && <p className="mt-2 text-sm text-slate-500">Người khám: {patientName}</p>}
      </div>
      <BookingSearchSelect
        label="Cơ sở y tế"
        options={hospitals}
        selectedId={hospitalId}
        onSelect={onSelectHospital}
        placeholder="Chọn cơ sở y tế"
        searchLabel="Tìm theo tên, địa chỉ hoặc mã cơ sở"
        emptyMessage="Không tìm thấy cơ sở y tế phù hợp."
        disabled={!hospitals.length}
        matchesQuery={matchesHospital}
      />
      {!hospitals.length && <p className="text-sm text-slate-500">Chưa có cơ sở y tế có thể đặt khám.</p>}
      <BookingSearchSelect
        key={hospitalId}
        label="Chuyên khoa"
        options={specialties}
        selectedId={specialtyId}
        onSelect={onSelectSpecialty}
        placeholder={!hasHospital ? 'Vui lòng chọn cơ sở y tế trước' : specialtiesLoading ? 'Đang tải chuyên khoa...' : 'Chọn chuyên khoa'}
        searchLabel="Tìm theo tên chuyên khoa"
        emptyMessage="Không tìm thấy chuyên khoa phù hợp."
        disabled={!hasHospital || specialtiesLoading || !specialties.length}
        matchesQuery={(option, query) => matchesBookingQuery(option.name, query)}
      />
      {specialtyError && <p role="alert" className="text-sm text-rose-700">{specialtyError}</p>}
      {hasHospital && !specialtiesLoading && !specialtyError && !specialties.some((item) => item.id !== 'unknown') && (
        <p role="status" className="text-sm text-slate-500">Cơ sở chưa có chuyên khoa mở đặt khám.</p>
      )}
      {qualification ? (
        <>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">Trình độ bác sĩ</span>
            <select
              className={bookingInputClass}
              value={qualification.value ?? ''}
              disabled={!hasSpecialty}
              onChange={(event) => {
                const value = event.target.value;
                if (value === '') qualification.onSelect(null);
                else if (value === 'MASTER' || value === 'CK1' || value === 'CK2') qualification.onSelect(value);
              }}
            >
              <option value="">Tất cả trình độ</option>
              {Object.entries(doctorQualifications).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          {hasSpecialty && qualification.value && !qualification.available && (
            <p role="status" className="text-sm text-slate-500">Chuyên khoa tại cơ sở này chưa có lịch cho trình độ đã chọn.</p>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-500">
          Nếu chưa rõ chuyên khoa cần khám, vui lòng chọn <strong className="font-semibold text-slate-700">“Không rõ”</strong>.
          Sau khi bạn đặt lịch thành công, nhân viên sẽ căn cứ vào triệu chứng bạn mô tả để sắp xếp chuyên khoa phù hợp và thông báo lại với bạn.
        </p>
      )}
      <div className="flex justify-between gap-3">
        <button className={bookingBackClass} onClick={onBack} type="button">Quay lại</button>
        <button className={bookingButtonClass} disabled={!canContinue} onClick={onContinue} type="button">Tiếp tục</button>
      </div>
    </section>
  );
}
