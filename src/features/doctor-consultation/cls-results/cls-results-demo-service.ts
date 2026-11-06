import { readMockClinicalData, updateMockClinicalData } from '@/src/features/doctor-queue/api/doctor-queue-demo-store';
import type { DoctorQueueSnapshot } from '@/src/features/doctor-queue/doctor-queue.types';
import type { ClinicalScope } from '../api/clinical-demo-service';
import { clsCatalogForFacility } from '../cls-orders/cls-catalog-demo';
import type { ClsOrder } from '../cls-orders/cls-orders.types';
import { CLS_RESULT_IMAGE_PATHS, isImagingService, validateClsActionReason, type ClsReport, type ClsResultRow } from './cls-results.types';

function scopedLine(snapshot: DoctorQueueSnapshot, scope: ClinicalScope, orderId: string, serviceId: string) {
  const order = snapshot.clsOrders?.[scope.patientId]?.find(item => item.id === orderId && item.assignmentId === scope.assignmentId && item.doctorId === scope.actor.doctorId && item.hospitalId === scope.actor.hospitalId);
  const line = order?.lines.find(item => item.serviceId === serviceId);
  const service = clsCatalogForFacility(scope.actor.hospitalId).find(item => item.id === serviceId);
  if (!order || !line || !service) throw new Error('Không tìm thấy dịch vụ trong chỉ định của lượt khám này.');
  return { order, line, service };
}

export function loadMockClsResults(scope: ClinicalScope, viewId: string, signal?: AbortSignal) {
  return readMockClinicalData(scope.actor, scope.assignmentId, scope.patientId, { resource: 'CLS_RESULTS', viewId }, (_access, snapshot) => {
    const catalog = clsCatalogForFacility(scope.actor.hospitalId);
    const rows: ClsResultRow[] = (snapshot.clsOrders?.[scope.patientId] ?? []).filter(order => order.assignmentId === scope.assignmentId && order.doctorId === scope.actor.doctorId && order.hospitalId === scope.actor.hospitalId).flatMap(order => order.lines.flatMap(line => {
      const service = catalog.find(item => item.id === line.serviceId);
      return service ? [{ orderId: order.id, serviceId: line.serviceId, orderCode: `CD-${order.id.slice(0, 8).toUpperCase()}`, orderedAt: order.createdAt, service, status: line.status, hasReport: Boolean(line.result), cancellation: line.cancellation, retakeRequests: line.retakeRequests ?? [] }] : [];
    }));
    return rows;
  }, signal);
}
export function loadMockClsReport(scope: ClinicalScope, orderId: string, serviceId: string, viewId: string, signal?: AbortSignal) {
  return readMockClinicalData(scope.actor, scope.assignmentId, scope.patientId, { resource: 'CLS_RESULT_DETAIL', targetId: `${orderId}:${serviceId}`, viewId }, (_access, snapshot) => {
    const { line } = scopedLine(snapshot, scope, orderId, serviceId);
    if (line.status !== 'COMPLETED' || !line.result) throw new Error('Dịch vụ chưa có báo cáo kết quả được công bố.');
    return line.result;
  }, signal);
}
export function loadMockClsImage(scope: ClinicalScope, orderId: string, serviceId: string, imageId: string, viewId: string, signal?: AbortSignal) {
  return readMockClinicalData(scope.actor, scope.assignmentId, scope.patientId, { resource: 'CLS_RESULT_IMAGE', targetId: `${orderId}:${serviceId}:${imageId}`, viewId }, (_access, snapshot) => {
    const { line } = scopedLine(snapshot, scope, orderId, serviceId);
    const image = line.status === 'COMPLETED' ? line.result?.images.find(item => item.id === imageId) : null;
    if (!image) throw new Error('Ảnh kết quả không thuộc dịch vụ này hoặc chưa được công bố.');
    return image;
  }, signal);
}

export function changeMockClsLine(scope: ClinicalScope, orderId: string, serviceId: string, action: 'CANCEL' | 'RETAKE', reason: string, requestId: string) {
  return updateMockClinicalData(scope.actor, scope.assignmentId, scope.patientId, (access, snapshot) => {
    const error = validateClsActionReason(reason, action);
    if (error || !/^[a-zA-Z0-9-]{1,100}$/.test(requestId) || !['CANCEL', 'RETAKE'].includes(action)) throw new Error(error || 'Yêu cầu thao tác không hợp lệ.');
    const { order, line, service } = scopedLine(snapshot, scope, orderId, serviceId);
    const prior = line.cancellation?.requestId === requestId ? { kind: 'CANCEL', value: line.cancellation } : line.retakeRequests?.find(item => item.requestId === requestId) ? { kind: 'RETAKE', value: line.retakeRequests.find(item => item.requestId === requestId)! } : null;
    if (prior) {
      if (prior.kind !== action || prior.value.reason !== reason.trim()) throw new Error('Mã thao tác không khớp với nội dung đã gửi.');
      return;
    }
    const reused = Object.values(snapshot.clsOrders ?? {}).flat().some(item => item.requestId === requestId || item.lines.some(value => value.cancellation?.requestId === requestId || value.retakeRequests?.some(request => request.requestId === requestId)));
    if (reused) throw new Error('Mã thao tác đã được dùng cho chỉ định khác.');
    if (order.grantId !== access.grant.id) throw new Error('Chỉ định không thuộc quyền điều trị đang mở.');
    const metadata = { requestId, reason: reason.trim(), occurredAt: new Date().toISOString(), doctorId: access.grant.doctorId, grantId: access.grant.id };
    if (action === 'CANCEL') {
      if (line.status !== 'NOT_STARTED') throw new Error('Chỉ hủy được dịch vụ chưa thực hiện. Trạng thái có thể đã thay đổi ở tab khác.');
      line.status = 'CANCELLED'; line.cancellation = metadata;
    } else {
      if (line.status !== 'COMPLETED' || !line.result?.images.length || !isImagingService(service)) throw new Error('Chỉ yêu cầu chụp lại cho dịch vụ hình ảnh đã có kết quả.');
      if (line.retakeRequests?.some(request => request.status === 'REQUESTED')) throw new Error('Dịch vụ đã có yêu cầu chụp lại đang chờ xử lý.');
      line.retakeRequests = [{ ...metadata, id: crypto.randomUUID(), status: 'REQUESTED' }];
    }
  });
}

export function simulateMockClsResults(scope: ClinicalScope) {
  return updateMockClinicalData(scope.actor, scope.assignmentId, scope.patientId, (access, snapshot) => {
    let orders = snapshot.clsOrders?.[scope.patientId] ?? [];
    if (orders.length === 0) {
      const ids = ['cbc', 'xray-chest', 'ultrasound-abdomen', 'ecg'];
      const order: ClsOrder = { id: crypto.randomUUID(), requestId: crypto.randomUUID(), serviceIds: ids, reason: 'Bộ chỉ định mẫu để thử màn Kết quả CLS', safetyFlags: [], patientId: scope.patientId, assignmentId: scope.assignmentId, doctorId: access.grant.doctorId, hospitalId: access.assignment.hospitalId, grantId: access.grant.id, createdAt: new Date().toISOString(), lines: ids.map(serviceId => ({ serviceId, status: 'NOT_STARTED' })) };
      orders = [order]; snapshot.clsOrders = { ...snapshot.clsOrders, [scope.patientId]: orders };
    }
    const catalog = clsCatalogForFacility(access.assignment.hospitalId);
    for (const order of orders) {
      if (order.grantId !== access.grant.id) continue;
      for (const line of order.lines) {
        if (line.status === 'COMPLETED' || line.status === 'CANCELLED' || line.serviceId === 'ecg') continue;
        if (line.serviceId === 'ultrasound-abdomen') { line.status = 'PROCESSING'; continue; }
        const service = catalog.find(item => item.id === line.serviceId);
        if (!service) continue;
        const report: ClsReport = { id: crypto.randomUUID(), description: `Mô tả mẫu cho dịch vụ ${service.name}. Nội dung này chỉ minh họa cách hiển thị báo cáo, không phải kết quả khám thực tế.`, conclusion: 'Kết luận mô phỏng để kiểm thử giao diện. Không dùng nội dung này để đánh giá sức khỏe hoặc đưa ra quyết định điều trị.', issuedAt: new Date().toISOString(), images: isImagingService(service) ? CLS_RESULT_IMAGE_PATHS.map((src, index) => ({ id: `view-${index + 1}`, src, title: `Ảnh minh họa ${index + 1}` })) : [] };
        line.status = 'COMPLETED'; line.result = report;
      }
    }
  });
}
