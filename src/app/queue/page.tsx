import type { Metadata } from 'next';
import { Suspense } from 'react';
import { QueueDisplayScreen } from '@/src/features/queue-display/QueueDisplayScreen';
import { QUEUE_DEMO_FACILITIES } from '@/src/features/queue-display/data/queue-display-demo';

export const metadata: Metadata = {
  title: 'Bảng gọi số phòng khám | MedConnect',
  description: 'Màn hình danh sách chờ và gọi số trước cửa phòng khám.',
  robots: { index: false, follow: false },
};

export default function QueueDisplayPage() {
  return (
    <Suspense fallback={<div className="grid min-h-svh place-items-center bg-slate-50 text-slate-500" role="status">Đang tải bảng gọi số…</div>}>
      <QueueDisplayScreen facilities={QUEUE_DEMO_FACILITIES} />
    </Suspense>
  );
}
