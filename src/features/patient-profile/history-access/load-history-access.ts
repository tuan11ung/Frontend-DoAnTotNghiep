import { accountRequest } from '../profile-api';

export interface Grant { encounterId: number; encounterCode: string; status: string; openedAt: string; closedAt?: string; doctorName: string; hospitalName: string; revoked: boolean }
export interface View { id: number; viewedAt: string; doctorName: string; hospitalName: string; encounterCode: string; resource: string; eventType: string }
export interface Access { grants: Grant[]; logs: View[] }

/** The current endpoint returns fixed batches of 20 without a total. */
export async function loadHistoryAccess(patientId: number, token: string, signal: AbortSignal): Promise<Access> {
  const grants = new Map<number, Grant>();
  const logs = new Map<number, View>();
  for (let page = 0; page <= 10000; page++) {
    signal.throwIfAborted();
    const batch = await accountRequest('history-access/list', token, { patientId, page }, signal) as Access & { page: number };
    signal.throwIfAborted();
    if (!batch || batch.page !== page || !Array.isArray(batch.grants) || !Array.isArray(batch.logs)) throw new Error('Dữ liệu nhật ký không hợp lệ. Vui lòng tải lại.');
    batch.grants.forEach(grant => grants.set(grant.encounterId, grant));
    batch.logs.forEach(log => logs.set(log.id, log));
    if (batch.grants.length < 20 && batch.logs.length < 20) return { grants: [...grants.values()], logs: [...logs.values()] };
  }
  throw new Error('Nhật ký quá lớn để tải đầy đủ. Vui lòng liên hệ cơ sở y tế.');
}
