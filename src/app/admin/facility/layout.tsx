import { Suspense, type ReactNode } from 'react';

export default function FacilityAdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f4f7f7] text-sm text-slate-600" role="status">Đang tải trang quản trị cơ sở...</div>}>
      {children}
    </Suspense>
  );
}
