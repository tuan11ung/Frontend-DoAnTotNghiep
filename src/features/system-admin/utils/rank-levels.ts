export const RANK_ORDER_OPTIONS = [
  { value: 1, label: 'Bác sĩ' },
  { value: 2, label: 'Sau đại học' },
  { value: 3, label: 'Chuyên gia cao cấp' },
  { value: 4, label: 'Phó giáo sư' },
  { value: 5, label: 'Giáo sư' },
] as const;

export function getRankOrderLabel(rankOrder: number) {
  return RANK_ORDER_OPTIONS.find((option) => option.value === rankOrder)?.label ?? 'Chưa phân loại';
}
