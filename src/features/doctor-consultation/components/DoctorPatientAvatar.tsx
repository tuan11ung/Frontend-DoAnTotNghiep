'use client';
import { useState } from 'react';
import Image from 'next/image';
import type { DoctorQueuePatient } from '@/src/features/doctor-queue/doctor-queue.types';
export function DoctorPatientAvatar({ patient, large = false }: { patient: DoctorQueuePatient; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const initials = patient.fullName.trim().split(/\s+/).slice(-2).map(w => w[0]).join('');
  return <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 font-bold text-slate-500 ${large ? 'size-20 text-xl' : 'size-11 text-xs'}`}>
    {patient.photo && !failed ? <Image src={patient.photo} width={large ? 80 : 44} height={large ? 80 : 44} alt={`Ảnh minh họa ${patient.fullName}`} onError={() => setFailed(true)} className="size-full object-cover" /> : <span aria-label={`Ảnh đại diện viết tắt của ${patient.fullName}`}>{initials}</span>}
  </span>;
}
