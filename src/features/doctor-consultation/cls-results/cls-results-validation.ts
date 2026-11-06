import type { ClsCatalogService } from '../cls-orders/cls-orders.types';
import { CLS_RESULT_IMAGE_PATHS, isImagingService } from './cls-results.types';

function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
const text = (value: unknown, max: number): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value));
export function validClsLineDetails(line: Record<string, unknown>, grantId: string, doctorId: string, service: ClsCatalogService) {
  const action = (value: unknown, required: boolean): value is Record<string, unknown> => object(value)
    && text(value.requestId, 100) && typeof value.reason === 'string' && value.reason.length <= 1000 && (!required || value.reason.trim().length > 0)
    && date(value.occurredAt) && value.grantId === grantId && value.doctorId === doctorId;
  if (line.status === 'CANCELLED' ? !action(line.cancellation, true) : line.cancellation !== undefined) return false;
  if (line.result !== undefined) {
    const report = line.result;
    if (line.status !== 'COMPLETED' || !object(report) || !text(report.id, 100) || !text(report.description, 5000) || !text(report.conclusion, 3000) || !date(report.issuedAt) || !Array.isArray(report.images) || report.images.length > 10) return false;
    if (!report.images.every((image: unknown) => object(image) && text(image.id, 100) && text(image.title, 200) && CLS_RESULT_IMAGE_PATHS.some(src => src === image.src)) || new Set(report.images.map(image => image.id)).size !== report.images.length || report.images.length > 0 && !isImagingService(service)) return false;
  }
  if (line.retakeRequests !== undefined) {
    if (line.status !== 'COMPLETED' || !isImagingService(service) || !object(line.result) || !Array.isArray(line.result.images) || !line.result.images.length || !Array.isArray(line.retakeRequests)) return false;
    if (!line.retakeRequests.every((request: unknown) => action(request, false) && text(request.id, 100) && request.status === 'REQUESTED') || line.retakeRequests.length > 1) return false;
  }
  return true;
}
