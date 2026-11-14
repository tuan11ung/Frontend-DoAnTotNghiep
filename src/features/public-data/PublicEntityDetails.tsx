'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Stethoscope } from 'lucide-react';
import { HospitalDetailPage } from '../hospital-detail/HospitalDetailPage';
import type { PublicHospitalProfile } from '../hospital-detail/models/types/public-hospital.types';
import { publicHospital, publicRequest, type PublicDoctor } from './public-api';

export function HospitalPublicLive({ id }: { id: string }) {
  const [data, setData] = useState<PublicHospitalProfile | null>(null); const [error, setError] = useState(''); const [revision, setRevision] = useState(0);
  useEffect(() => { const controller = new AbortController(); publicHospital(Number(id), controller.signal).then(h => { if (!controller.signal.aborted) { setData(h); setError(''); } }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải bệnh viện.'); }); return () => controller.abort(); }, [id, revision]);
  if (error) return <div className="space-y-4 p-8"><p role="alert" className="text-rose-700">{error}</p><button type="button" className="font-bold text-blue-700" onClick={() => setRevision(v => v + 1)}>Thử lại</button><Link href="/hospitals" className="ml-5 text-blue-700">Danh sách bệnh viện</Link></div>;
  if (!data) return <p role="status" className="p-8">Đang tải thông tin bệnh viện…</p>;
  return <HospitalDetailPage key={data.id} hospital={data} />;
}
export function DoctorPublicLive({ doctorId }: { doctorId: string }) {
  const [doctor, setDoctor] = useState<PublicDoctor | null>(null); const [error, setError] = useState(''); const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    if (!/^\d+$/.test(doctorId) || Number(doctorId) <= 0) { Promise.resolve().then(() => { if (!controller.signal.aborted) setError('Vui lòng chọn bác sĩ từ danh sách hiện tại.'); }); return () => controller.abort(); }
    publicRequest<PublicDoctor>('directory/doctors/detail', { id: Number(doctorId) }, controller.signal).then(d => { if (!controller.signal.aborted) { setDoctor(d); setError(''); } }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải bác sĩ.'); });
    return () => controller.abort();
  }, [doctorId, revision]);
  return <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8"><Link href="/search?type=doctors" className="text-sm font-bold text-blue-700">← Danh sách bác sĩ</Link>{error ? <div role="alert" className="space-y-4 rounded-xl bg-rose-50 p-5 text-rose-700"><p>{error}</p><button type="button" onClick={() => setRevision(v => v + 1)}>Thử lại</button></div> : !doctor ? <p role="status">Đang tải hồ sơ bác sĩ…</p> : <><section className="space-y-5 rounded-2xl border bg-white p-6 sm:p-8"><Stethoscope className="size-12 text-blue-600"/><h1 className="text-2xl font-extrabold">{doctor.name}</h1><dl className="grid gap-5 text-sm sm:grid-cols-2">{[['Trình độ', doctor.qualification || 'Bác sĩ'], ['Chuyên khoa', doctor.specialtyName || 'Chưa cập nhật'], ['Cơ sở', doctor.hospitalName], ['Địa chỉ', doctor.address || 'Chưa cập nhật']].map(([label, value]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-bold">{value}</dd></div>)}</dl><Link href={`/hospitals/${doctor.hospitalId}`} className="inline-block text-sm font-bold text-blue-700">Xem thông tin cơ sở →</Link></section><section className="space-y-4 rounded-2xl border bg-blue-50 p-6"><h2 className="text-xl font-bold">Đặt khám với bác sĩ</h2><p className="text-sm leading-7 text-slate-600">Chọn hồ sơ người khám và ngày khám để xem khung giờ còn chỗ, phòng khám và phí tương ứng.</p><Link href={`/booking?mode=service&hospitalId=${doctor.hospitalId}&doctorId=${doctor.id}${doctor.specialtyId ? `&specialtyId=${doctor.specialtyId}` : ''}`} className="inline-flex rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white">Chọn lịch khám dịch vụ</Link></section></>}</div>;
}
