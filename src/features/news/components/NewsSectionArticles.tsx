import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { NewsArticleItem, NewsSectionData } from '../types';

interface NewsSectionArticlesProps {
  section: NewsSectionData;
  onSelectArticle?: (article: NewsArticleItem) => void;
}

export const NewsSectionArticles: React.FC<NewsSectionArticlesProps> = ({
  section,
  onSelectArticle,
}) => {
  const { title, viewAllHref, featuredArticle, sideArticles, id } = section;

  return (
    <section data-purpose={id} id={id} className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs cursor-pointer"
        >
          <span>XEM TẤT CẢ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Big article on Left (6 cols) */}
        <article
          onClick={() => onSelectArticle?.(featuredArticle)}
          className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div>
            <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-slate-100">
              <Image
                src={featuredArticle.image}
                alt={featuredArticle.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-103 transition-transform duration-300"
              />
              {featuredArticle.isSponsored && (
                <span className="absolute top-3 right-3 bg-slate-900/85 text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase backdrop-blur-xs">
                  ĐƯỢC TÀI TRỢ
                </span>
              )}
            </div>

            <div className="p-5 sm:p-6">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2.5 ${featuredArticle.categoryColorClass}`}
              >
                {featuredArticle.category}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                {featuredArticle.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {featuredArticle.excerpt}
              </p>
            </div>
          </div>

          <div className="px-5 sm:px-6 pb-5 text-xs text-slate-400 border-t border-slate-100/70 pt-3 flex items-center justify-between">
            <span>{featuredArticle.author}</span>
            <span>Ngày đăng: {featuredArticle.publishDate}</span>
          </div>
        </article>

        {/* Right Side: 2 smaller articles (6 cols) */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          {sideArticles.map((art) => (
            <article
              key={art.id}
              onClick={() => onSelectArticle?.(art)}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:shadow-md hover:border-blue-300 transition-all flex gap-4 cursor-pointer group flex-1 items-center"
            >
              <div className="flex-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold mb-1.5 ${art.categoryColorClass}`}
                >
                  {art.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 hidden sm:block">
                  {art.excerpt}
                </p>
                <div className="text-xs text-slate-400 mt-3">
                  {art.author} • Ngày đăng: {art.publishDate}
                </div>
              </div>

              <div className="relative w-28 h-24 sm:w-32 sm:h-28 rounded-xl overflow-hidden shrink-0 shadow-2xs bg-slate-100">
                <Image
                  src={art.image}
                  alt={art.title}
                  fill
                  sizes="128px"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
