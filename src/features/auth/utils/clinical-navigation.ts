export type ClinicalWorkspace = 'doctor' | 'technician';
export type ClinicalNavigationIcon = 'queue' | 'schedule' | 'emergency' | 'technician' | 'system' | 'facility' | 'reception';

export interface ClinicalNavigationLink {
  href: string;
  label: string;
  icon: ClinicalNavigationIcon;
  workspace?: ClinicalWorkspace;
}

export function getClinicalNavigationLinks(roles: readonly string[], departmentType?: string): ClinicalNavigationLink[] {
  const links: ClinicalNavigationLink[] = [];
  if (roles.includes('DOCTOR')) {
    links.push(
      { href: '/doctor/queue', label: 'Hàng chờ phòng khám', icon: 'queue', workspace: 'doctor' },
      { href: '/doctor/work-schedules', label: 'Lịch làm việc', icon: 'schedule', workspace: 'doctor' },
    );
    if (departmentType === 'EMERGENCY') {
      links.push({ href: '/doctor/emergency?demo=1', label: 'Tra cứu hồ sơ khẩn cấp', icon: 'emergency', workspace: 'doctor' });
    }
  }
  if (roles.includes('PARACLINICAL_TECHNICIAN')) {
    links.push({ href: '/technician/queue', label: 'Hàng chờ cận lâm sàng', icon: 'technician', workspace: 'technician' });
  }
  return links;
}

export function isClinicalNavigationActive(pathname: string, href: string): boolean {
  const path = href.split('?')[0];
  return pathname === path || (path !== '/' && pathname.startsWith(`${path}/`));
}

export function clinicalWorkspaceLabel(workspace: ClinicalWorkspace): string {
  return workspace === 'doctor' ? 'Không gian bác sĩ' : 'Không gian kỹ thuật viên';
}

export function getAccountNavigationLinks(roles: readonly string[], departmentType?: string): ClinicalNavigationLink[] {
  const links = getClinicalNavigationLinks(roles, departmentType);
  if (roles.includes('SUPER_ADMIN')) links.unshift({ href: '/admin/system', label: 'Quản trị hệ thống', icon: 'system' });
  if (roles.includes('HOSPITAL_ADMIN')) links.unshift({ href: '/admin/facility', label: 'Quản trị cơ sở', icon: 'facility' });
  if (roles.includes('RECEPTIONIST')) links.push({ href: '/reception', label: 'Tiếp đón bệnh nhân', icon: 'reception' });
  return links;
}
