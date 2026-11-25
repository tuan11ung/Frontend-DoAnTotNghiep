'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Pencil, Pill, Plus } from 'lucide-react';
import { AdminTable, AdminTableColumns } from '@/src/shared/components/admin-table/AdminTable';
import { AdminTableText } from '@/src/shared/components/admin-table/AdminTableText';
import { AutoSearchBar } from '@/src/shared/components/AutoSearchBar';
import { Modal } from '@/src/shared/components/Modal';
import { DataTablePagination } from '@/src/shared/components/pagination';
import { ToastMessage } from '@/src/shared/components/ToastMessage';
import { AdminApiError, adminRequest, type PageResponse } from '../api/admin-api-client';

interface Medicine {
  medicineId: number;
  code: string;
  name: string;
  strength?: string | null;
  form?: string | null;
  total?: number | null;
  version?: string | null;
}

const primary = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50';
const secondary = 'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50';
const field = 'mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-blue-600';

export function FacilityMedicines() {
  const [catalog, setCatalog] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [rows, setRows] = useState<PageResponse<Medicine> | null>(null);
  const [editor, setEditor] = useState<Medicine | null>(null);
  const [revision, setRevision] = useState(0);
  const [listError, setListError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const editorTrigger = useRef<HTMLButtonElement>(null);
  const widths = catalog ? [320, 180, 160] : [320, 180, 120, 160];

  useEffect(() => {
    const controller = new AbortController();
    const path = catalog ? 'hospital-medicines/catalog/search' : 'hospital-medicines/search';
    adminRequest<PageResponse<Medicine>>(path, { keyword: query, pageable: { page, size: pageSize } }, controller.signal)
      .then(result => {
        if (controller.signal.aborted) return;
        if (page > 0 && page >= result.totalPages) {
          setPage(Math.max(0, result.totalPages - 1));
          return;
        }
        setRows(result);
      })
      .catch(error => {
        if (!controller.signal.aborted) setListError(error instanceof Error ? error.message : 'Không thể tải danh sách thuốc.');
      });
    return () => controller.abort();
  }, [catalog, query, page, pageSize, revision]);

  const applySearch = useCallback((nextQuery: string) => {
    setQuery(nextQuery);
    setPage(0);
    setRows(null);
    setListError('');
  }, []);

  function switchCatalog(next: boolean) {
    setKeyword('');
    applySearch('');
    setCatalog(next);
  }

  function closeEditor() {
    setEditor(null);
    requestAnimationFrame(() => {
      const trigger = editorTrigger.current;
      (trigger?.isConnected ? trigger : heading.current)?.focus();
    });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor || lock.current) return;
    const data = new FormData(event.currentTarget);
    const reason = String(data.get('reason') ?? '').trim();
    if (!reason) {
      setSaveError('Vui lòng nhập lý do kiểm kê.');
      return;
    }
    lock.current = true;
    setBusy(true);
    setSaveError('');
    setNotice('');
    try {
      await adminRequest('hospital-medicines/save', {
        medicineId: editor.medicineId,
        total: Number(data.get('total')),
        expectedTotal: editor.total ?? null,
        expectedVersion: editor.version ?? null,
        reason,
      });
      setEditor(null);
      setRows(null);
      setRevision(value => value + 1);
      if (catalog) switchCatalog(false);
      setNotice(catalog ? 'Đã thêm thuốc vào cơ sở.' : 'Đã cập nhật tồn kho.');
      requestAnimationFrame(() => heading.current?.focus());
    } catch (error) {
      if (!catalog && error instanceof AdminApiError && error.status === 409) {
        setRows(null);
        setRevision(value => value + 1);
        setSaveError('Tồn kho đã thay đổi. Đóng hộp thoại rồi mở lại thuốc để xem số lượng mới.');
      } else {
        setSaveError(error instanceof Error ? error.message : 'Không thể lưu thuốc.');
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  const editorTitle = catalog ? 'Thêm thuốc vào cơ sở' : 'Điều chỉnh tồn kho';

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <Pill aria-hidden="true" className="size-5" />
          </div>
          <div>
            <h1 ref={heading} tabIndex={-1} className="text-lg font-extrabold text-slate-950">
              {catalog ? 'Danh mục thuốc dùng chung' : 'Quản lý thuốc của cơ sở'}
            </h1>
            <p className="text-sm leading-5 text-slate-500">
              {catalog ? 'Chọn thuốc để thêm vào danh mục của cơ sở.' : 'Quản lý danh mục thuốc và số lượng tồn kho.'}
            </p>
          </div>
        </div>
        <button type="button" className={catalog ? secondary : primary} onClick={() => switchCatalog(!catalog)} disabled={busy}>
          {catalog ? <><ArrowLeft aria-hidden="true" className="size-4" /> Về thuốc cơ sở</> : <><Plus aria-hidden="true" className="size-4" /> Thêm thuốc</>}
        </button>
      </header>

      <div className="shrink-0 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
        <div className="max-w-md">
          <label htmlFor="facility-medicine-search" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Tìm kiếm</label>
          <AutoSearchBar id="facility-medicine-search" aria-label="Tìm thuốc" placeholder="Tìm theo mã hoặc tên thuốc"
            maxLength={255} value={keyword} appliedValue={query} onValueChange={setKeyword} onSearch={applySearch} />
        </div>
      </div>

      <AdminTable stickyActions label={catalog ? 'Danh mục thuốc dùng chung' : 'Danh sách thuốc của cơ sở'} maxHeight="none" key={`${catalog}:${page}:${pageSize}:${query}`}>
        <table className="w-full text-left text-sm" style={{ minWidth: widths.reduce((total, width) => total + width, 0) }}>
          <AdminTableColumns widths={widths} />
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-5 py-3">Thuốc</th>
              <th scope="col" className="px-4 py-3">Dạng bào chế</th>
              {!catalog && <th scope="col" className="px-4 py-3 text-right">Tồn kho</th>}
              <th scope="col" className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows?.content.map(medicine => (
              <tr key={medicine.medicineId} className="hover:bg-blue-50/20">
                <td className="px-5 py-4">
                  <p className="font-bold text-slate-900"><AdminTableText text={[medicine.name, medicine.strength].filter(Boolean).join(' ')} /></p>
                  <p className="mt-1 font-mono text-xs text-slate-500"><AdminTableText text={medicine.code} lines={1} /></p>
                </td>
                <td className="px-4 py-4 text-slate-700"><AdminTableText text={medicine.form} /></td>
                {!catalog && <td className="px-4 py-4 text-right font-semibold text-slate-800">{medicine.total ?? '—'}</td>}
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end">
                    <button type="button" className={secondary} aria-label={`${catalog ? 'Thêm' : 'Điều chỉnh tồn kho'} ${medicine.name}`}
                      disabled={busy} onClick={event => {
                        editorTrigger.current = event.currentTarget;
                        setSaveError('');
                        setEditor(medicine);
                      }}>
                      {catalog ? <><Plus aria-hidden="true" className="size-4" /> Thêm</> : <><Pencil aria-hidden="true" className="size-4" /> Điều chỉnh</>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {listError && <div role="alert" className="space-y-3 p-5 text-sm text-rose-700">
          <p>{listError}</p>
          <button type="button" className={secondary} onClick={() => { setListError(''); setRevision(value => value + 1); }}>Thử lại</button>
        </div>}
        {!rows && !listError && <p role="status" className="p-5 text-sm text-slate-500">Đang tải danh sách thuốc…</p>}
        {rows?.content.length === 0 && <p role="status" className="p-5 text-sm text-slate-600">
          {query || catalog ? 'Không tìm thấy thuốc phù hợp.' : 'Cơ sở chưa có thuốc trong danh mục.'}
        </p>}
      </AdminTable>
      <DataTablePagination pageIndex={page} pageSize={pageSize} totalRecords={rows?.totalElements ?? 0}
        disabled={busy || !rows} ariaLabel="Phân trang thuốc cơ sở"
        onPageChange={next => { setRows(null); setPage(next); }}
        onPageSizeChange={size => { setRows(null); setPage(0); setPageSize(size); }} />

      {editor && <Modal open size="lg" aria-label={editorTitle} onClose={closeEditor} dismissible={!busy}>
        <div className="shrink-0 border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-950">{editorTitle}</h2>
          <p className="mt-1 break-words text-sm text-slate-600">{editor.code} · {editor.name}</p>
        </div>
        <form className="min-h-0 overflow-y-auto" onSubmit={save}>
          <fieldset disabled={busy} className="space-y-4 p-5">
            <label className="block text-sm font-semibold">Số lượng kiểm kê
              <input name="total" type="number" min={0} max={2147483647} step={1} required className={field} defaultValue={editor.total ?? 0} />
            </label>
            <label className="block text-sm font-semibold">Lý do
              <textarea name="reason" required maxLength={500} rows={3} className={field} />
            </label>
            {saveError && <p role="alert" className="text-sm text-rose-700">{saveError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" className={secondary} onClick={closeEditor}>Hủy</button>
              <button type="submit" className={primary}>{busy ? 'Đang lưu…' : catalog ? 'Thêm thuốc' : 'Lưu điều chỉnh'}</button>
            </div>
          </fieldset>
        </form>
      </Modal>}
      <ToastMessage message={notice} onDismiss={() => setNotice('')} />
    </section>
  );
}
