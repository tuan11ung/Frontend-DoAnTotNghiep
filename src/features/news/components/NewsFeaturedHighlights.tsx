import React from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight } from 'lucide-react';
import { FeaturedHighlightItem } from '../types';

interface NewsFeaturedHighlightsProps {
  highlights: FeaturedHighlightItem[];
  onSelectHighlight?: (highlight: FeaturedHighlightItem) => void;
}

export const NewsFeaturedHighlights: React.FC<NewsFeaturedHighlightsProps> = ({
  highlights,
  onSelectHighlight,
}) => {
  return (
    <section data-purpose="featured-highlights" id="featured-highlights">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Chuyên Mục Nổi Bật
          </h2>
        </div>
        <a
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm cursor-pointer"
          href="#medical-dictionary"
        >
          <span>XEM TẤT CẢ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 4 Prominent Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((item) => (
          <article
            key={item.id}
            onClick={() => onSelectHighlight?.(item)}
            className={`relative overflow-hidden rounded-2xl ${item.gradientClass} border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-300 group p-5 flex flex-col justify-between min-h-[380px] cursor-pointer`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.badgeBgClass}`}>
                  {item.badge}
                </span>
              </div>
              <h3 className={`text-2xl font-extrabold leading-tight ${item.textClass || 'text-slate-900'}`}>
                {item.titleHighlight && (
                  <span className="text-rose-600 text-3xl font-black block">
                    {item.titleHighlight}
                  </span>
                )}
                {item.titleRest}
              </h3>
              <p className={`text-xs font-bold mt-1.5 uppercase tracking-wide ${item.textClass ? 'text-slate-200' : 'text-blue-700'}`}>
                {item.subtitle}
              </p>
              <p className={`text-xs mt-0.5 italic ${item.textClass ? 'text-slate-300' : 'text-slate-500'}`}>
                {item.note}
              </p>
            </div>

            <div className="mt-5 flex flex-col items-center">
              <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-xs bg-white/40">
                <Image
                  src={item.image}
                  alt={item.titleRest || item.titleHighlight}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="w-full mt-3 flex flex-wrap gap-1.5 justify-center text-[11px] font-medium">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/90 text-slate-700 px-2.5 py-0.5 rounded-md shadow-2xs backdrop-blur-xs border border-white/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
