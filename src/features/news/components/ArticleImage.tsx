'use client';

import Image from 'next/image';
import { useState } from 'react';

export function ArticleImage({ src, title, priority = false }: { src?: string; title: string; priority?: boolean }) {
  const [failed, setFailed] = useState<string>();
  const url = src?.trim();
  const valid = url && ((url.startsWith('/') && !url.startsWith('//')) || /^https?:\/\//i.test(url));
  const fallback = !valid || failed === url;
  return <div className="relative aspect-[16/10] w-full overflow-hidden bg-blue-50">
    <Image key={fallback ? 'fallback' : url} src={fallback ? '/images/home/active-living.svg' : url}
      alt={fallback ? 'Minh họa kiến thức sức khỏe MedConnect' : title} fill unoptimized
      loading={priority ? 'eager' : 'lazy'} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      onError={fallback ? undefined : () => setFailed(url)}
      className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" />
    {fallback && <span className="absolute bottom-3 left-3 rounded bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-600">Ảnh minh họa</span>}
  </div>;
}
