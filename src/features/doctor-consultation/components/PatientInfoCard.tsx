import { businessNow } from '@/src/shared/lib/business-time';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import type { ClinicalPatient } from '../api/consultation-api';

function ageOf(dob: string) {
  const d = new Date(dob); if (Number.isNaN(+d)) return null;
  const n = businessNow(); let a = n.getFullYear() - d.getFullYear();
  if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--;
  return a >= 0 ? a : null;
}

export function PatientInfoCard({ patient }: { patient: ClinicalPatient }) {
  const age = ageOf(patient.dob);
  const gender = patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : 'Khác';
  const fields: [string, string | undefined][] = [
    ['Họ tên', patient.fullName],
    ['Ngày sinh', patient.dob ? `${formatDisplayDate(patient.dob)}${age != null ? ` (${age} tuổi)` : ''}` : undefined],
    ['Giới tính', gender],
    ['CCCD / Căn cước', patient.maskedNationalId],
    ['Số điện thoại', patient.maskedPhone],
    ['Số thẻ BHYT', patient.insuranceNo],
    ['Địa chỉ', patient.address],
  ];
  return (
    <section aria-label="Thông tin bệnh nhân" className="min-w-0 space-y-4 py-5 first:pt-0 last:pb-0">
      <header>
        <h2 className="text-lg font-bold">Thông tin bệnh nhân</h2>
      </header>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className={`mt-1 break-words leading-6 ${value ? 'font-semibold text-slate-900' : 'text-slate-400'}`}>{value || 'Chưa cập nhật'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
