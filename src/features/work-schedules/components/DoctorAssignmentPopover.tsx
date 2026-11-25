'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { LockKeyhole, Stethoscope, Trash2, X } from 'lucide-react';
import { DropdownOption, DropdownResults } from '@/src/shared/components/DropdownOptions';
import type { DoctorAssignmentOption, WorkScheduleWeek } from '../types';

interface DoctorAssignmentPopoverProps {
  trigger: HTMLButtonElement;
  roomName: string;
  dateAndShift: string;
  doctorName: string | null;
  status?: string;
  rooms: WorkScheduleWeek['rooms'];
  options: DoctorAssignmentOption[];
  selectedDoctorId: number | null;
  published: boolean;
  loading: boolean;
  error: string;
  onRetry: () => void;
  onSelect: (doctorId: number | null) => void;
  onClose: () => void;
}

function getPopoverPosition(trigger: HTMLButtonElement) {
  const rect = trigger.getBoundingClientRect();
  const width = Math.min(304, window.innerWidth - 32);
  const left = Math.max(16, Math.min(rect.left, window.innerWidth - width - 16));
  const spaceBelow = window.innerHeight - rect.bottom - 24;
  const below = spaceBelow >= 320 || spaceBelow >= rect.top - 24;
  const maxHeight = Math.max(120, Math.min(420, below ? spaceBelow : rect.top - 24));

  return { left, width, maxHeight, ...(below ? { top: rect.bottom + 8 } : { bottom: window.innerHeight - rect.top + 8 }) };
}

export function DoctorAssignmentPopover({ trigger, roomName, dateAndShift, doctorName, status, rooms, loading, error, onRetry, options, selectedDoctorId, onSelect, onClose, published }: DoctorAssignmentPopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(() => getPopoverPosition(trigger));
  const priority = (doctor: DoctorAssignmentOption) => doctor.id === selectedDoctorId ? 0 : doctor.disabled ? 2 : 1;
  const orderedOptions = [...options].sort((first, second) => priority(first) - priority(second));
  const roomsByCode = new Map(rooms.map(room => [room.code, room.name]));

  useEffect(() => {
    panelRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !panelRef.current?.contains(event.target) && !trigger.contains(event.target)) onClose();
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const reposition = () => setPosition(getPopoverPosition(trigger));

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      trigger.focus({ preventScroll: true });
    };
  }, [trigger, onClose]);

  const handleTab = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const buttons = panelRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
    if (!buttons?.length) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div aria-labelledby="doctor-assignment-title" className="fixed z-[60] flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_40px_-8px_rgba(15,23,42,0.25)]" id="doctor-assignment-popover" onKeyDown={handleTab} ref={panelRef} role="dialog" style={position}>
      <div className="flex shrink-0 items-start gap-2 border-b border-slate-100 px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900" id="doctor-assignment-title">{selectedDoctorId === null ? 'Phân công bác sĩ' : 'Đổi bác sĩ'}</h3>
          <p className="mt-1 text-sm font-medium text-slate-800 [overflow-wrap:anywhere]">{roomName}</p>
          <p className="mt-0.5 text-xs leading-5 text-slate-600">{dateAndShift}</p>
          {(status || doctorName) && <p className="mt-1 text-xs leading-5 text-slate-600 [overflow-wrap:anywhere]">{[doctorName, status].filter(Boolean).join(' · ')}</p>}
          {published && <p className="mt-1 text-xs leading-5 font-medium text-amber-800">Đổi bác sĩ hoặc bỏ phân công sẽ áp dụng ngay sau khi xác nhận.</p>}
        </div>
        <button aria-label="Đóng danh sách bác sĩ" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medblue-500" onClick={onClose} type="button"><X aria-hidden="true" className="h-4 w-4" /></button>
      </div>
      <DropdownResults className="min-h-0 rounded-none border-0 p-2 shadow-none" maxHeight="none">
        {loading && <p className="px-3 py-4 text-sm text-slate-500" role="status">Đang tải danh sách bác sĩ…</p>}
        {error && <div className="space-y-2 px-3 py-3 text-sm text-rose-700" role="alert"><p>{error}</p><button className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold" onClick={onRetry} type="button">Thử lại</button></div>}
        {!loading && !error && !options.length && <p className="px-3 py-4 text-sm text-slate-500">Chưa có bác sĩ phù hợp trong chuyên khoa.</p>}
        {!loading && !error && orderedOptions.map((doctor) => (
          <DropdownOption key={doctor.id} className="min-h-11 px-2.5 py-2" data-doctor-option disabled={doctor.disabled}
            label={<span className="flex items-center gap-2"><Stethoscope aria-hidden="true" className="size-4 shrink-0 text-medblue-600" />{doctor.name}</span>}
            description={doctor.assignedRoom ? `Đã phân công tại ${roomsByCode.get(doctor.assignedRoom) ?? doctor.assignedRoom}` : doctor.disabled ? 'Không khả dụng' : undefined}
            trailing={doctor.assignedRoom ? <LockKeyhole aria-hidden="true" className="size-4 shrink-0 text-slate-500" /> : undefined}
            selected={doctor.id === selectedDoctorId} onClick={() => onSelect(doctor.id)} />
        ))}
      </DropdownResults>
      {selectedDoctorId !== null && <div className="shrink-0 border-t border-slate-100 p-2"><button className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-50" disabled={loading || Boolean(error)} onClick={() => onSelect(null)} type="button"><Trash2 aria-hidden="true" className="h-3.5 w-3.5" />Bỏ phân công ca này</button></div>}
    </div>,
    document.body,
  );
}
