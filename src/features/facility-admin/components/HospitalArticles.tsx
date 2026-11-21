'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { adminRequest, type PageResponse } from '../api/admin-api-client';
import type { Specialty } from '../types';

interface Article {
  id: number; title: string; summary?: string; content?: string; specialtyId?: number;
  published: boolean; sourceUrl?: string; thumbnailUrl?: string; importedAt?: string;
}
const field = 'mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm';
const button = 'rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50';
const message = (error: unknown) => error instanceof Error ? error.message : 'Không thể xử lý bài viết.';

export function HospitalArticles({ specialties }: { specialties: Specialty[] }) {
  const [data, setData] = useState<PageResponse<Article> | null>(null);
  const [page, setPage] = useState(0), [revision, setRevision] = useState(0);
  const [keyword, setKeyword] = useState(''), [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL'), [editor, setEditor] = useState<Article | null>(null);
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    adminRequest<PageResponse<Article>>('articles/search', {
      keyword: query || null, published: status === 'ALL' ? null : status === 'PUBLISHED',
      pageable: { page, size: 20, sortBy: 'id', sortDirection: 'DESC' },
    }, controller.signal).then(result => {
      if (controller.signal.aborted) return;
      if (page > 0 && page >= result.totalPages) { setPage(Math.max(0, result.totalPages - 1)); return; }
      setData(result); setError('');
    }).catch(e => { if (!controller.signal.aborted) setError(message(e)); });
    return () => controller.abort();
  }, [page, revision, query, status]);
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
      form.reset(); setEditor(article); setPage(0); refresh();
      setNotice('Đã lấy nội dung về bản nháp. Kiểm tra, chỉnh sửa rồi duyệt đăng.');
    });
  }
  function saveArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editor) return;
    const values = new FormData(event.currentTarget);
    void run(async () => {
      const saved = await adminRequest<Article>('articles/save', { id: editor.id, title: values.get('title'), summary: values.get('summary'), content: values.get('content'), specialtyId: values.get('specialtyId') ? Number(values.get('specialtyId')) : null });
      setEditor(saved); refresh(); setNotice('Đã lưu nội dung bài viết.');
    });
  }
  return <div className="space-y-5">
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {notice && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    <section className="space-y-4 rounded-2xl border bg-white p-5">
      <h2 className="font-bold">Lấy bài viết từ URL</h2>
      <p className="text-sm text-slate-600">Bài lấy về được lưu nháp riêng cho cơ sở. Đường dẫn nguồn được giữ lại khi đăng công khai.</p>
      <form onSubmit={importArticle}><fieldset disabled={busy} className="grid gap-4 sm:grid-cols-[1fr_240px_auto]">
        <label className="min-w-0 text-sm font-bold">Đường dẫn bài viết<input name="url" type="url" required maxLength={2048} className={field} placeholder="https://..." /></label>
        <label className="text-sm font-bold">Chuyên khoa<select name="specialtyId" className={field}><option value="">Thông tin chung</option>{specialties.filter(s => s.active).map(s => <option key={s.specialtyId} value={s.specialtyId}>{s.name}</option>)}</select></label>
        <button className={`${button} self-end`}>{busy ? 'Đang xử lý…' : 'Lấy về bản nháp'}</button>
      </fieldset></form>
    </section>
    {editor && <section className="space-y-4 rounded-2xl border border-blue-200 bg-white p-5">
      <div className="flex flex-wrap justify-between gap-3"><h2 className="font-bold">Chỉnh sửa bài #{editor.id}</h2><button type="button" disabled={busy} onClick={() => setEditor(null)}>Đóng chỉnh sửa</button></div>
      {editor.sourceUrl && <a className="break-all text-sm text-blue-700 underline" href={editor.sourceUrl} target="_blank" rel="noreferrer">Nguồn: {editor.sourceUrl}</a>}
      <form key={`${editor.id}:${editor.content}`} onSubmit={saveArticle}><fieldset disabled={busy} className="space-y-4">
        <label className="block text-sm font-bold">Tiêu đề<input name="title" required maxLength={255} className={field} defaultValue={editor.title} /></label>
        <label className="block text-sm font-bold">Tóm tắt<textarea name="summary" maxLength={500} className={field} defaultValue={editor.summary ?? ''} /></label>
        <label className="block text-sm font-bold">Nội dung<textarea name="content" required rows={14} className={field} defaultValue={editor.content ?? ''} /></label>
        <label className="block text-sm font-bold">Chuyên khoa<select name="specialtyId" className={field} defaultValue={editor.specialtyId ?? ''}><option value="">Thông tin chung</option>{specialties.map(s => <option key={s.specialtyId} value={s.specialtyId}>{s.name}</option>)}</select></label>
        <button className={button}>Lưu nội dung</button>
      </fieldset></form>
    </section>}
    <section className="space-y-4 rounded-2xl border bg-white p-5">
      <h2 className="font-bold">Bài viết của cơ sở</h2>
      <form onSubmit={event => { event.preventDefault(); setPage(0); setData(null); setQuery(keyword.trim()); setRevision(value => value + 1); }} className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 text-sm font-bold">Tìm bài viết<input className={field} maxLength={255} value={keyword} onChange={event => setKeyword(event.target.value)} /></label>
        <label className="text-sm font-bold">Trạng thái<select className={field} value={status} disabled={busy} onChange={event => { setStatus(event.target.value); setPage(0); setData(null); }}><option value="ALL">Tất cả</option><option value="DRAFT">Bản nháp</option><option value="PUBLISHED">Đã đăng</option></select></label>
        <button className={button} disabled={busy}>Tìm kiếm</button><button type="button" disabled={busy} onClick={refresh}>Làm mới</button>
      </form>
      {!data && !error && <p role="status">Đang tải bài viết…</p>}
      <ul className="divide-y">{data?.content.map(article => <li key={article.id} className="space-y-3 py-4">
        <div><strong>{article.title}</strong><p className="mt-1 text-sm text-slate-600">{article.published ? 'Đã đăng' : 'Bản nháp'} · {article.summary}</p>{article.sourceUrl && <a className="break-all text-xs text-blue-700 underline" href={article.sourceUrl} target="_blank" rel="noreferrer">Xem nguồn</a>}</div>
        <div className="flex flex-wrap gap-4 text-sm font-bold">
          <button type="button" disabled={busy} onClick={() => void run(async () => { setEditor(await adminRequest<Article>('articles/detail', { articleId: article.id })); })}>Chỉnh sửa</button>
          <button type="button" disabled={busy} className="text-blue-700" onClick={() => { if (window.confirm(article.published ? 'Ẩn bài viết này khỏi trang công khai?' : 'Đã kiểm tra nội dung và muốn duyệt đăng bài viết này?')) void run(async () => { await adminRequest('articles/publication', { articleId: article.id, published: !article.published }); refresh(); setNotice(article.published ? 'Đã ẩn bài viết.' : 'Đã duyệt đăng bài viết.'); }); }}>{article.published ? 'Ẩn bài' : 'Duyệt đăng'}</button>
          <button type="button" disabled={busy} className="text-rose-700" onClick={() => { if (window.confirm('Xóa bài viết đã lấy về khỏi cơ sở?')) void run(async () => { await adminRequest('articles/delete', { articleId: article.id }); if (editor?.id === article.id) setEditor(null); refresh(); setNotice('Đã xóa bài viết.'); }); }}>Xóa bài</button>
        </div>
      </li>)}</ul>
      {data?.totalElements === 0 && <p>Chưa có bài viết phù hợp.</p>}
      {data && <nav aria-label="Phân trang bài viết" className="flex flex-wrap gap-4 text-sm"><span>{data.totalElements} bài · Trang {data.page + 1}/{Math.max(1, data.totalPages)}</span><button disabled={busy || page === 0} onClick={() => { setData(null); setPage(value => value - 1); }}>Trang trước</button><button disabled={busy || page + 1 >= data.totalPages} onClick={() => { setData(null); setPage(value => value + 1); }}>Trang sau</button></nav>}
    </section>
  </div>;
}
