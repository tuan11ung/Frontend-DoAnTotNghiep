'use client';
import Link from 'next/link';
import { ReceiptText, ArrowUpRight } from 'lucide-react';
import { paymentsHref } from '../payment.types';
export function EncounterBillingLink({ profileId, encounterId }: { profileId: string; encounterId: string }) {
  return <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:px-6">
    <div className="min-w-0">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><ReceiptText aria-hidden="true" className="size-5 shrink-0 text-blue-700" />Viện phí lần khám</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">Xem tiền khám, chi phí từng đợt cận lâm sàng và lịch sử thanh toán.</p>
    </div>
    <Link href={paymentsHref(profileId, { encounter: encounterId })}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-700 px-3 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
      Xem hóa đơn &amp; thanh toán<ArrowUpRight aria-hidden="true" className="size-4" />
    </Link>
  </section>;
}
