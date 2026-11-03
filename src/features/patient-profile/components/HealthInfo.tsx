'use client';

import { useState, type FormEvent } from 'react';
import { HeartPulse, LockKeyhole, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { canEditHealth, type Allergy, type Condition, type ProfileData } from '../profile.types';
import type { ProfileActions } from '../use-profile';
import { Feedback, Field, inputClass, primaryClass, secondaryClass } from './ProfileFields';

type Editor = { kind: 'allergies'; entry?: Allergy; type?: Allergy['type'] } | { kind: 'conditions'; entry?: Condition };
export function HealthInfo({ data, actions }: { data: ProfileData; actions: ProfileActions }) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [deleting, setDeleting] = useState<{ kind: 'allergies' | 'conditions'; entry: Allergy | Condition } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const open = (value: Editor) => { setEditor(value); setDeleting(null); setError(''); setSuccess(''); };
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor || busy) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get('healthName') ?? '').trim();
    if (!name || name.length > 255) { setError('Vui lòng nhập tên hợp lệ, tối đa 255 ký tự.'); return; }
    const yearText = String(form.get('diagnosedYear') ?? '');
    const year = yearText ? Number(yearText) : null;
    if (editor.kind === 'conditions' && year !== null && (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear())) { setError('Năm phát hiện phải từ 1900 đến năm hiện tại.'); return; }
    setBusy(true); setError(''); setSuccess('');
    try {
      if (editor.kind === 'allergies') await actions.saveAllergy({ id: editor.entry?.id, name, type: String(form.get('allergyType')) as Allergy['type'], reaction: String(form.get('reaction') ?? '').trim() || null });
      else await actions.saveCondition({ id: editor.entry?.id, name, diagnosedYear: year, recovered: form.get('recovered') === 'on' });
      setEditor(null); setSuccess('Đã lưu khai báo sức khỏe.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể lưu khai báo.'); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!deleting || busy) return;
    setBusy(true); setError(''); setSuccess('');
    try { await actions.deleteHealth(deleting.kind, deleting.entry.id); setDeleting(null); setSuccess('Đã xóa khai báo sức khỏe.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không thể xóa khai báo.'); }
    finally { setBusy(false); }
  }
  const groups = [
    { title: 'Dị ứng thuốc', type: 'DRUG' as const, items: data.allergies.filter(a => a.type === 'DRUG') },
    { title: 'Dị ứng thực phẩm', type: 'FOOD' as const, items: data.allergies.filter(a => a.type === 'FOOD') },
    ...(data.allergies.some(a => a.type === 'OTHER') ? [{ title: 'Dị ứng khác', type: 'OTHER' as const, items: data.allergies.filter(a => a.type === 'OTHER') }] : []),
  ];
  function renderEntry(entry: Allergy | Condition, kind: 'allergies' | 'conditions') {
    const editable = canEditHealth(entry);
    return <li key={entry.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold text-slate-800">{entry.name}</p>
        {'reaction' in entry && <p className="mt-1 text-xs leading-relaxed text-slate-500">Biểu hiện: {entry.reaction || 'Chưa khai báo'}</p>}
        {'recovered' in entry && <p className="mt-1 text-xs text-slate-500">{entry.diagnosedYear ? `Phát hiện năm ${entry.diagnosedYear} · ` : ''}{entry.recovered ? 'Đã khỏi / ổn định theo khai báo' : 'Đang theo dõi'}</p>}
        <span className={`mt-2 inline-flex items-center gap-1 text-[11px] font-medium ${editable ? 'text-slate-500' : 'text-emerald-700'}`}>{editable ? 'Tự khai báo' : <><ShieldCheck className="size-3.5" />{entry.verified ? 'Đã được xác minh' : 'Ghi nhận bởi bác sĩ'}</>}</span>
      </div>
      {editable ? <div className="flex gap-1"><button type="button" disabled={busy} aria-label={`Sửa ${entry.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600" onClick={() => open(kind === 'allergies' ? { kind, entry: entry as Allergy } : { kind, entry: entry as Condition })}><Pencil className="size-4" /></button><button type="button" disabled={busy} aria-label={`Xóa ${entry.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-rose-600" onClick={() => { setDeleting({ kind, entry }); setEditor(null); setError(''); setSuccess(''); }}><Trash2 className="size-4" /></button></div>
        : <LockKeyhole aria-label="Cơ sở y tế quản lý" className="mt-1 size-4 shrink-0 text-emerald-600" />}
    </li>;
  }
  return <section id="health" aria-labelledby="health-heading" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6"><span className="rounded-xl bg-rose-50 p-2.5 text-rose-500"><HeartPulse className="size-5" /></span><div><h2 id="health-heading" className="font-bold text-slate-900">Thông tin sức khỏe</h2><p className="mt-1 text-xs text-slate-500">Giúp cơ sở y tế hiểu rõ hơn về bạn</p></div></div>
    <div className="space-y-6 p-5 sm:p-6"><p className="rounded-xl bg-blue-50 p-3.5 text-xs leading-relaxed text-blue-700">Bạn có thể cập nhật các thông tin tự khai báo. Thông tin do bác sĩ ghi nhận hoặc đã xác minh cần được cơ sở y tế cập nhật.</p><Feedback error={error} success={success} />
      {groups.map(group => <div key={group.type}><div className="mb-3 flex items-center justify-between gap-2"><h3 className="text-sm font-semibold text-slate-800">{group.title} <span className="ml-1 text-xs font-normal text-slate-400">({group.items.length})</span></h3><button type="button" disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600" aria-label={`Thêm ${group.title.toLowerCase()}`} onClick={() => open({ kind: 'allergies', type: group.type })}><Plus className="size-3.5" />Thêm</button></div>{group.items.length ? <ul className="space-y-2">{group.items.map(a => renderEntry(a, 'allergies'))}</ul> : <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">Chưa khai báo {group.title.toLowerCase()}.</p>}</div>)}
      <div className="border-t border-slate-100 pt-5"><div className="mb-3 flex items-center justify-between gap-2"><h3 className="text-sm font-semibold text-slate-800">Bệnh mạn tính <span className="ml-1 text-xs font-normal text-slate-400">({data.conditions.length})</span></h3><button type="button" disabled={busy} aria-label="Thêm bệnh mạn tính" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600" onClick={() => open({ kind: 'conditions' })}><Plus className="size-3.5" />Thêm</button></div>{data.conditions.length ? <ul className="space-y-2">{data.conditions.map(c => renderEntry(c, 'conditions'))}</ul> : <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">Chưa khai báo bệnh mạn tính.</p>}</div>
      {editor && <form key={`${editor.kind}-${editor.entry?.id ?? 'new'}-${editor.kind === 'allergies' ? editor.type : ''}`} onSubmit={save} aria-label="Khai báo sức khỏe" className="space-y-4 rounded-xl border border-blue-200 bg-blue-50/40 p-4"><h3 className="font-semibold text-slate-800">{editor.entry ? 'Chỉnh sửa' : 'Thêm'} {editor.kind === 'allergies' ? 'dị ứng' : 'bệnh mạn tính'}</h3><fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Field label={editor.kind === 'allergies' ? 'Tên thuốc / thực phẩm gây dị ứng *' : 'Tên bệnh *'} id="healthName"><input autoFocus id="healthName" name="healthName" required maxLength={255} defaultValue={editor.entry?.name ?? ''} className={inputClass} /></Field></div>
        {editor.kind === 'allergies' ? <><Field label="Loại dị ứng" id="allergyType"><select id="allergyType" name="allergyType" className={inputClass} defaultValue={editor.entry?.type ?? editor.type ?? 'DRUG'}><option value="DRUG">Thuốc</option><option value="FOOD">Thực phẩm</option><option value="OTHER">Khác</option></select></Field><Field label="Biểu hiện dị ứng" id="reaction"><input id="reaction" name="reaction" maxLength={255} defaultValue={editor.entry?.reaction ?? ''} placeholder="Ví dụ: nổi mẩn, ngứa…" className={inputClass} /></Field></>
          : <><Field label="Năm phát hiện" id="diagnosedYear"><input id="diagnosedYear" name="diagnosedYear" type="number" min={1900} max={new Date().getFullYear()} defaultValue={editor.entry?.diagnosedYear ?? ''} placeholder="Ví dụ: 2023" className={inputClass} /></Field><label className="flex items-center gap-2 self-center text-sm text-slate-700"><input type="checkbox" name="recovered" defaultChecked={editor.entry?.recovered ?? false} className="size-4 accent-blue-600" />Đã khỏi</label></>}
      </fieldset><div className="flex flex-wrap justify-end gap-2"><button type="button" disabled={busy} className={secondaryClass} onClick={() => { setEditor(null); setError(''); }}>Hủy</button><button type="submit" disabled={busy} className={primaryClass}>{busy ? 'Đang lưu…' : 'Lưu khai báo'}</button></div></form>}
      {deleting && <div role="group" aria-label="Xác nhận xóa khai báo" className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4"><p className="break-words text-sm text-slate-700">Xóa khai báo <strong>{deleting.entry.name}</strong>?</p><div className="flex flex-wrap gap-2"><button autoFocus type="button" disabled={busy} className={secondaryClass} onClick={() => { setDeleting(null); setError(''); }}>Giữ lại</button><button type="button" disabled={busy} onClick={remove} className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">{busy ? 'Đang xóa…' : 'Xác nhận xóa'}</button></div></div>}
    </div>
  </section>;
}
