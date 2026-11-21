'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ReceptionDialog } from '@/src/features/reception/components/ReceptionDialog';
import { ShieldAlert } from 'lucide-react';
import { useDoctorAccess } from '@/src/features/doctor-queue/hooks/use-doctor-access';
import { DOCTOR_DEMO_ENABLED } from '@/src/features/doctor-queue/data/doctor-queue-demo';
import { EMERGENCY_PATIENTS, R8_RECEPTIONIST, setEmergencyActivation } from './emergency-demo';
import { useEmergencyDemo } from './use-emergency-demo';
export function ReceptionEmergencyAction({ patientId }: { patientId: string }) {
  const auth = useDoctorAccess(); const state = useEmergencyDemo(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [review,setReview]=useState(false);
  if (!DOCTOR_DEMO_ENABLED || auth.loading || auth.session && !auth.session.roles.some(r => r === 'RECEPTIONIST' || r === 'RECEPTION') || !EMERGENCY_PATIENTS.some(p => p.id === patientId)) return null;
  const grant = state?.grants.find(g => g.patientId === patientId && !g.closedAt);
  async function change() { setBusy(true); setError(''); try { await setEmergencyActivation(R8_RECEPTIONIST, patientId, !grant); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể cập nhật R8.'); } finally { setReview(false); setBusy(false); } }
  return <section className="rounded-xl border border-rose-200 bg-rose-50 p-4"><h3 className="flex items-center gap-2 text-sm font-bold text-rose-800"><ShieldAlert className="size-4" />Hồ sơ cấp cứu</h3><p className="mt-2 text-xs leading-6 text-rose-900/80">{grant ? 'Đã mở quyền cho bác sĩ khoa cấp cứu tại cơ sở.' : 'Kích hoạt khi tiếp nhận bệnh nhân cấp cứu. Quyền chỉ dành cho bác sĩ khoa cấp cứu.'}</p><p className="mt-1 text-[10px] text-slate-500">Mô phỏng lễ tân · Chưa kết nối phân quyền backend.</p><button type="button" disabled={busy || !state} onClick={() => setReview(true)} className="mt-3 rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs font-bold text-rose-800 disabled:opacity-50">{busy ? 'Đang cập nhật…' : grant ? 'Đóng quyền R8' : 'Kích hoạt'}</button>{grant && <Link className="ml-3 underline" href={`/doctor/emergency?demo=1&patient=${patientId}`}>Mở màn bác sĩ cấp cứu</Link>}{review && <ReceptionDialog title={grant ? "Đóng quyền cấp cứu?" : "Kích hoạt cấp cứu?"} onClose={()=>setReview(false)}><p>{EMERGENCY_PATIENTS.find(p=>p.id===patientId)?.name} · {grant ? "Ngừng quyền xem bệnh sử." : "Mở quyền xem hồ sơ và tiền sử dị ứng cho bác sĩ khoa cấp cứu."} Thao tác được ghi nhật ký.</p><button type="button" className="mt-4 rounded bg-rose-700 px-4 py-2 text-white" disabled={busy} onClick={change}>Xác nhận</button></ReceptionDialog>}{(!state || error) && <p role="alert" className="mt-2 text-xs text-rose-700">{error || 'Không đọc được dữ liệu R8.'}</p>}</section>;
}
