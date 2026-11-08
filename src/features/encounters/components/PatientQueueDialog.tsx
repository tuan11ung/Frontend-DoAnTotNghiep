import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { EncounterBadge, EncounterButton } from './EncounterControls';

export function PatientQueueDialog({ status, onClose, onOpen, notify }: { status: string; onClose: () => void; onOpen: () => void; notify: (message: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  return <dialog ref={ref} onCancel={onClose} aria-labelledby="queue-title" onClick={e => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_24px)] max-w-[850px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 shadow-2xl backdrop:bg-slate-900/60 sm:p-6"><div className="mb-5 flex items-start justify-between gap-3"><div><h2 id="queue-title" className="text-lg font-extrabold">Danh sách bệnh nhân · Phòng 203</h2><p className="mt-2 text-xs leading-6 text-slate-500">Bác sĩ tiếp tục khám bệnh nhân khác trong lúc chờ CLS.</p></div><EncounterButton onClick={onClose} aria-label="Đóng danh sách bệnh nhân"><X className="h-4 w-4" /></EncounterButton></div><div className="space-y-3"><div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div><strong className="text-[13px]">Nguyễn Văn A</strong><p className="mt-1 text-[11px] text-slate-500">BN00124 · Lượt khám hiện tại</p></div><EncounterBadge>{status}</EncounterBadge><EncounterButton onClick={onOpen}>Mở lại ca khám</EncounterButton></div><div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div><strong className="text-[13px]">Trần Thị B</strong><p className="mt-1 text-[11px] text-slate-500">STT 12 · Đang chờ khám</p></div><EncounterBadge tone="gray">Chờ khám</EncounterBadge><EncounterButton variant="primary" onClick={() => { onClose(); notify('Minh họa gọi bệnh nhân tiếp theo. Lượt khám hiện tại được giữ nguyên.'); }}>Gọi vào khám</EncounterButton></div></div><p className="mt-5 text-[11px] leading-6 text-slate-500">Danh sách minh họa, không thay đổi bệnh nhân thật hoặc lưu dữ liệu lên máy chủ.</p></dialog>;
}
