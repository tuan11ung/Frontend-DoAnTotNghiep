import type { TechnicianOrderDetail, TechnicianResultSave } from './technician-api.types';

export interface TechnicianResultDraft { findings: string; conclusion: string }
export function createTechnicianDraft(detail: TechnicianOrderDetail): TechnicianResultDraft {
  return { findings: detail.findings ?? '', conclusion: detail.conclusion ?? '' };
}
export function buildTechnicianResult(detail: TechnicianOrderDetail, draft: TechnicianResultDraft): TechnicianResultSave {
  const findings = draft.findings.trim(), conclusion = draft.conclusion.trim();
  if (!findings && !conclusion && !detail.media.some(media => media.available !== false)) throw new Error('Vui lòng tải ảnh/PDF hoặc nhập nhận xét kết quả trước khi lưu.');
  return { orderedServiceId: detail.order.id, findings, conclusion, values: [] };
}
export const CLS_RESULT_FILE_ACCEPT = '.png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf';

export function validateTechnicianUpload(file: Pick<File, 'name' | 'type' | 'size'>) {
  const extension = file.name.match(/\.([^.]+)$/)?.[1].toLowerCase();
  const expectedType = extension === 'png' ? 'image/png' : extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg'
    : extension === 'pdf' ? 'application/pdf' : null;
  const mimeType = file.type.toLowerCase() === 'image/jpg' ? 'image/jpeg' : file.type.toLowerCase();
  if (!expectedType || mimeType && mimeType !== 'application/octet-stream' && mimeType !== expectedType) {
    throw new Error('Chỉ chấp nhận ảnh PNG/JPG/JPEG hoặc tài liệu PDF đúng định dạng.');
  }
  const limit = expectedType === 'application/pdf' ? 20 : 10;
  if (!file.size) throw new Error('Tệp kết quả đang trống. Vui lòng chọn tệp khác.');
  if (file.size > limit * 1024 * 1024) throw new Error(`Tệp vượt quá dung lượng cho phép (${limit} MB).`);
}
