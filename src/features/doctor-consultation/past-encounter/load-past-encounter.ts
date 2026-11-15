import { clinicalRequest, ClinicalApiError } from '@/src/shared/lib/clinical-api';
import { consultationApi, type EncounterDetail } from '../api/consultation-api';
import { resultEncounter, resultRecord, resultPrescription, type ResultPrescription } from '@/src/features/patient-results/api/encounter-mapper';
import { resultService } from '@/src/features/patient-results/api/result-service';
import type { ResultPatient } from '@/src/features/patient-results/models/types/patient-results.types';

export async function loadPastEncounter(detail:EncounterDetail, signal:AbortSignal) {
  const [profile,orders]=await Promise.all([
    consultationApi.patient(detail.patientId,signal),
    consultationApi.orders(detail.encounterId,signal,detail.patientId),
  ]);
  if(profile.id!==detail.patientId)throw Error('Hồ sơ không thuộc bệnh nhân đang xem.');
  const encounter=resultEncounter(detail);
  encounter.record=resultRecord(detail);
  const active=orders.filter(o=>o.status!=='CANCELLED');
  if(active.some(o=>o.encounterId!==detail.encounterId || o.patientId!==detail.patientId))throw Error('Chỉ định không thuộc phiên khám đang xem.');
  for(let offset=0;offset<active.length;offset+=5){
    const services=await Promise.all(active.slice(offset,offset+5).map(async order=>{
      if(order.status!=='COMPLETED')return resultService(order);
      const report=await consultationApi.order(order.id,signal);
      if(report.order.id!==order.id || report.order.encounterId!==detail.encounterId || report.order.patientId!==detail.patientId)throw Error('Phiếu không thuộc phiên khám đang xem.');
      return resultService(order,report);
    }));
    encounter.services.push(...services);
  }
  try {
    const prescription=await clinicalRequest<ResultPrescription>('prescriptions/detail',{encounterId:detail.encounterId},signal);
    encounter.record.prescriptions=resultPrescription(prescription);
  }catch(e){if(!(e instanceof ClinicalApiError) || e.status!==404)throw e;}
  const patient:ResultPatient={id:String(profile.id),name:profile.fullName,relationship:'Người bệnh đang điều trị',nationalId:profile.maskedNationalId,initials:profile.fullName.split(/\s+/).slice(-2).map(w=>w[0]).join(''),birthYear:Number(profile.dob?.slice(0,4) || 0),birthDate:profile.dob,gender:profile.gender==='MALE'?'Nam':profile.gender==='FEMALE'?'Nữ':'Khác'};
  return {encounter,patient};
}
