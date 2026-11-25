export const receptionField = 'mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm disabled:bg-slate-100';
export const receptionButton = 'rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50';
export const receptionQrButton = 'flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50';
export const receptionCard = 'space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6';
export const receptionError = (error: unknown) => error instanceof Error ? error.message : 'Không thể xử lý yêu cầu. Vui lòng thử lại.';
