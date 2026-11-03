import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import type { HomeGuide } from '../data/home-resources';

export function HomeGuideArticle({ guide }: { guide: HomeGuide }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/#home-knowledge" className="mb-6 inline-flex items-center gap-2 rounded-lg text-xs font-bold text-slate-500 hover:text-blue-600">
        <ArrowLeft className="size-4" />Về thông tin trên trang chủ
      </Link>
      <p className="mb-3 flex items-center gap-2 text-xs font-bold text-blue-600"><BookOpen className="size-4" />Hướng dẫn sử dụng MedConnect</p>
      <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-4xl">{guide.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-slate-500">{guide.excerpt}</p>
      <div className="relative my-7 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
        <Image src={guide.image} alt="" fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" />
      </div>
      <div className="space-y-7">
        {guide.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-extrabold text-slate-900">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
          </section>
        ))}
      </div>
      <Link href={guide.action.href} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">
        {guide.action.label}<ArrowRight className="size-4" />
      </Link>
    </article>
  );
}
