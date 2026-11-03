'use client';
import Link from 'next/link';
import { ReceiptText, ArrowUpRight } from 'lucide-react';
import { paymentsHref } from '../payment.types';
export function EncounterBillingLink({ profileId, encounterId }: { profileId: string; encounterId: string }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><span className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-600"><ReceiptText className="size-6" /></span><h2 className="text-base font-bold text-slate-900">Hóa đơn &amp; thanh toán của ca khám</h2><p className="mt-2 text-xs leading-6 text-slate-500">Xem chi phí khám, dịch vụ cận lâm sàng, thuốc và giảm trừ. Quản lý thanh toán, giao dịch và biên lai tại một nơi.</p><Link href={paymentsHref(profileId, { encounter: encounterId })} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-xs font-semibold text-white hover:bg-blue-700">Xem hóa đơn &amp; thanh toán<ArrowUpRight className="size-4" /></Link></section>;
}
