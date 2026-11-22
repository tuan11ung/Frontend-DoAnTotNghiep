import { AccountName } from '@/src/shared/components/layout/AccountName';
import { WorkspaceSidebar } from '@/src/shared/components/layout/WorkspaceSidebar';
import type { LucideIcon } from 'lucide-react';
import {
  BadgeDollarSign,
  Building2,
  CalendarDays,
  CircleUserRound,
  DoorOpen,
  LayoutDashboard,
  Stethoscope,
  UsersRound,
} from 'lucide-react';
import type { AdminSection, FacilityInfo } from '../types';

interface AdminSidebarProps {
  activeSection: AdminSection;
  mobileOpen: boolean;
  facility: FacilityInfo;
  onCloseMobile: () => void;
  onOpenMobile: () => void;
  onLogout: () => void;
  onSelect: (section: AdminSection) => void;
}

interface NavigationItem {
  id: AdminSection;
  label: string;
  icon: LucideIcon;
}

const NAVIGATION_GROUPS: { label: string; items: NavigationItem[] }[] = [
  {
    label: 'Điều hành',
    items: [
      { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
      { id: 'facility', label: 'Thông tin cơ sở', icon: Building2 },
      { id: 'work-schedules', label: 'Phân công lịch làm việc', icon: CalendarDays },
    ],
  },
  {
    label: 'Cơ cấu chuyên môn',
    items: [
      { id: 'specialties', label: 'Chuyên khoa', icon: Stethoscope },
      { id: 'rooms', label: 'Phòng', icon: DoorOpen },
    ],
  },
  {
    label: 'Nguồn lực',
    items: [
      { id: 'staff', label: 'Tài khoản nhân viên', icon: UsersRound },
      { id: 'services', label: 'Dịch vụ & Bảng giá', icon: BadgeDollarSign },
      { id: 'articles', label: 'Quản lý bài viết', icon: Building2 },
      { id: 'clinical-settings', label: 'Giá khám, xét nghiệm & thuốc', icon: Stethoscope },
    ],
  },
];

export function AdminSidebar({ facility, onSelect, ...props }: AdminSidebarProps) {
  return <WorkspaceSidebar<AdminSection> {...props}
    title="Quản trị cơ sở y tế" navigationLabel="Điều hướng quản trị cơ sở"
    groups={NAVIGATION_GROUPS.map(group => ({ ...group, items: group.items.map(item => ({ ...item, onSelect })) }))}
    context={{ title: facility.name, description: `${facility.code} · ${facility.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngừng'}`, avatar: facility.name.split(' ').slice(-2).map(word => word[0]).join('').toUpperCase() || 'YT' }}
    account={<AccountName />} roleLabel="Quản trị cơ sở" accountAvatar={<CircleUserRound className="h-5 w-5 text-emerald-100" />}
  />;
}
