'use client';
import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useDoctorAccess } from '@/src/features/doctor-queue/hooks/use-doctor-access';
import { DOCTOR_DEMO_ENABLED } from '@/src/features/doctor-queue/data/doctor-queue-demo';
import { EMERGENCY_PATIENTS, R8_RECEPTIONIST, setEmergencyActivation } from './emergency-demo';
import { useEmergencyDemo } from './use-emergency-demo';
export function ReceptionEmergencyAction({ patientId }: { patientId: string }) {
  const auth = useDoctorAccess(); const state = useEmergencyDemo(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  if (!DOCTOR_DEMO_ENABLED || auth.loading || auth.session && !auth.session.roles.some(r => r === 'RECEPTIONIST' || r === 'RECEPTION') || !EMERGENCY_PATIENTS.some(p => p.id === patientId)) return null;
  const grant = state?.grants.find(g => g.patientId === patientId && !g.closedAt);
  async function change() { setBusy(true); setError(''); try { await setEmergencyActivation(R8_RECEPTIONIST, patientId, !grant); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể cập nhật R8.'); } finally { setBusy(false); } }
  return <section className="rounded-xl border border-rose-200 bg-rose-50 p-4"><h3 className="flex items-center gap-2 text-sm font-bold text-rose-800"><ShieldAlert className="size-4" />R8 · Hồ sơ cấp cứu</h3><p className="mt-2 text-xs leading-6 text-rose-900/80">{grant ? 'Đã mở quyền cho bác sĩ khoa cấp cứu tại cơ sở.' : 'Kích hoạt khi tiếp nhận bệnh nhân cấp cứu. Quyền chỉ dành cho bác sĩ khoa cấp cứu.'}</p><p className="mt-1 text-[10px] text-slate-500">Mô phỏng lễ tân · Chưa kết nối phân quyền backend.</p><button type="button" disabled={busy || !state} onClick={() => void change()} className="mt-3 rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs font-bold text-rose-800 disabled:opacity-50">{busy ? 'Đang cập nhật…' : grant ? 'Đóng quyền R8' : 'Kích hoạt R8'}</button>{(!state || error) && <p role="alert" className="mt-2 text-xs text-rose-700">{error || 'Không đọc được dữ liệu R8.'}</p>}</section>;
}
