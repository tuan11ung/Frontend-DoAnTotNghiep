import type { ComponentPropsWithoutRef } from 'react';

export function PrimaryActionButton(props: Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'className'>) {
  return <button {...props} type="button" className="inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50" />;
}
