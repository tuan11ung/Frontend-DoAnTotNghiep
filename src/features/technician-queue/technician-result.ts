import type { TechnicianLabParameter, TechnicianOrderDetail, TechnicianResultSave } from './technician-api.types';

export interface TechnicianResultDraft {
  findings: string;
  conclusion: string;
  values: Record<number, { numeric: string; text: string }>;
}

export function createTechnicianDraft(detail: TechnicianOrderDetail, parameters: TechnicianLabParameter[]): TechnicianResultDraft {
  return {
    findings: detail.findings ?? '',
    conclusion: detail.conclusion ?? '',
    values: Object.fromEntries(parameters.map(parameter => {
      const saved = detail.values.find(value => value.labParameterId === parameter.id);
      return [parameter.id, { numeric: saved?.value?.toString() ?? '', text: saved?.valueText ?? '' }];
    })),
  };
}

export function buildTechnicianResult(detail: TechnicianOrderDetail, parameters: TechnicianLabParameter[], draft: TechnicianResultDraft, completing = false): TechnicianResultSave {
  const values: TechnicianResultSave['values'] = [];
  for (const parameter of parameters) {
    const input = draft.values[parameter.id];
    const numeric = input?.numeric.trim().replace(',', '.') ?? '';
    const text = input?.text.trim() ?? '';
    if (!numeric && !text) {
      if (completing) throw new Error(`Vui lòng nhập kết quả cho chỉ số ${parameter.name}.`);
      if (detail.values.some(value => value.labParameterId === parameter.id)) throw new Error(`Chỉ số ${parameter.name} đã có kết quả. Vui lòng nhập giá trị thay thế.`);
      continue;
    }
    if (numeric && !/^-?\d{1,8}(?:\.\d{1,4})?$/.test(numeric)) throw new Error(`${parameter.name}: giá trị số có tối đa 8 chữ số phần nguyên và 4 chữ số thập phân.`);
    if (text.length > 100) throw new Error(`${parameter.name}: kết quả dạng chữ có tối đa 100 ký tự.`);
    values.push({ labParameterId: parameter.id, value: numeric ? Number(numeric) : null, valueText: text || null });
  }
  const findings = draft.findings.trim();
  const conclusion = draft.conclusion.trim();
  if (!findings && !conclusion && !values.length && !detail.media.length) throw new Error('Vui lòng nhập kết quả hoặc tải tệp kết quả trước khi lưu.');
  return { orderedServiceId: detail.order.id, findings, conclusion, values };
}

export function validateTechnicianUpload(file: Pick<File, 'type' | 'size'>) {
  const limit = file.type === 'video/mp4' ? 100 : 10;
  if (!['image/jpeg', 'image/png', 'video/mp4'].includes(file.type)) throw new Error('Chỉ chấp nhận ảnh JPEG/PNG hoặc video MP4.');
  if (!file.size) throw new Error('Tệp kết quả đang trống. Vui lòng chọn tệp khác.');
  if (file.size > limit * 1024 * 1024) throw new Error(`Tệp vượt quá dung lượng cho phép (${limit} MB).`);
}
