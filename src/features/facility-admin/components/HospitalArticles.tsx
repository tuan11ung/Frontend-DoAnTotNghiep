'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { adminRequest, type PageResponse } from '../api/admin-api-client';
import { DataTablePagination } from '@/src/shared/components/pagination';
import { Modal } from '@/src/shared/components/Modal';
import { AdminTable as ScrollableTable, AdminTableColumns } from '@/src/shared/components/admin-table/AdminTable';
import { AdminTableText } from '@/src/shared/components/admin-table/AdminTableText';
import type { Specialty } from '../types';

interface Article {
  id: number; title: string; summary?: string; content?: string; specialtyId?: number;
  published: boolean; sourceUrl?: string; thumbnailUrl?: string; importedAt?: string;
}
type ArticleDraft = Omit<Article, 'id'> & { id?: number };

const field = 'mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm';
const button = 'rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50';
const message = (error: unknown) => error instanceof Error ? error.message : 'Không thể xử lý bài viết.';

export function HospitalArticles({ specialties }: { specialties: Specialty[] }) {
  const [data, setData] = useState<PageResponse<Article> | null>(null);
  const [page, setPage] = useState(0), [pageSize, setPageSize] = useState(20), [revision, setRevision] = useState(0);
  const [keyword, setKeyword] = useState(''), [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL'), [editor, setEditor] = useState<ArticleDraft | null>(null);
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    adminRequest<PageResponse<Article>>('articles/search', {
      keyword: query || null, published: status === 'ALL' ? null : status === 'PUBLISHED',
      pageable: { page, size: pageSize, sortBy: 'id', sortDirection: 'DESC' },
    }, controller.signal).then(result => {
      if (controller.signal.aborted) return;
      if (page > 0 && page >= result.totalPages) { setPage(Math.max(0, result.totalPages - 1)); return; }
      setData(result); setError('');
    }).catch(e => { if (!controller.signal.aborted) setError(message(e)); });
    return () => controller.abort();
  }, [page, pageSize, revision, query, status]);
  function refresh() { setData(null); setRevision(value => value + 1); }
  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (e) { setError(message(e)); }
    finally { lock.current = false; setBusy(false); }
  }
  function importArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget, values = new FormData(form);
    void run(async () => {
      const article = await adminRequest<Article>('articles/import-url', { url: values.get('url'), specialtyId: values.get('specialtyId') ? Number(values.get('specialtyId')) : null });
      form.reset(); setImportOpen(false); setEditor(article); setPage(0); refresh();
      setNotice('Đã lấy nội dung về bản nháp. Kiểm tra, chỉnh sửa rồi duyệt đăng.');
    });
  }
  function saveArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editor) return;
    const values = new FormData(event.currentTarget);
    const creating = !editor.id;
    void run(async () => {
      const saved = await adminRequest<Article>('articles/save', { id: editor.id, title: values.get('title'), summary: values.get('summary'), content: values.get('content'), specialtyId: values.get('specialtyId') ? Number(values.get('specialtyId')) : null });
      setEditor(saved); if (creating) setPage(0); refresh(); setNotice(creating ? 'Đã lưu bài viết mới vào bản nháp. Duyệt đăng để hiển thị tại trang Tin tức.' : 'Đã lưu nội dung bài viết.');
    });
  }
  return <div className="flex min-h-0 flex-1 flex-col gap-5">
    {error && !editor && !importOpen && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {notice && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    <section className="shrink-0 rounded-2xl border bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold">Tạo bài viết</h2>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={button} disabled={busy} onClick={() => { setError(''); setNotice(''); setEditor({ title: '', summary: '', content: '', published: false }); }}>Viết bài thủ công</button>
          <button type="button" className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-bold text-blue-700 disabled:opacity-50" disabled={busy} onClick={() => { setError(''); setNotice(''); setImportOpen(true); }}>Lấy từ URL</button>
        </div>
      </div>
    </section>
    <Modal open={importOpen} onClose={() => setImportOpen(false)} aria-label="Lấy bài viết từ URL" dismissible={!busy}>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-4"><h2 className="font-bold">Lấy bài viết từ URL</h2><button type="button" disabled={busy} onClick={() => setImportOpen(false)}>Đóng</button></div>
      <form onSubmit={importArticle} className="min-h-0 space-y-4 overflow-y-auto p-5">
        <p className="text-sm text-slate-600">Bài lấy về được lưu nháp riêng cho cơ sở. Kiểm tra nội dung rồi duyệt đăng để hiển thị tại trang Tin tức.</p>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <fieldset disabled={busy} className="space-y-4">
          <label className="block text-sm font-bold">Đường dẫn bài viết<input name="url" type="url" required maxLength={2048} className={field} placeholder="https://..." /></label>
          <label className="block text-sm font-bold">Chuyên khoa<select name="specialtyId" className={field}><option value="">Thông tin chung</option>{specialties.filter(s => s.active).map(s => <option key={s.specialtyId} value={s.specialtyId}>{s.name}</option>)}</select></label>
          <button className={button}>{busy ? 'Đang xử lý…' : 'Lấy về bản nháp'}</button>
        </fieldset>
      </form>
    </Modal>
    <Modal open={Boolean(editor)} onClose={() => setEditor(null)} aria-label={editor?.id ? `Chỉnh sửa bài #${editor.id}` : 'Viết bài thủ công'} size="3xl" dismissible={!busy}>
      {editor && <>
        <div className="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-4"><h2 className="font-bold">{editor.id ? `Chỉnh sửa bài #${editor.id}` : 'Viết bài thủ công'}</h2><button type="button" disabled={busy} onClick={() => setEditor(null)}>Đóng chỉnh sửa</button></div>
        <form key={`${editor.id ?? 'new'}:${editor.content}`} onSubmit={saveArticle} className="min-h-0 space-y-4 overflow-y-auto p-5">
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
          {editor.sourceUrl && <a className="block break-all text-sm text-blue-700 underline" href={editor.sourceUrl} target="_blank" rel="noreferrer">Nguồn: {editor.sourceUrl}</a>}
          <p className="text-sm text-slate-600">Lưu nội dung trước, sau đó chọn Duyệt đăng trong danh sách để công khai bài viết.</p>
          <fieldset disabled={busy} className="space-y-4">
            <label className="block text-sm font-bold">Tiêu đề<input name="title" required maxLength={255} className={field} defaultValue={editor.title} /></label>
            <label className="block text-sm font-bold">Tóm tắt<textarea name="summary" maxLength={500} className={field} defaultValue={editor.summary ?? ''} /></label>
            <label className="block text-sm font-bold">Nội dung<textarea name="content" required rows={12} className={field} defaultValue={editor.content ?? ''} /></label>
            <label className="block text-sm font-bold">Chuyên khoa<select name="specialtyId" className={field} defaultValue={editor.specialtyId ?? ''}><option value="">Thông tin chung</option>{specialties.map(s => <option key={s.specialtyId} value={s.specialtyId}>{s.name}</option>)}</select></label>
            <button className={button}>{busy ? 'Đang lưu…' : editor.id ? 'Lưu nội dung' : 'Lưu bản nháp'}</button>
          </fieldset>
        </form>
      </>}
    </Modal>
    <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-2xl border bg-white p-5">
      <h2 className="font-bold">Bài viết của cơ sở</h2>
      <form onSubmit={event => { event.preventDefault(); setPage(0); setData(null); setQuery(keyword.trim()); setRevision(value => value + 1); }} className="flex shrink-0 flex-wrap items-end gap-3">
        <label className="min-w-full flex-1 text-sm font-bold sm:min-w-0">Tìm bài viết<input className={field} maxLength={255} value={keyword} onChange={event => setKeyword(event.target.value)} /></label>
        <label className="w-32 text-sm font-bold sm:w-auto">Trạng thái<select className={field} value={status} disabled={busy} onChange={event => { setStatus(event.target.value); setPage(0); setData(null); }}><option value="ALL">Tất cả</option><option value="DRAFT">Bản nháp</option><option value="PUBLISHED">Đã đăng</option></select></label>
        <button className={button} disabled={busy}>Tìm kiếm</button><button type="button" disabled={busy} onClick={refresh}>Làm mới</button>
      </form>
      {!data && !error && <p role="status">Đang tải bài viết…</p>}
      <ScrollableTable stickyActions maxHeight="none" label="Danh sách bài viết của cơ sở" key={`${page}:${pageSize}:${query}:${status}`}>
        <table className="w-full text-left text-sm" style={{ minWidth: 1040 }}><AdminTableColumns widths={[540,160,340]} />
          <thead className="bg-slate-50"><tr><th className="p-3">Bài viết</th><th className="p-3">Trạng thái</th><th className="p-3">Thao tác</th></tr></thead>
          <tbody className="divide-y">{data?.content.map(article => <tr key={article.id}>
            <td className="max-w-xl p-3"><strong><AdminTableText text={article.title} /></strong><p className="mt-1 text-sm text-slate-600"><AdminTableText text={article.summary} /></p>{article.sourceUrl && <a className="break-all text-xs text-blue-700 underline" href={article.sourceUrl} target="_blank" rel="noreferrer">Xem nguồn</a>}</td>
            <td className="whitespace-nowrap p-3">{article.published ? 'Đã đăng' : 'Bản nháp'}</td>
            <td className="p-3">        <div className="flex flex-nowrap items-center gap-4 whitespace-nowrap text-sm font-bold">
          <button type="button" disabled={busy} onClick={() => void run(async () => { setEditor(await adminRequest<Article>('articles/detail', { articleId: article.id })); })}>Chỉnh sửa</button>
          <button type="button" disabled={busy} className="text-blue-700" onClick={() => { if (window.confirm(article.published ? 'Ẩn bài viết này khỏi trang công khai?' : 'Đã kiểm tra nội dung và muốn duyệt đăng bài viết này?')) void run(async () => { await adminRequest('articles/publication', { articleId: article.id, published: !article.published }); refresh(); setNotice(article.published ? 'Đã ẩn bài viết.' : 'Đã duyệt đăng bài viết.'); }); }}>{article.published ? 'Ẩn bài' : 'Duyệt đăng'}</button>
          <button type="button" disabled={busy} className="text-rose-700" onClick={() => { if (window.confirm('Xóa bài viết này khỏi cơ sở?')) void run(async () => { await adminRequest('articles/delete', { articleId: article.id }); if (editor?.id === article.id) setEditor(null); refresh(); setNotice('Đã xóa bài viết.'); }); }}>Xóa bài</button>
        </div></td>
          </tr>)}</tbody>
        </table>
      </ScrollableTable>
      {data?.totalElements === 0 && <p>Chưa có bài viết phù hợp.</p>}
      <DataTablePagination pageIndex={page} pageSize={pageSize} totalRecords={data?.totalElements ?? 0} disabled={busy || !data || Boolean(error)} ariaLabel="Phân trang bài viết" onPageChange={next => { setData(null); setPage(next); }} onPageSizeChange={size => { setData(null); setPage(0); setPageSize(size); }} />
    </section>
  </div>;
}
