import Link from 'next/link';
import { ArrowUpRight, Bell, CalendarClock, CreditCard, FlaskConical, MapPin, ShieldCheck, ShieldX } from 'lucide-react';
import type { PatientNotification } from '../types';
import { notificationHref, notificationLabel, notificationTime } from '../utils/notification-navigation';

export function NotificationIcon({ type }: { type: string }) {
  const [Icon, colors] = type === 'CLS_RESULT_AVAILABLE' ? [FlaskConical, 'bg-emerald-50 text-emerald-600']
    : type === 'RETURN_TO_ORIGINAL_ROOM' ? [MapPin, 'bg-blue-50 text-blue-600']
    : type === 'FOLLOW_UP_REMINDER' ? [CalendarClock, 'bg-violet-50 text-violet-600']
    : type === 'RECORD_ACCESS_GRANTED' ? [ShieldCheck, 'bg-emerald-50 text-emerald-600']
    : type === 'RECORD_ACCESS_REVOKED' ? [ShieldX, 'bg-slate-100 text-slate-600']
    : type === 'PAYMENT_REQUEST' ? [CreditCard, 'bg-amber-50 text-amber-600'] : [Bell, 'bg-blue-50 text-blue-600'];
  return <span className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl ${colors}`}><Icon aria-hidden="true" className="size-4.5" /></span>;
}
export function NotificationItem({ item, onOpen, selected = false, compact = false }: { item: PatientNotification; onOpen: (item: PatientNotification) => void; selected?: boolean; compact?: boolean }) {
  return <Link href={notificationHref(item)} data-notification-id={item.id} onClick={() => onOpen(item)} className={`group flex items-start gap-3 border-b border-slate-100 px-4 py-4 transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 ${selected ? 'bg-blue-100/60' : item.readAt ? 'bg-white' : 'bg-blue-50/40'}`}>
    <NotificationIcon type={item.type} /><span className="min-w-0 flex-1"><span className={`block text-sm leading-5 ${item.readAt ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>{item.title}</span><span className={`mt-1 block text-xs leading-5 text-slate-500 ${compact ? 'line-clamp-2' : ''}`}>{item.message}</span><span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-400"><span>{notificationLabel(item.type)}</span><span aria-hidden="true">·</span><time dateTime={item.createdAt}>{notificationTime(item.createdAt)}</time></span></span><span className="flex w-3 shrink-0 flex-col items-center gap-3 pt-1">{!item.readAt && <span className="size-2 rounded-full bg-blue-600" aria-label="Chưa đọc" />}<ArrowUpRight aria-hidden="true" className="size-3.5 text-slate-300 group-hover:text-blue-600" /></span>
  </Link>;
}
