'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Building2, FileText, LoaderCircle, Search, Stethoscope, X } from 'lucide-react';
import { useSearchSuggestions } from '../hooks/use-search-suggestions';
import { SEARCH_MAX_LENGTH, SEARCH_MIN_LENGTH, type SearchGroupId } from '../types';

const groupIcons = { articles: BookOpen, diseases: FileText, hospitals: Building2, doctors: Stethoscope, policies: FileText };

function SearchThumbnail({ image, group }: { image?: string; group: SearchGroupId }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const Icon = groupIcons[group];
  return (
    <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-blue-50 text-blue-600">
      <Icon aria-hidden="true" className="size-5" />
      {image && !failed && <Image src={image} alt="" width={44} height={44} unoptimized onLoad={() => setLoaded(true)} onError={() => setFailed(true)} className={`absolute inset-0 size-11 object-cover transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`} />}
    </span>
  );
}

export function HeaderSearch({ onOpen }: { onOpen?: () => void }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [composing, setComposing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchQuery = query.trim().replace(/\s+/g, ' ');
  const { status, groups, retry } = useSearchSuggestions(searchQuery, open && !composing);
  const items = groups.flatMap((group) => group.items);
  const total = groups.reduce((count, group) => count + group.total, 0);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape' && !event.isComposing) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  function changeQuery(value: string) {
    setQuery(value);
    setActiveIndex(-1);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || composing || !items.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const nextIndex = event.key === 'ArrowDown'
        ? (activeIndex + 1) % items.length
        : (activeIndex <= 0 ? items.length : activeIndex) - 1;
      setActiveIndex(nextIndex);
      document.getElementById(`${id}-option-${nextIndex}`)?.scrollIntoView({ block: 'nearest' });
    }
  }

  return (
    <div ref={rootRef} data-search-open={open} className="static xl:relative" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <button ref={triggerRef} type="button" aria-label="Mở tìm kiếm" aria-expanded={open} aria-controls={`${id}-panel`} onClick={() => { setOpen(true); onOpen?.(); }} className="inline-flex h-10 w-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:w-10 xl:w-36 xl:justify-start xl:px-3">
        <Search aria-hidden="true" className="size-4 shrink-0" /><span className="hidden xl:inline">Tìm kiếm…</span>
      </button>

      {open && (
        <div id={`${id}-panel`} className="absolute top-3 right-4 left-4 z-[80] origin-top-right animate-in fade-in zoom-in-95 duration-150 sm:top-5 sm:right-6 sm:left-auto sm:w-[420px] xl:top-0 xl:right-0">
          <form role="search" aria-label="Tìm kiếm trên MedConnect" className="flex h-11 items-center gap-2 rounded-xl border border-blue-300 bg-white px-3 shadow-sm ring-4 ring-blue-50" onSubmit={(event) => {
            event.preventDefault();
            if (composing || !items.length) return;
            document.getElementById(`${id}-option-${activeIndex >= 0 ? activeIndex : 0}`)?.click();
          }}>
            <Search aria-hidden="true" className="size-4 shrink-0 text-blue-600" />
            <input ref={inputRef} id={`${id}-input`} aria-label="Tìm bài viết, bệnh viện, bác sĩ" role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-results`} aria-activedescendant={activeIndex >= 0 && items[activeIndex] ? `${id}-option-${activeIndex}` : undefined} autoComplete="off" spellCheck={false} maxLength={SEARCH_MAX_LENGTH} value={query} onChange={(event) => changeQuery(event.target.value)} onCompositionStart={() => setComposing(true)} onCompositionEnd={(event) => { setComposing(false); changeQuery(event.currentTarget.value); }} onKeyDown={onKeyDown} placeholder="Tìm bài viết, bệnh viện, bác sĩ…" className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            {query && <button type="button" aria-label="Xóa từ khóa tìm kiếm" onClick={() => { changeQuery(''); inputRef.current?.focus(); }} className="grid size-7 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X aria-hidden="true" className="size-3.5" /></button>}
            <button type="button" aria-label="Đóng tìm kiếm" onClick={() => { setOpen(false); triggerRef.current?.focus(); }} className="shrink-0 rounded-lg border-l border-slate-100 px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800">Đóng</button>
          </form>

          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/15">
            <div id={`${id}-results`} role="listbox" aria-label="Gợi ý tìm kiếm" aria-busy={status === 'loading'} className="max-h-[min(460px,calc(100dvh-150px))] overflow-y-auto overscroll-contain">
              {status === 'idle' && <div className="p-5"><p className="text-sm font-semibold text-slate-800">Bạn đang tìm thông tin gì?</p><p className="mt-1.5 text-xs leading-relaxed text-slate-500">Nhập ít nhất {SEARCH_MIN_LENGTH} ký tự. Có thể tìm bằng tiếng Việt không dấu.</p><div className="mt-4 flex flex-wrap gap-2">{['BHYT', 'Nhi', 'Dinh dưỡng'].map((word) => <button key={word} type="button" onClick={() => { changeQuery(word); inputRef.current?.focus(); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">{word}</button>)}</div></div>}
              {status === 'loading' && <div className="flex items-center gap-2.5 px-5 py-8 text-sm text-slate-500" role="status"><LoaderCircle aria-hidden="true" className="size-4 animate-spin text-blue-600" />Đang tìm kiếm…</div>}
              {status === 'error' && <div className="p-5" role="alert"><p className="text-sm font-medium text-slate-700">Chưa thể tải kết quả. Vui lòng thử lại.</p><button type="button" onClick={retry} className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100">Thử lại</button></div>}
              {status === 'success' && !items.length && <div className="p-5"><p className="break-words text-sm font-semibold text-slate-800">Không tìm thấy kết quả cho “{searchQuery}”</p><p className="mt-2 text-xs leading-relaxed text-slate-500">Thử từ khóa ngắn hơn hoặc tìm theo tên bài viết, bệnh viện, bác sĩ.</p></div>}
              {groups.map((group) => <div key={group.id} role="group" aria-labelledby={`${id}-${group.id}`}>
                <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-y border-slate-100 bg-slate-50 px-4 py-2.5"><h3 id={`${id}-${group.id}`} className="text-xs font-bold text-slate-800">{group.label}</h3><span className="text-[10px] text-slate-400">{group.total} kết quả</span></div>
                {group.items.map((item) => {
                  const index = items.indexOf(item);
                  return <Link key={item.id} id={`${id}-option-${index}`} role="option" aria-selected={activeIndex === index} tabIndex={-1} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined} prefetch={false} onClick={() => setOpen(false)} onMouseEnter={() => setActiveIndex(index)} className={`flex items-center gap-3 px-4 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-blue-600 ${activeIndex === index ? 'bg-blue-50' : 'hover:bg-blue-50/60'}`}>
                    <SearchThumbnail image={item.image} group={group.id} />
                    <span className="min-w-0 flex-1"><span className="line-clamp-2 text-[13px] leading-relaxed font-medium text-slate-800">{item.title}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{item.description}</span></span>
                    {item.external && <ArrowUpRight aria-label="Mở nguồn trong tab mới" className="size-3.5 shrink-0 text-slate-400" />}
                  </Link>;
                })}
              </div>)}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-2.5 text-[10px] text-slate-400"><span>{status === 'success' ? `${total} kết quả · Bài viết được ưu tiên` : 'Tìm kiếm thông tin công khai'}</span><span className="hidden shrink-0 sm:inline">↑↓ chọn · Enter mở · Esc đóng</span></div>
          </div>
          <p role="status" aria-live="polite" className="sr-only">{status === 'success' ? `${total} kết quả tìm kiếm. ${groups.map((group) => `${group.label}: ${group.total}`).join('. ')}` : ''}</p>
        </div>
      )}
    </div>
  );
}
