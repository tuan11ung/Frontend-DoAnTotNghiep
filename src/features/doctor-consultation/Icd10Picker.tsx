'use client';

import {Search, X} from 'lucide-react';
import {useEffect, useId, useRef, useState} from 'react';
import {consultationApi, type Icd10Choice} from './api/consultation-api';
import {DropdownOption, DropdownResults} from '@/src/shared/components/DropdownOptions';
import {SearchableDropdown} from '@/src/shared/components/SearchableDropdown';

export function Icd10Dropdown({selected, onSelect, disabled}: {
    selected?: { id: number; name: string };
    onSelect: (item: Icd10Choice) => void;
    disabled: boolean;
}) {
    return <SearchableDropdown
        label="Tìm mã hoặc tên bệnh ICD-10"
        placeholder="Chọn bệnh ICD-10"
        searchPlaceholder="Nhập mã hoặc tên bệnh ICD-10"
        value={selected ? String(selected.id) : ''}
        options={selected ? [{value: String(selected.id), label: selected.name}] : []}
        onChange={() => { /* Remote result buttons handle selection below. */
        }}
        disabled={disabled}
        renderResults={(query, close) => <Icd10DropdownResults query={query} selectedIds={selected ? [selected.id] : []}
                                                          disabled={disabled} onSelect={item => {
            onSelect(item);
            close();
        }}/>}
    />;
}

function Icd10DropdownResults({query, ...props}: {
    query: string; selectedIds: number[]; disabled: boolean; onSelect: (item: Icd10Choice) => void;
}) {
    const [keyword, setKeyword] = useState(query.trim());
    useEffect(() => {
        const timer = setTimeout(() => setKeyword(query.trim()), 300);
        return () => clearTimeout(timer);
    }, [query]);
    return query.trim() !== keyword ? <p role="status" className="p-3 text-sm">Đang tìm ICD-10…</p>
        : <Icd10Results key={keyword} keyword={keyword} {...props} />;
}

export function Icd10Picker({selectedIds, onSelect, disabled}: {
    selectedIds: number[];
    onSelect: (item: Icd10Choice) => void;
    disabled: boolean
}) {
    const [input, setInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const inputId = useId();
    const searchInput = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const timer = setTimeout(() => setKeyword(input.trim()), 300);
        return () => clearTimeout(timer);
    }, [input]);
    return <div className="space-y-2">
        <div className="relative">
            <Search aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500"/>
            <input id={inputId} ref={searchInput} maxLength={255} disabled={disabled} value={input}
                   onChange={e => setInput(e.target.value)} autoComplete="off"
                   placeholder="Nhập mã hoặc tên bệnh ICD-10…"
                   onKeyDown={e => {
                       if (e.key === 'Enter' && !e.nativeEvent.isComposing) e.preventDefault();
                   }}
                   className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 outline-none hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:opacity-50"/>
            {input && <button type="button" disabled={disabled} aria-label="Xóa từ khóa tìm ICD-10"
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600"
                              onClick={() => {
                                  setInput('');
                                  setKeyword('');
                                  searchInput.current?.focus();
                              }}><X aria-hidden="true" className="size-4"/></button>}
        </div>
        {!input.trim() && <p className="px-3 py-6 text-center text-sm text-slate-400">Kết quả tìm kiếm sẽ hiển thị ở đây</p>}
        {input.trim() && (input.trim() !== keyword
            ? <p role="status" className="px-3 py-2 text-sm text-slate-500">Đang tìm ICD-10…</p>
            : <Icd10Results key={keyword} keyword={keyword} selectedIds={selectedIds} onSelect={onSelect}
                            disabled={disabled}/>)}
    </div>;
}

function Icd10Results({keyword, selectedIds, onSelect, disabled}: {
    keyword: string;
    selectedIds: number[];
    onSelect: (item: Icd10Choice) => void;
    disabled: boolean
}) {
    const [items, setItems] = useState<Icd10Choice[]>([]);
    const [cursor, setCursor] = useState<number>();
    const [next, setNext] = useState<number>();
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [retry, setRetry] = useState(0);
    const root = useRef<HTMLDivElement>(null), sentinel = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const controller = new AbortController();
        Promise.resolve().then(() => {
            if (!controller.signal.aborted) {
                setLoading(true);
                setError('');
            }
        });
        consultationApi.icd10(keyword, cursor, controller.signal).then(data => {
            if (controller.signal.aborted) return;
            setItems(old => Array.from(new Map([...old, ...data.content].map(item => [item.id, item])).values()));
            setNext(data.nextCursor);
            setHasMore(data.hasMore);
        }).catch(e => {
            if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Không thể tải ICD-10.');
        })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [keyword, cursor, retry]);
    useEffect(() => {
        if (!hasMore || loading || error || !sentinel.current || !root.current || disabled) return;
        const observer = new IntersectionObserver(entries => {
            if (entries.some(e => e.isIntersecting) && next) setCursor(next);
        }, {root: root.current});
        observer.observe(sentinel.current);
        return () => observer.disconnect();
    }, [hasMore, loading, error, next, disabled]);
    return <DropdownResults ref={root} role="region" aria-label="Kết quả tìm ICD-10" aria-busy={loading}>
        <ul className="divide-y divide-slate-100">{items.map(item => {
            const selected = selectedIds.includes(item.id);
            return <li key={item.id}>
                <DropdownOption disabled={disabled || selected} selected={selected}
                    onClick={() => onSelect(item)} label={item.code} description={item.name}
                    emphasis="accent" status={selected ? 'Đã chọn' : undefined}
                    />
            </li>;
        })}</ul>
        {!loading && !error && !items.length && <p className="p-3 text-sm">Không tìm thấy mã phù hợp.</p>}
        {error && <p role="alert" className="p-3 text-sm text-rose-700">{error}
            <button type="button" onClick={() => setRetry(v => v + 1)}>Thử lại</button>
        </p>}
        <div ref={sentinel} className="p-2 text-center text-sm">{loading ?
            <span role="status">Đang tải ICD-10…</span> : hasMore && !error ?
                <button type="button" disabled={disabled} onClick={() => setCursor(next)}>Tải thêm
                    ICD-10</button> : null}</div>
    </DropdownResults>;
}
