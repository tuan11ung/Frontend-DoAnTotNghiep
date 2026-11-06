import { readMockClinicalData, updateMockClinicalData } from '@/src/features/doctor-queue/api/doctor-queue-demo-store';
import type { ClinicalScope } from '../api/clinical-demo-service';
import { clsCatalogForFacility } from './cls-catalog-demo';
import { validateClsDraft, type ClsDraft, type ClsOrder } from './cls-orders.types';

export function loadMockClsOrders(scope: ClinicalScope, viewId: string, signal?: AbortSignal) {
  return readMockClinicalData(scope.actor, scope.assignmentId, scope.patientId, { resource: 'CLS_ORDERS', viewId }, (access, snapshot) => ({
    catalog: clsCatalogForFacility(access.assignment.hospitalId),
    facility: access.assignment.facility,
    orders: snapshot.clsOrders?.[scope.patientId] ?? [],
  }), signal);
}

export function confirmMockClsOrder(scope: ClinicalScope, draft: ClsDraft, requestId: string): Promise<ClsOrder> {
  // Capture this submission before waiting on the shared encounter lock.
  const input = structuredClone(draft);
  return updateMockClinicalData(scope.actor, scope.assignmentId, scope.patientId, (access, snapshot) => {
    if (!/^[a-zA-Z0-9-]{1,100}$/.test(requestId) || Object.keys(validateClsDraft(input)).length) throw new Error('Vui lòng kiểm tra dịch vụ, lý do chỉ định và cờ an toàn.');
    const orders = snapshot.clsOrders?.[scope.patientId] ?? [];
    const previous = Object.values(snapshot.clsOrders ?? {}).flat().find(order => order.requestId === requestId);
    if (previous) {
      if (previous.grantId !== access.grant.id || JSON.stringify(previous.serviceIds) !== JSON.stringify(input.serviceIds) || previous.reason !== input.reason.trim() || JSON.stringify(previous.safetyFlags) !== JSON.stringify(input.safetyFlags)) throw new Error('Lượt xác nhận không khớp với nội dung đã gửi.');
      return previous;
    }
    const catalog = clsCatalogForFacility(access.assignment.hospitalId);
    if (input.serviceIds.some(id => !catalog.some(service => service.id === id && service.available))) throw new Error('Có dịch vụ không thuộc cơ sở này hoặc đang tạm ngưng. Hãy chọn lại từ danh mục.');
    const activeIds = new Set(orders.flatMap(order => order.lines.filter(line => line.status === 'NOT_STARTED' || line.status === 'PROCESSING').map(line => line.serviceId)));
    if (input.serviceIds.some(id => activeIds.has(id))) throw new Error('Có dịch vụ đã được chỉ định và chưa hoàn tất, có thể từ tab khác. Hãy cập nhật danh sách phiếu và bỏ dịch vụ trùng.');
    const order: ClsOrder = {
      ...input, reason: input.reason.trim(), id: crypto.randomUUID(), requestId,
      patientId: access.patient.id, assignmentId: access.assignment.id, doctorId: access.grant.doctorId,
      hospitalId: access.assignment.hospitalId, grantId: access.grant.id, createdAt: new Date().toISOString(),
      lines: input.serviceIds.map(serviceId => ({ serviceId, status: 'NOT_STARTED' })),
    };
    snapshot.clsOrders = { ...snapshot.clsOrders, [scope.patientId]: [...orders, order] };
    return order;
  });
}
