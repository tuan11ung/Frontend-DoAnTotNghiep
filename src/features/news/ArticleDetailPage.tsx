'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { publicRequest, type PublicArticle } from '../public-data/public-api';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import { ArticleImage } from './components/ArticleImage';

export function ArticleDetailPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const valid = /^[1-9]\d*$/.test(articleId) && Number.isSafeInteger(Number(articleId));
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ id: string; article?: PublicArticle; error?: string }>();
  useEffect(() => {
    if (!valid) return;
    const controller = new AbortController();
    publicRequest<PublicArticle>('articles/detail', { articleId: Number(articleId) }, controller.signal)
      .then(article => { if (!controller.signal.aborted) setResult({ id: articleId, article }); })
      .catch(error => { if (!controller.signal.aborted) setResult({ id: articleId, error: error instanceof Error ? error.message : 'Không thể tải bài viết.' }); });
    return () => controller.abort();
  }, [articleId, revision, valid]);
  const current = result?.id === articleId ? result : undefined;
  const article = current?.article;
  const source = article?.sourceUrl && /^https?:\/\//i.test(article.sourceUrl) ? article.sourceUrl : undefined;
  const content = article?.content?.replace(/<\/(p|div|h[1-6])>/gi, '\n\n').replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  return <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
    <nav aria-label="Đường dẫn" className="flex flex-wrap gap-2 text-sm text-slate-500"><Link href="/" className="hover:text-blue-700">Trang chủ</Link><span aria-hidden="true">/</span><Link href="/news" className="hover:text-blue-700">Tin tức</Link><span aria-hidden="true">/</span><span aria-current="page">Chi tiết bài viết</span></nav>
    <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"><ArrowLeft aria-hidden="true" className="size-4" />Danh sách tin tức</Link>
    {!valid || current?.error ? <div role="alert" className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"><h1 className="text-xl font-bold">Không thể mở bài viết</h1><p className="text-sm text-slate-600">{valid ? current?.error : 'Đường dẫn bài viết không hợp lệ.'}</p>{valid && <button type="button" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => { setResult(undefined); setRevision(value => value + 1); }}>Thử lại</button>}</div>
      : !article ? <p role="status" className="rounded-xl bg-white p-8 text-center text-slate-500">Đang tải bài viết…</p>
      : <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="space-y-4 px-5 pt-6 sm:px-10 sm:pt-10"><p className="flex flex-wrap gap-3 text-sm text-slate-500"><span className="font-semibold text-blue-700">{article.specialtyName || 'Sức khỏe tổng quát'}</span>{article.publishedAt && <time dateTime={article.publishedAt}>{formatDisplayDate(article.publishedAt)}</time>}</p><h1 className="break-words text-2xl font-extrabold leading-snug text-slate-900 sm:text-3xl">{article.title}</h1>{article.summary && <p className="text-base font-medium leading-8 text-slate-700">{article.summary}</p>}</header>
        <div className="mt-6"><ArticleImage key={article.id} src={article.thumbnailUrl} title={article.title} priority /></div>
        <div className="space-y-6 px-5 py-8 text-base leading-8 text-slate-700 sm:px-10">{content ? content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index} className="whitespace-pre-wrap break-words">{paragraph.split(/(https?:\/\/[^\s]+)/g).map((part, partIndex) => /^https?:\/\//i.test(part) ? <a key={partIndex} href={part} target="_blank" rel="noopener noreferrer" className="break-all text-blue-700 underline">{part}</a> : part)}</p>) : <p>Nội dung bài viết đang được cập nhật.</p>}
          {source && <p className="border-t border-slate-100 pt-5 text-sm">Nguồn bài viết: <a href={source} target="_blank" rel="noopener noreferrer" className="break-all text-blue-700 underline">{source}</a></p>}
        </div>
      </article>}
  </div>;
}
