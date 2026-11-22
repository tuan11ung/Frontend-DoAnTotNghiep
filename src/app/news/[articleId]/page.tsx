import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PublicHeader } from '@/src/shared/components/layout/PublicHeader';
import { PublicFooter } from '@/src/shared/components/layout/PublicFooter';
import { ArticleDetailPage } from '@/src/features/news/ArticleDetailPage';

export const metadata: Metadata = { title: 'Đọc bài viết sức khỏe | MedConnect' };

export default function ArticlePage() {
  return <div className="flex min-h-screen flex-col bg-slate-50/60">
    <PublicHeader />
    <main className="min-w-0 flex-1"><Suspense fallback={<p role="status" className="p-8 text-center">Đang tải bài viết…</p>}><ArticleDetailPage /></Suspense></main>
    <PublicFooter />
  </div>;
}
