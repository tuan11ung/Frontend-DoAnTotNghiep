'use client';

import { AccountName } from '@/src/shared/components/layout/AccountName';

import { WorkspaceSidebar } from '@/src/shared/components/layout/WorkspaceSidebar';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BookOpenText,
  Building2,
  ClipboardList,
  FileHeart,
  LayoutDashboard,
  Microscope,
  Pill,
  ShieldCheck,
  Stethoscope,
  Tags,
  UserCog,
} from 'lucide-react';
import type { SystemSection } from '../types';

interface SystemAdminSidebarProps {
  activeSection: SystemSection;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  onOpenMobile: () => void;
  onSelect: (section: SystemSection) => void;
}

interface NavigationItem {
  id: SystemSection;
  label: string;
  icon: LucideIcon;
}

const NAVIGATION_GROUPS: Array<{ label: string; items: NavigationItem[] }> = [
  {
    label: 'Điều hành',
    items: [
      { id: 'overview', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
      { id: 'hospitals', label: 'Cơ sở y tế', icon: Building2 },
      { id: 'system-logs', label: 'Nhật ký hệ thống', icon: ClipboardList },
    ],
  },
  {
    label: 'Danh mục y khoa',
    items: [
      { id: 'specialties', label: 'Chuyên khoa', icon: Stethoscope },
      { id: 'icd10', label: 'Mã bệnh ICD-10', icon: FileHeart },
      { id: 'ingredients', label: 'Hoạt chất', icon: Microscope },
      { id: 'medicines', label: 'Danh mục thuốc', icon: Pill },
    ],
  },
  {
    label: 'Cấu hình nền tảng',
    items: [
      { id: 'service-categories', label: 'Nhóm dịch vụ', icon: Tags },
      { id: 'ranks', label: 'Trình độ bác sĩ', icon: UserCog },
      { id: 'articles', label: 'Bài viết sức khỏe', icon: BookOpenText },
    ],
  },
];

export function SystemAdminSidebar({ onSelect, ...props }: SystemAdminSidebarProps) {
  return <WorkspaceSidebar<SystemSection> {...props}
    showBrandHeader
    title="Quản trị toàn hệ thống" navigationLabel="Điều hướng quản trị hệ thống"
    groups={NAVIGATION_GROUPS.map(group => ({ ...group, items: group.items.map(item => ({ ...item, onSelect })) }))}
    context={{ title: 'Trung tâm vận hành', description: <span className="flex items-center gap-1.5"><Activity className="h-3 w-3" /> Nền tảng đang hoạt động</span>, avatar: <ShieldCheck className="h-5 w-5" /> }}
    account={<AccountName />} roleLabel="SUPER_ADMIN" accountAvatar={<span className="text-xs font-extrabold text-emerald-100">SA</span>}
  />;
}
