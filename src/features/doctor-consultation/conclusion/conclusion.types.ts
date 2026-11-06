export interface DemoDiagnosis { code: string; name: string }
export interface DemoMedication { id: string; name: string; unit: string; route: string; hospitalId: string; allergyKeys: string[]; available: boolean }
export interface PrescriptionLine { id: string; medicationId: string; dose: string; frequency: string; days: string; quantity: string; instructions: string }
export interface ConclusionValues {
  diagnosisCodes: string[]; prescription: PrescriptionLine[]; noMedication: boolean;
  advice: string; followUp: { enabled: boolean; date: string; note: string };
}
export interface ConclusionRecord {
  values: ConclusionValues; revision: number; updatedAt: string; updatedBy: string; grantId: string;
  completedAt: string | null; completionRequestId?: string;
}
export function emptyConclusion(): ConclusionValues { return { diagnosisCodes: [], prescription: [], noMedication: false, advice: '', followUp: { enabled: false, date: '', note: '' } }; }
export function vietnamToday() {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)!.value).join('-');
}
