import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
class ApiError extends Error { constructor(status){super('API '+status);this.status=status;} }
let wrongOrder=false, deniedPrescription=false, cancelled=false;
const detail={encounterId:1,patientId:12,encounterCode:'QA1',hospitalName:'QA',appointmentDate:'2026-11-16',status:'COMPLETED',diagnoses:[{id:9,diagnosisText:'QA',primary:true}]};
const order={id:31,encounterId:1,patientId:12,status:'COMPLETED',serviceName:'QA Lab',serviceCode:'QA',orderedDate:'2026-11-16T08:00:00+07:00'};
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file);
 const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const mod={exports:{}};
 function dependency(id){
   if(id==='@/src/shared/lib/clinical-api')return {ClinicalApiError:ApiError,clinicalRequest:async()=>{throw new ApiError(deniedPrescription?403:404);}};
   if(id==='../api/consultation-api')return {consultationApi:{
     patient:async()=>({id:12,fullName:'QA Patient',dob:'1998-05-16',maskedNationalId:'079******106'}),
     orders:async()=>[{...order,status:cancelled?'CANCELLED':order.status,patientId:wrongOrder?99:12}],
     order:async()=>({order,values:[],media:[],findings:'QA finding'}),
   }};
   if(id.startsWith('@/'))return load(id.slice(2)+'.ts');
   throw Error('Unexpected dependency: '+id);
 }
 new Function('require','module','exports',code)(dependency,mod,mod.exports);cache.set(file,mod.exports);return mod.exports;
}
const mapper=load('src/features/patient-results/api/encounter-mapper.ts');
assert.equal(mapper.resultEncounter(detail).visitDate,'2026-11-16');
assert.equal(mapper.resultRecord(detail).diagnoses[0].code,''); // Never present a database ID as ICD.
assert.equal(mapper.resultRecord(detail).advice,undefined);
assert.equal(mapper.resultRecord(detail).followUp,undefined);
const {loadPastEncounter}=load('src/features/doctor-consultation/past-encounter/load-past-encounter.ts');
const signal=new AbortController().signal;
const result=await loadPastEncounter(detail,signal);
assert.deepEqual(result.encounter.record,mapper.resultRecord(detail));
assert.equal(result.patient.nationalId,'079******106');
assert.equal(result.encounter.services[0].report.description,'QA finding');
wrongOrder=true;await assert.rejects(loadPastEncounter(detail,signal),/không thuộc/);wrongOrder=false;
cancelled=true;assert.equal((await loadPastEncounter(detail,signal)).encounter.services.length,0);cancelled=false;
deniedPrescription=true;await assert.rejects(loadPastEncounter(detail,signal),e=>e.status===403);
console.log('PASS shared encounter adapter: clinical fields, masked identity, scoped CLS, cancelled services, prescription 404 vs 403');
