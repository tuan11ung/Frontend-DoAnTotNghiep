'use client';

import { useEffect, useState } from 'react';
import { Building2, CalendarCheck, ClipboardPlus, GitBranch, Wallet } from 'lucide-react';
import { AccountName } from '@/src/shared/components/layout/AccountName';
import { WorkspaceSidebar, type WorkspaceNavigationGroup } from '@/src/shared/components/layout/WorkspaceSidebar';
import { useReceptionData } from '../ReceptionDataProvider';
import { useDoctorAccess } from '@/src/features/doctor-queue/hooks/use-doctor-access';
import { publicRequest, type PublicHospital } from '@/src/features/public-data/public-api';

export const RECEPTION_SECTIONS = [
  { id: 'registration', label: 'Đăng ký tại quầy', group: 'Tiếp nhận khám', icon: ClipboardPlus },
  { id: 'checkin', label: 'Check-in lịch hẹn', group: 'Tiếp nhận khám', icon: CalendarCheck },
  { id: 'pending-specialty', label: 'Phân chuyên khoa', group: 'Tiếp nhận khám', icon: GitBranch },
  { id: 'checkout', label: 'Thu viện phí', group: 'Viện phí', icon: Wallet },
] as const;

export type ReceptionSection = typeof RECEPTION_SECTIONS[number]['id'];

export function ReceptionSidebar({ activeSection }: { activeSection: ReceptionSection }) {
  const { demo, href } = useReceptionData();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { session } = useDoctorAccess();
  const hospitalId = session?.hospitalId;
  const [facility, setFacility] = useState<{ id: number; name: string } | null>(null);
  const [failedId, setFailedId] = useState<number | null>(null);
  useEffect(() => {
    if (demo || !hospitalId) return;
    const controller = new AbortController();
    publicRequest<PublicHospital>('hospitals/detail', { id: hospitalId }, controller.signal)
      .then(hospital => {
        if (!controller.signal.aborted) setFacility({ id: hospitalId, name: hospital.name });
      })
      .catch(() => { if (!controller.signal.aborted) setFailedId(hospitalId); });
    return () => controller.abort();
  }, [demo, hospitalId]);
  const facilityName = demo ? 'Bệnh viện Demo'
    : facility && facility.id === hospitalId ? facility.name
    : !hospitalId || failedId === hospitalId ? 'Chưa tải được tên cơ sở y tế'
    : 'Đang tải cơ sở y tế…';
  const groups: WorkspaceNavigationGroup<ReceptionSection>[] = ['Tiếp nhận khám', 'Viện phí'].map(label => ({
    label,
    items: RECEPTION_SECTIONS.filter(section => section.group === label).map(section => ({ ...section, href: href(section.id) })),
  }));

  return <WorkspaceSidebar<ReceptionSection>
    title="Tiếp đón" navigationLabel="Nghiệp vụ lễ tân" activeSection={activeSection} groups={groups}
    mobileOpen={mobileOpen} onOpenMobile={() => setMobileOpen(true)} onCloseMobile={() => setMobileOpen(false)}
    context={{ title: facilityName, description: 'Không gian làm việc của lễ tân', avatar: <Building2 className="h-5 w-5" /> }}
    account={demo ? 'Lễ tân demo' : <AccountName fallback="Lễ tân" />} roleLabel="Lễ tân"
  />;
}
