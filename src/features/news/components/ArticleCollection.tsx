'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import type { PublicArticle } from '../../public-data/public-api';
import { ArticleImage } from './ArticleImage';

function ArticleCard({ article, large = false }: {
  article: PublicArticle; large?: boolean;
}) {
  return <article className={`group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md ${large ? 'lg:col-span-2' : ''}`}>
    <Link href={`/news/${article.id}`} aria-label={`Đọc bài viết: ${article.title}`} className="block w-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600">
      <ArticleImage src={article.thumbnailUrl} title={article.title} priority={large} />
    </Link>
    <div className="flex flex-1 flex-col items-start gap-3 p-5">
      <p className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500"><span className="font-semibold text-blue-700">{article.specialtyName || 'Sức khỏe tổng quát'}</span>{article.publishedAt && <time dateTime={article.publishedAt}>· {formatDisplayDate(article.publishedAt)}</time>}</p>
      <h3 className={`font-bold leading-snug text-slate-900 ${large ? 'text-xl sm:text-2xl' : 'text-lg'}`}><Link href={`/news/${article.id}`} className="text-left hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600">{article.title}</Link></h3>
      {article.summary && <p className="line-clamp-3 text-sm leading-6 text-slate-600">{article.summary}</p>}
      <Link href={`/news/${article.id}`} className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-blue-600">Đọc tiếp <ArrowRight aria-hidden="true" className="size-4" /></Link>
    </div>
  </article>;
}

export function ArticleCollection({ articles, featured }: { articles: PublicArticle[]; featured: boolean }) {
  const highlights = featured ? articles.slice(0, 3) : [];
  const rest = featured ? articles.slice(3) : articles;
  return <div className="space-y-10">
    {highlights.length > 0 && <section aria-labelledby="news-highlights-title" className="space-y-5">
      <h2 id="news-highlights-title" className="text-xl font-bold text-slate-900">Tiêu điểm sức khỏe</h2>
      <div className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-4">{highlights.map((article, index) => <ArticleCard key={article.id} article={article} large={index === 0} />)}</div>
    </section>}
    {rest.length > 0 && <section aria-label="Danh sách bài viết" className="space-y-5">
      {featured && <h2 className="text-xl font-bold text-slate-900">Bài viết mới nhất</h2>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rest.map(article => <ArticleCard key={article.id} article={article} />)}</div>
    </section>}
  </div>;
}
