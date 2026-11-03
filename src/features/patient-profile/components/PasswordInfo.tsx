'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { Feedback, Field, inputClass, primaryClass } from './ProfileFields';

async function digest(value: string) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}
export function PasswordInfo({ isPreview }: { isPreview: boolean }) {
  const passwordHash = useRef<string | null>(null);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPreview || busy) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const current = String(values.get('currentPassword') ?? '');
    const next = String(values.get('newPassword') ?? '');
    const confirmation = String(values.get('confirmPassword') ?? '');
    setError(''); setSuccess('');
    if (next.length < 8 || next.length > 255 || !/[a-zA-Z]/.test(next) || !/\d/.test(next)) { setError('Mật khẩu mới cần từ 8 đến 255 ký tự, có chữ và số.'); return; }
    if (next === current) { setError('Mật khẩu mới phải khác mật khẩu hiện tại.'); return; }
    if (next !== confirmation) { setError('Xác nhận mật khẩu chưa khớp.'); return; }
    setBusy(true);
    try {
      const expected = passwordHash.current ?? await digest('Demo@12345');
      if (await digest(current) !== expected) { setError('Mật khẩu hiện tại chưa đúng.'); return; }
      passwordHash.current = await digest(next);
      form.reset(); setVisible({});
      setSuccess('Đổi mật khẩu mô phỏng thành công. Mật khẩu thử chỉ có hiệu lực trong lần mở trang này; tài khoản thật chưa thay đổi.');
    } catch { setError('Không thể xử lý mật khẩu. Vui lòng thử lại.'); }
    finally { setBusy(false); }
  }
  return <section id="password" aria-labelledby="password-heading" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6"><span className="rounded-xl bg-amber-50 p-2.5 text-amber-600"><LockKeyhole className="size-5" /></span><div><h2 id="password-heading" className="font-bold text-slate-900">Đổi mật khẩu</h2><p className="mt-1 text-xs text-slate-500">Bảo vệ tài khoản của bạn</p></div></div>
    <form onSubmit={save} aria-label="Đổi mật khẩu" className="space-y-5 p-5 sm:p-6">
      <p className={`rounded-xl p-3.5 text-xs leading-relaxed ${isPreview ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-800'}`}>{isPreview ? <>Mô phỏng đổi mật khẩu · Mật khẩu hiện tại để thử: <strong>Demo@12345</strong>. Mật khẩu thử sẽ đặt lại khi tải lại trang.</> : 'Tính năng đổi mật khẩu đang chờ kết nối dịch vụ tài khoản. Bạn sẽ có thể sử dụng khi tính năng được kích hoạt.'}</p>
      <Feedback error={error} success={success} />
      <fieldset disabled={busy || !isPreview} className="grid gap-5 sm:grid-cols-2">
        {[{ id: 'currentPassword', label: 'Mật khẩu hiện tại', autoComplete: 'current-password' }, { id: 'newPassword', label: 'Mật khẩu mới', autoComplete: 'new-password' }, { id: 'confirmPassword', label: 'Xác nhận mật khẩu mới', autoComplete: 'new-password' }].map(({ id, label, autoComplete }, index) => <div key={id} className={index === 0 ? 'sm:col-span-2 sm:max-w-[calc(50%-0.625rem)]' : ''}><Field id={id} label={`${label} *`} hint={id === 'newPassword' ? 'Tối thiểu 8 ký tự, bao gồm chữ và số.' : undefined}><div className="relative"><input id={id} name={id} autoComplete={autoComplete} required maxLength={255} type={visible[id] ? 'text' : 'password'} className={`${inputClass} pr-12`} /><button type="button" aria-label={`${visible[id] ? 'Ẩn' : 'Hiện'} ${label.toLowerCase()}`} aria-pressed={!!visible[id]} className="absolute inset-y-0 right-0 rounded-lg px-3 text-slate-400 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600" onClick={() => setVisible(v => ({ ...v, [id]: !v[id] }))}>{visible[id] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></Field></div>)}
      </fieldset><div className="flex justify-end border-t border-slate-100 pt-5"><button type="submit" disabled={busy || !isPreview} className={primaryClass}><LockKeyhole className="size-4" />{busy ? 'Đang cập nhật…' : 'Cập nhật mật khẩu'}</button></div>
    </form>
  </section>;
}
