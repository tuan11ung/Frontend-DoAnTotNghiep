export function paginationModel(totalRecords: number, pageIndex: number, pageSize: number) {
  const total = Math.max(0, Math.trunc(totalRecords));
  const size = Math.max(1, Math.trunc(pageSize));
  const pageCount = Math.max(1, Math.ceil(total / size));
  const index = Math.max(0, Math.min(Math.trunc(pageIndex), pageCount - 1));
  const pages = [...new Set([0, index - 1, index, index + 1, pageCount - 1])]
    .filter(page => page >= 0 && page < pageCount).sort((a, b) => a - b);
  return {
    total, size, pageCount, pageIndex: index, pages,
    from: total === 0 ? 0 : index * size + 1,
    to: Math.min((index + 1) * size, total),
    canPrevious: index > 0,
    canNext: index + 1 < pageCount,
  };
}
