import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { HOME_GUIDES } from '@/src/features/home/data/home-resources';
import { PublicHeader } from '@/src/shared/components/layout/PublicHeader';
import { PublicFooter } from '@/src/shared/components/layout/PublicFooter';
import { HomeGuideArticle } from '@/src/features/home/components/HomeGuideArticle';

export function generateStaticParams() {
  return HOME_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = HOME_GUIDES.find((item) => item.slug === slug);
  return { title: guide ? `${guide.title} | MedConnect` : 'Không tìm thấy hướng dẫn | MedConnect' };
}

async function GuideContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = HOME_GUIDES.find((item) => item.slug === slug);
  if (!guide) notFound();
  return <HomeGuideArticle guide={guide} />;
}

export default function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  return <div className="flex min-h-screen flex-col bg-white"><PublicHeader /><main className="flex-1"><Suspense fallback={<p role="status" className="p-10 text-center text-sm text-slate-500">Đang tải hướng dẫn…</p>}><GuideContent params={params} /></Suspense></main><PublicFooter /></div>;
}
