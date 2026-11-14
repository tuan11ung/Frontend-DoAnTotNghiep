'use client';
import { DoctorPublicLive } from '../public-data/PublicEntityDetails';
export interface DoctorDetailPageProps { doctorId:string }
export function DoctorDetailPage({doctorId}:DoctorDetailPageProps){return <DoctorPublicLive key={doctorId} doctorId={doctorId}/>;}
