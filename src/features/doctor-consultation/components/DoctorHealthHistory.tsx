'use client';

import {businessNow} from '@/src/shared/lib/business-time';

import {Modal} from '@/src/shared/components/Modal';
import {X} from 'lucide-react';
import {ToastMessage} from '@/src/shared/components/ToastMessage';
import {type FormEvent, useEffect, useRef, useState} from 'react';
import {type ClinicalAllergy, type ClinicalCondition, consultationApi} from '../api/consultation-api';
import {clinicalButton, clinicalEmpty, clinicalField, clinicalGhostButton} from './clinical-ui';
import {ProfileSection} from './ProfileSection';
import {ScrollableTable} from '@/src/shared/components/ScrollableTable';
import {Icd10Dropdown} from '../Icd10Picker';

type Editor = { kind: 'allergy'; entry?: ClinicalAllergy } | { kind: 'condition'; entry?: ClinicalCondition };
const types: Record<string, string> = {DRUG: 'Thuốc', FOOD: 'Thực phẩm', OTHER: 'Khác'};

function IngredientSearch({disabled, onSelect}: {
    disabled: boolean;
    onSelect: (item: { id: number; name: string }) => void
}) {
    const [query, setQuery] = useState(''), [data, setData] = useState<{
        id: number;
        name: string
    }[]>([]), [error, setError] = useState('');
    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            consultationApi.ingredients(query.trim(), controller.signal).then(p => {
                if (!controller.signal.aborted) {
                    setData(p.content);
                    setError('');
                }
            }).catch(() => {
                if (!controller.signal.aborted) {
                    setData([]);
                    setError('Không tải được hoạt chất. Bạn vẫn có thể ghi nhận theo tên.');
                }
            });
        }, 300);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);
    return <div className="space-y-2"><label className="text-sm">Tra hoạt chất gây dị ứng (không bắt buộc)<input
        disabled={disabled} value={query} onChange={e => {
        setQuery(e.target.value);
        setData([]);
    }} maxLength={255} className={clinicalField}/></label><p className="text-xs text-slate-500">Chọn hoạt chất khi biết
        rõ để hỗ trợ đối chiếu khi kê đơn.</p>{error && <p role="status" className="text-xs">{error}</p>}
        <ul className="max-h-36 overflow-auto">{data.map(item => <li key={item.id}>
            <button type="button" disabled={disabled} className="w-full rounded p-2 text-left text-sm hover:bg-blue-100"
                    onClick={() => onSelect(item)}>{item.name}</button>
        </li>)}</ul>
    </div>;
}

export function DoctorHealthHistory({
                                        patientId,
                                        allergies,
                                        conditions,
                                        editable,
                                        onAllergy,
                                        onCondition,
                                        onDirtyChange
                                    }: {
    patientId: number;
    allergies: ClinicalAllergy[];
    conditions: ClinicalCondition[];
    editable: boolean;
    onAllergy: (entry: ClinicalAllergy) => void;
    onCondition: (entry: ClinicalCondition) => void;
    onDirtyChange: (dirty: boolean) => void;
}) {
    const [editor, setEditor] = useState<Editor | null>(null), [busy, setBusy] = useState(false);
    const [error, setError] = useState(''), [notice, setNotice] = useState('');
    const [selection, setSelection] = useState<{ id: number; name: string }>();
    const [allergyType, setAllergyType] = useState('DRUG');
    const lock = useRef(false);
    useEffect(() => {
        onDirtyChange(editor !== null);
        return () => onDirtyChange(false);
    }, [editor, onDirtyChange]);

    function open(value: Editor) {
        setError('');
        setNotice('');
        setSelection(undefined);
        setAllergyType(value.kind === 'allergy' ? value.entry?.type || 'DRUG' : 'DRUG');
        setEditor(value);
    }

    function closeEditor() {
        if (lock.current) return;
        setEditor(null);
        setError('');
    }

    async function save(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editor || !editable || lock.current) return;
        const form = new FormData(e.currentTarget), name = String(form.get('name') || '').trim();
        const note = String(form.get('note') || '').trim();
        if (note.length > 200) {
            setError('Ghi chú không được vượt quá 200 ký tự.');
            return;
        }
        if (!name) {
            setError('Nhập tên trước khi lưu.');
            return;
        }
        const year = String(form.get('year') || ''), yearValue = year ? Number(year) : null;
        if (editor.kind === 'condition' && yearValue !== null && (!Number.isInteger(yearValue) || yearValue < 1900 || yearValue > businessNow().getFullYear())) {
            setError('Năm phát hiện phải từ 1900 đến năm hiện tại.');
            return;
        }
        lock.current = true;
        setBusy(true);
        setError('');
        setNotice('');
        try {
            if (editor.kind === 'allergy') {
                const type = String(form.get('type')), reaction = String(form.get('reaction') || '').trim();
                const saved = await consultationApi.saveAllergy({
                    id: editor.entry?.id,
                    patientId,
                    name,
                    type,
                    reaction: reaction || null,
                    note: note || null,
                    ingredientId: type === 'DRUG' ? selection?.id ?? editor.entry?.ingredientId : null
                });
                if (saved.patientId !== patientId) throw Error('Phản hồi không thuộc bệnh nhân đang khám.');
                onAllergy(saved);
            } else {
                const saved = await consultationApi.saveCondition({
                    id: editor.entry?.id,
                    patientId,
                    name,
                    icd10Id: selection?.id ?? editor.entry?.icd10Id,
                    diagnosedYear: yearValue,
                    recovered: form.get('recovered') === 'on',
                    note: note || null
                });
                if (saved.patientId !== patientId) throw Error('Phản hồi không thuộc bệnh nhân đang khám.');
                onCondition(saved);
            }
            setEditor(null);
            setNotice('Đã lưu và xác minh thông tin sức khỏe.');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Không thể lưu thông tin.');
        } finally {
            lock.current = false;
            setBusy(false);
        }
    }

    function form(kind: Editor['kind']) {
        if (editor?.kind !== kind) return null;
        const entry = editor.entry;
        const linked = !!selection || kind === 'allergy' && entry && 'ingredientId' in entry && !!entry.ingredientId || kind === 'condition' && entry && 'icd10Id' in entry && !!entry.icd10Id;
        return <form key={kind + ':' + (entry?.id || 'new')}
                     aria-label={kind === 'allergy' ? 'Thêm hoặc xác minh dị ứng' : 'Thêm hoặc xác minh tiền sử'}
                     className="space-y-4 overflow-y-auto p-5 sm:p-6" onSubmit={save}>
            <fieldset disabled={busy || !editable} className="grid gap-3 sm:grid-cols-2">
                <label
                    className="text-sm sm:col-span-2">{kind === 'allergy' ? 'Tên thuốc / thực phẩm / tác nhân' : 'Tên bệnh'}<input
                    autoFocus key={selection?.id || entry?.id || "new"} name="name" required maxLength={255}
                    defaultValue={selection?.name || entry?.name} readOnly={!!linked}
                    className={clinicalField}/>{linked &&
                    <span className="text-xs text-slate-500">Tên đã liên kết danh mục; bản ghi này giữ liên kết khi xác minh.</span>}
                </label>
                {kind === 'allergy' ? <><label className="text-sm">Loại dị ứng<select name="type" value={allergyType}
                                                                                      onChange={e => {
                                                                                          setAllergyType(e.target.value);
                                                                                          setSelection(undefined);
                                                                                      }}
                                                                                      className={clinicalField}>{Object.entries(types).map(([id, name]) =>
                    <option key={id} value={id}>{name}</option>)}</select></label><label className="text-sm">Biểu hiện /
                    phản ứng<input name="reaction" maxLength={255}
                                   defaultValue={entry && 'reaction' in entry ? entry.reaction || '' : ''}
                                   className={clinicalField}/></label></> : <>
                    <label className="text-sm">Năm phát hiện<input name="year" type="number" min={1900}
                                                                   max={businessNow().getFullYear()}
                                                                   defaultValue={entry && 'diagnosedYear' in entry ? entry.diagnosedYear || '' : ''}
                                                                   className={clinicalField}/></label>
                    <label className="flex items-center gap-2 text-sm"><input name="recovered" type="checkbox"
                                                                              defaultChecked={entry && 'recovered' in entry ? entry.recovered : false}/>Đã
                        khỏi</label></>}
                {!entry && <div className="sm:col-span-2">{kind === "allergy" ? allergyType === "DRUG" &&
                    <IngredientSearch disabled={busy || !editable} onSelect={setSelection}/> :
                    <Icd10Dropdown selected={selection} disabled={busy || !editable}
                                   onSelect={setSelection}/>} {selection &&
                    <p className="mt-2 text-sm">Đã chọn: {selection.name}
                        <button type="button" className="text-blue-700 underline"
                                onClick={() => setSelection(undefined)}>Bỏ chọn
                        </button>
                    </p>}</div>}
                <label className="text-sm sm:col-span-2">Ghi chú (tối đa 200 ký tự)
                    <textarea name="note" maxLength={200} rows={3} defaultValue={entry?.note ?? ''}
                              className={clinicalField}/>
                </label>
                <p className="text-xs text-slate-600 sm:col-span-2">Chỉ xác minh sau khi đối chiếu với người bệnh hoặc
                    tài liệu y tế.</p>
                <div className="flex gap-3 sm:col-span-2">
                    <button className={clinicalButton}>{busy ? 'Đang lưu…' : 'Lưu và xác minh'}</button>
                    <button type="button" className={clinicalGhostButton} onClick={closeEditor}>Hủy
                    </button>
                </div>
            </fieldset>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        </form>;
    }

    const locked = !editable || busy || editor !== null;
    const sourceLabel = (s?: string) => s === 'DOCTOR' ? 'Bác sĩ ghi nhận' : s === 'PATIENT' ? 'Người bệnh khai báo' : s;
    const badge = (verified?: boolean, source?: string) => <>
        <span className={'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ' + (verified ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800')}>
            {verified ? '✓ Đã xác minh' : 'Chưa xác minh'}
        </span>
        {source && <span className="text-xs text-slate-500">{sourceLabel(source)}</span>}
    </>;
    const scrollArea = 'h-[22rem] lg:h-[34rem] pr-1 [scrollbar-gutter:stable]';
    const sortedAllergies = [...allergies].sort((a, b) => Number(!!a.verified) - Number(!!b.verified));
    const header = (title: string, addLabel: string, onAdd: () => void) =>
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">{title}
            </h2>
            <button type="button" className={clinicalGhostButton} disabled={locked} onClick={onAdd}>{addLabel}</button>
        </div>;
    // Bệnh đang theo dõi lên trước, bệnh đã khỏi xuống sau
    const sortedConditions = [...conditions].sort((a, b) => Number(a.recovered) - Number(b.recovered));

    return <ProfileSection>
        <ToastMessage message={notice} onDismiss={() => setNotice('')}/>
        <div aria-label="Dị ứng và tiền sử bệnh" className="grid items-start gap-5 divide-y divide-slate-300 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            <section className="min-w-0 space-y-3 lg:pr-5" aria-label="Dị ứng">
                {header('Dị ứng', '+ Thêm', () => open({kind: 'allergy'}))}
                <ScrollableTable label="Danh sách dị ứng" maxHeight="none" stickyHeader={false} className={scrollArea}>
                {!allergies.length && <p className={clinicalEmpty}>Chưa có khai báo dị ứng. Không đồng nghĩa không dị ứng.</p>}
                <ul className="space-y-2">{sortedAllergies.map(a =>
                    <li key={a.id} className="flex min-h-[92px] items-start justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/40 p-3 text-sm">
                        <div className="min-w-0 space-y-1 break-words">
                            <p className="font-semibold">{a.name}
                                <span className="ml-2 rounded bg-white px-1.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">{types[a.type] || a.type}</span>
                            </p>
                            <p className="text-slate-600">{a.reaction || 'Chưa cung cấp biểu hiện'}</p>
                            {a.note && <p className="whitespace-pre-wrap break-words text-slate-600">Ghi chú: {a.note}</p>}
                            <div className="flex flex-wrap items-center gap-2">{badge(a.verified, a.source)}</div>
                        </div>
                        <button type="button" disabled={locked} className={clinicalGhostButton}
                                onClick={() => open({kind: 'allergy', entry: a})}>{a.verified ? 'Cập nhật' : 'Xác minh'}</button>
                    </li>)}
                </ul>
                </ScrollableTable>
            </section>

            <section className="min-w-0 space-y-3 pt-5 lg:pt-0" aria-label="Tiền sử bệnh">
                {header('Tiền sử bệnh', '+ Thêm', () => open({kind: 'condition'}))}
                <ScrollableTable label="Danh sách tiền sử bệnh" maxHeight="none" stickyHeader={false} className={scrollArea}>
                {!conditions.length && <p className={clinicalEmpty}>Chưa có khai báo tiền sử bệnh.</p>}
                <ul className="space-y-2">{sortedConditions.map(c =>
                    <li key={c.id} className={'flex min-h-[92px] items-start justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm ' + (c.recovered ? 'bg-slate-50 opacity-75' : 'bg-white')}>
                        <div className="min-w-0 space-y-1 break-words">
                            <p className="font-semibold">{c.name}
                                <span className={'ml-2 rounded px-1.5 py-0.5 text-xs font-medium ' + (c.recovered ? 'bg-slate-200 text-slate-600' : 'bg-blue-50 text-blue-700')}>
                                    {c.recovered ? 'Đã khỏi' : 'Đang theo dõi'}</span>
                            </p>
                            <p className="text-slate-600">{c.diagnosedYear ? 'Phát hiện năm ' + c.diagnosedYear : 'Chưa có năm phát hiện'}</p>
                            {c.note && <p className="whitespace-pre-wrap break-words text-slate-600">Ghi chú: {c.note}</p>}
                            <div className="flex flex-wrap items-center gap-2">{badge(c.verified, c.source)}</div>
                        </div>
                        <button type="button" disabled={locked} className={clinicalGhostButton}
                                onClick={() => open({kind: 'condition', entry: c})}>{c.verified ? 'Cập nhật' : 'Xác minh'}</button>
                    </li>)}
                </ul>
                </ScrollableTable>
            </section>
        </div>
        <Modal open={editor !== null} onClose={closeEditor} dismissible={!busy}
               aria-label={`${editor?.entry ? 'Kiểm tra và xác minh' : 'Thêm'} ${editor?.kind === 'allergy' ? 'dị ứng' : 'tiền sử bệnh'}`} size="2xl">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-bold">{editor?.entry ? 'Kiểm tra và xác minh' : 'Thêm'} {editor?.kind === 'allergy' ? 'dị ứng' : 'tiền sử bệnh'}</h2>
                <button type="button" aria-label="Đóng" disabled={busy} onClick={closeEditor}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X className="size-5" aria-hidden="true"/></button>
            </div>
            {editor && form(editor.kind)}
        </Modal>
    </ProfileSection>;
}
