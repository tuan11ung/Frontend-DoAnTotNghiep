import { useId, type ButtonHTMLAttributes, type ReactNode } from 'react';

export function EncounterButton({ variant = 'default', className = '', type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'primary' | 'light' | 'danger' }) {
  const colors = variant === 'danger' ? 'border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700 focus-visible:outline-red-600' : variant === 'primary' ? 'border-medblue-brand bg-medblue-brand text-white hover:bg-medblue-600' : variant === 'light' ? 'border-medblue-200 bg-medblue-50 text-medblue-700 hover:bg-medblue-100' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50';
  return <button type={type} className={`inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-medblue-brand disabled:cursor-not-allowed disabled:opacity-50 ${colors} ${className}`} {...props} />;
}

export function EncounterBadge({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'green' | 'amber' | 'gray' }) {
  const colors = { blue: 'bg-medblue-50 text-medblue-700', green: 'bg-green-100 text-green-800', amber: 'bg-amber-100 text-amber-800', gray: 'bg-slate-100 text-slate-600' };
  return <span className={`inline-flex shrink-0 items-center rounded-md px-2 py-1 text-[10px] font-extrabold ${colors[tone]}`}>{children}</span>;
}

export function EncounterField({ label, value, placeholder, multiline = false, inputMode }: { label: string; value?: string; placeholder?: string; multiline?: boolean; inputMode?: 'decimal' | 'text' }) {
  const id = useId();
  const props = { id, name: id, defaultValue: value, placeholder, className: controlClass };
  return <div><label htmlFor={id} className="mb-2 block text-[11px] font-bold">{label}</label>{multiline ? <textarea {...props} rows={3} /> : <input {...props} inputMode={inputMode} />}</div>;
}

export const controlClass = 'w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-medblue-brand focus:ring-2 focus:ring-medblue-100';

export function EncounterSection({ title, children }: { title: ReactNode; children: ReactNode }) {
  return <section className="space-y-4 rounded-xl border border-slate-200 p-4 sm:p-[17px]"><h3 className="text-[13px] font-extrabold">{title}</h3>{children}</section>;
}
export function EncounterNotice({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-800">{children}</div>;
}
export function EncounterEmpty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-slate-200 p-5 text-center text-xs leading-6 text-slate-500">{children}</p>;
}
export function PanelHeading({ title, description }: { title: string; description: string }) {
  return <div><h2 className="text-lg font-extrabold text-slate-800">{title}</h2><p className="mt-1 text-[13px] leading-6 text-slate-500">{description}</p></div>;
}
