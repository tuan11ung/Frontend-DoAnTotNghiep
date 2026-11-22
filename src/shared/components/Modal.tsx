'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  'aria-label': string;
  size?: 'sm' | 'md' | 'lg' | '2xl' | '3xl';
  panelClassName?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  dismissible?: boolean;
}

const widths = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

let scrollLocks = 0;
let previousOverflow = '';

/** Native modal semantics provide focus containment and restore focus on close. */
export function Modal({
  open, onClose, children, 'aria-label': label, size = '2xl',
  panelClassName, closeOnBackdrop = false, closeOnEscape = true, dismissible = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    if (scrollLocks++ === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    return () => {
      dialog.close();
      if (--scrollLocks === 0) document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      aria-modal="true"
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-4 text-inherit outline-none open:flex open:items-center open:justify-center backdrop:bg-slate-900/60 animate-in fade-in"
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible && closeOnEscape) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && dismissible && closeOnBackdrop) onClose();
      }}
    >
      <div className={twMerge('flex max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl', widths[size], panelClassName)}>
        {children}
      </div>
    </dialog>
  );
}
