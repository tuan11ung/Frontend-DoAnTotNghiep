export interface SearchPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/** Calendars and finite option selectors need all pages in the selected date range. */
export async function loadSearchPages<T>(load: (page: number) => Promise<SearchPage<T>>, signal?: AbortSignal): Promise<T[]> {
  const result: T[] = [];
  for (let page = 0; page < 500; page++) {
    signal?.throwIfAborted();
    const response = await load(page);
    if (!Array.isArray(response.content) || response.page !== page || typeof response.last !== 'boolean') {
      throw new Error('Dữ liệu phân trang không hợp lệ. Vui lòng tải lại.');
    }
    result.push(...response.content);
    if (response.last) return result;
  }
  throw new Error('Có quá nhiều kết quả. Vui lòng thu hẹp khoảng ngày hoặc điều kiện tìm kiếm.');
}
