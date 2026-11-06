'use client';

import { useState } from 'react';
import { FolderTree, Search } from 'lucide-react';
import { normalizeClsSearch, type ClsCatalogService } from './cls-orders.types';

interface Props {
  catalog: ClsCatalogService[];
  selected: string[];
  blocked: Set<string>;
  loading: boolean;
  unavailable: boolean;
  onToggle: (id: string) => void;
}

export function ClsCatalogTree({ catalog, selected, blocked, loading, unavailable, onToggle }: Props) {
  const [query, setQuery] = useState('');
  const search = normalizeClsSearch(query);
  const filtered = catalog.filter(service => normalizeClsSearch(`${service.name} ${service.code} ${service.group} ${service.category}`).includes(search));
  const groups = [...new Set(filtered.map(service => service.group))];
  return <section aria-label="Danh mục dịch vụ của cơ sở" className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 p-5">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><FolderTree className="size-4 text-blue-700" />Danh mục dịch vụ</h3>
      <p className="mt-1.5 text-xs leading-6 text-slate-400">Mở nhóm và chọn dịch vụ cần chỉ định.</p>
      <label htmlFor="cls-catalog-search" className="sr-only">Tìm dịch vụ theo tên hoặc mã</label>
      <div className="relative mt-3"><Search aria-hidden="true" className="absolute top-3.5 left-3 size-4 text-slate-400" /><input id="cls-catalog-search" name="catalog-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm tên dịch vụ, mã hoặc nhóm…" className="w-full rounded-lg border border-slate-200 py-3 pr-3 pl-9 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
      <p role="status" className="mt-2 text-[10px] text-slate-400">{loading ? 'Đang tải danh mục…' : `${filtered.length}/${catalog.length} dịch vụ · Đã chọn ${selected.length}`}</p>
    </div>
    {loading ? <p className="p-6 text-sm text-slate-400">Đang tải dịch vụ của cơ sở…</p> : unavailable ? <p className="p-6 text-sm leading-6 text-slate-500">Danh mục chưa khả dụng. Chọn Cập nhật phiếu để tải lại.</p> : catalog.length === 0 ? <p className="p-6 text-sm text-slate-500">Cơ sở chưa có dịch vụ trong danh mục.</p> : groups.length === 0 ? <div className="p-8 text-center"><p className="text-sm font-semibold text-slate-600">Không tìm thấy dịch vụ phù hợp</p><button type="button" onClick={() => setQuery('')} className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-blue-700">Xóa tìm kiếm</button></div> :
      <ul className="space-y-3 p-3 sm:p-4">{groups.map(group => {
        const services = filtered.filter(service => service.group === group);
        const categories = [...new Set(services.map(service => service.category))];
        return <li key={group}><details open className="rounded-xl border border-slate-200"><summary className="cursor-pointer rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-600">{group}<span className="ml-2 font-normal text-slate-400">({services.length})</span></summary><ul className="space-y-2 p-3">{categories.map(category => <li key={category}><details open><summary className="cursor-pointer rounded-lg px-2 py-2 text-xs font-semibold text-slate-500 focus-visible:outline-2 focus-visible:outline-blue-600">{category}</summary><ul className="ml-2 border-l border-slate-100 pl-2">{services.filter(service => service.category === category).map(service => {
          const checked = selected.includes(service.id);
          const assigned = blocked.has(service.id);
          return <li key={service.id}><label htmlFor={`cls-service-${service.id}`} className={`my-1 flex items-start gap-3 rounded-lg px-2 py-3 ${checked ? 'bg-blue-50' : 'hover:bg-slate-50'} ${!service.available || assigned && !checked ? 'text-slate-400' : 'cursor-pointer text-slate-700'}`}>
            <input id={`cls-service-${service.id}`} name="services" type="checkbox" checked={checked} disabled={!service.available || assigned && !checked} onChange={() => onToggle(service.id)} className="mt-0.5 size-4 shrink-0 accent-blue-700" />
            <span className="min-w-0 flex-1"><span className="block text-xs leading-5 font-medium">{service.name}</span><span className="mt-1 block font-mono text-[10px] text-slate-400">{service.code}</span><span className="mt-1 flex flex-wrap gap-1">{!service.available && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px]">Tạm ngưng</span>}{assigned && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] text-blue-600">Đã chỉ định</span>}{service.contrast && <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] text-amber-700">Có thuốc cản quang</span>}</span></span>
          </label></li>;
        })}</ul></details></li>)}</ul></details></li>;
      })}</ul>}
  </section>;
}
