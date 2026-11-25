import { useId, useRef } from 'react';
import { Menu, Pencil } from 'lucide-react';
import { DropdownOption } from '@/src/shared/components/DropdownOptions';
import { ToggleSwitch } from '@/src/shared/components/ToggleSwitch';

export function RoomActions({ name, active, onEdit, onToggle }: {
  name: string;
  active: boolean;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  return (
    <>
      <button type="button" popoverTarget={id} aria-label={`Thao tác phòng ${name}`}
        className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
        onClick={event => {
          const popup = panel.current;
          if (!popup) return;
          const anchor = event.currentTarget.getBoundingClientRect();
          popup.style.left = `${Math.max(8, Math.min(anchor.left, window.innerWidth - 184))}px`;
          const openAbove = window.innerHeight - anchor.bottom < 112;
          popup.style.top = openAbove ? 'auto' : `${anchor.bottom + 4}px`;
          popup.style.bottom = openAbove ? `${window.innerHeight - anchor.top + 4}px` : 'auto';
        }}><Menu aria-hidden="true" className="size-4" /></button>
      <div ref={panel} id={id} popover="auto" role="group" aria-label={`Thao tác phòng ${name}`}
        className="fixed inset-auto m-0 w-44 rounded-xl border border-slate-200 bg-white p-1 text-slate-700 shadow-lg">
        <DropdownOption label={<span className="flex items-center gap-2"><Pencil aria-hidden="true" className="size-4" />Sửa</span>}
          onClick={() => { panel.current?.hidePopover(); onEdit(); }} />
        <div className="flex items-center justify-between gap-2 px-2 py-2 text-sm">
          <span>Hoạt động</span>
          <ToggleSwitch checked={active} label={`Đổi trạng thái ${name}`} onChange={() => { panel.current?.hidePopover(); onToggle(); }} />
        </div>
      </div>
    </>
  );
}
