'use client';

import { FlaskConical, House } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ClinicalAccountMenu } from '@/src/shared/components/layout/ClinicalAccountMenu';
import { WorkspaceHeader } from '@/src/shared/components/layout/WorkspaceHeader';
import { ReceptionAppointments } from './components/ReceptionAppointments';
import { ReceptionAppointmentList } from './components/ReceptionAppointmentList';
import { ReceptionRegistration } from './components/ReceptionRegistration';
import { ReceptionBilling } from './components/ReceptionBilling';
import { ReceptionDemoControls } from './components/ReceptionDemoControls';
import { useReceptionData } from './ReceptionDataProvider';
import { RECEPTION_PREVIEW_ENABLED } from './api/reception-preview-api';
import { ReceptionSidebar, RECEPTION_SECTIONS as sections, type ReceptionSection } from './components/ReceptionSidebar';
import './reception.css';

export function ReceptionLiveScreen({ section }: { section?: ReceptionSection }) {
  const params = useSearchParams();
  const { demo } = useReceptionData();
  const [revision, setRevision] = useState(0);
  const requestedTab = section ?? params.get('tab');
  const tab: ReceptionSection = requestedTab === 'patients' ? 'registration' : sections.find(section => section.id === requestedTab)?.id ?? 'registration';
  const title = sections.find(section => section.id === tab)?.label ?? 'Đăng ký tại quầy';
  const accountLinks = [{ href: '/', label: 'Trang chủ', Icon: House }];
  if (RECEPTION_PREVIEW_ENABLED) {
    const modeParams = new URLSearchParams(params.toString());
    modeParams.set('tab', tab);
    if (demo) modeParams.delete('demo');
    else modeParams.set('demo', '1');
    accountLinks.push({
      href: `/reception?${modeParams}`,
      label: demo ? 'Thoát chế độ demo' : 'Thử với dữ liệu demo',
      Icon: FlaskConical,
    });
  }
  return <div className="reception-portal min-h-screen bg-slate-50 text-slate-800 lg:pl-[280px]">
    <ReceptionSidebar activeSection={tab} />
    <div className="min-w-0">
    <WorkspaceHeader workspace="Tiếp đón" section={title}>
      <ClinicalAccountMenu previewName={demo ? 'Lễ tân demo' : undefined} additionalLinks={accountLinks} />
    </WorkspaceHeader>
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <h1 className="mb-2 text-2xl font-extrabold text-slate-900">{title}</h1>
      <p className="mb-6 text-sm text-slate-500">{tab === 'checkout' ? 'Tra cứu hóa đơn, đối chiếu thông tin bệnh nhân và thực hiện thu tiền khám, dịch vụ cận lâm sàng.' : tab === 'checkin' ? 'Tra cứu và tiếp nhận bệnh nhân đã đặt lịch khám trước.' : demo ? 'Bệnh viện Demo · Dữ liệu thử nghiệm' : 'Quản lý tiếp nhận và hỗ trợ người bệnh tại cơ sở.'}</p>
      {demo && <details className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"><summary className="cursor-pointer text-sm font-semibold text-amber-900">Công cụ dữ liệu demo</summary><div className="mt-4"><ReceptionDemoControls onReset={() => setRevision(v => v + 1)} /></div></details>}
      {tab === 'registration' && <ReceptionRegistration key={tab + revision} lookupOnly={false} />}
      {tab === 'appointments' && <ReceptionAppointmentList key={tab + revision} />}
      {(tab === 'checkin' || tab === 'pending-specialty') && <ReceptionAppointments key={tab + revision} pending={tab === 'pending-specialty'} />}
      {tab === 'checkout' && <ReceptionBilling key={`${revision}:${params.get("keyword") ?? ""}`} />}
    </main></div>
  </div>;
}
