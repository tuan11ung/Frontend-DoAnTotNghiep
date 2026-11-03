import { UserRound } from 'lucide-react';
import type { ReceptionPatient } from '../models/reception.types';
import { maskNationalId, maskPhone, patientGender, receptionDate } from '../utils/reception-format';

export function PatientSummary({ patient }: { patient: ReceptionPatient }) {
  return <section aria-label="Thông tin bệnh nhân" className="rounded-xl border border-blue-100 bg-blue-50/40 p-4"><div className="mb-4 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-white text-blue-600 ring-1 ring-blue-100"><UserRound className="size-5" /></span><div><h3 className="text-base font-extrabold text-slate-900">{patient.name}</h3><p className="mt-1 text-xs text-blue-600">{patient.code} · {patientGender(patient)} · {receptionDate(patient.dob)}</p></div></div><dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">{[
    ['CCCD', maskNationalId(patient.nationalId)], ['Điện thoại', maskPhone(patient.phone)], ['Mã BHYT', patient.insuranceNumber || 'Không có'], ['Địa chỉ', patient.address],
  ].map(([label, value]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="mt-1 leading-relaxed font-semibold break-words text-slate-700">{value}</dd></div>)}</dl></section>;
}
