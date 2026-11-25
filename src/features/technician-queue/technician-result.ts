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
export function validateTechnicianUpload(file: Pick<File, 'type' | 'size'>) {
  const limit = file.type === 'video/mp4' ? 100 : file.type === 'application/pdf' ? 20 : 10;
  if (!['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'].includes(file.type)) throw new Error('Chỉ chấp nhận ảnh JPEG/PNG, PDF hoặc video MP4.');
  if (!file.size) throw new Error('Tệp kết quả đang trống. Vui lòng chọn tệp khác.');
  if (file.size > limit * 1024 * 1024) throw new Error(`Tệp vượt quá dung lượng cho phép (${limit} MB).`);
}
