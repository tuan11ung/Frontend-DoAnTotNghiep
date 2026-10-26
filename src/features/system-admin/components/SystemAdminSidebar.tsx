'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BookOpenText,
  Building2,
  ChevronRight,
  ClipboardList,
  FileHeart,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  Microscope,
  Pill,
  ShieldCheck,
  Stethoscope,
  Tags,
  UserCog,
  X,
} from 'lucide-react';
import type { SystemSection } from '../types';

interface SystemAdminSidebarProps {
  activeSection: SystemSection;
  counts: Partial<Record<SystemSection, number>>;
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

function SidebarContent({
  activeSection,
  counts,
  onCloseMobile,
  onLogout,
  onSelect,
}: Omit<SystemAdminSidebarProps, 'mobileOpen' | 'onOpenMobile'>) {
  const selectSection = (section: SystemSection) => {
    onSelect(section);
    onCloseMobile();
  };

  return (
    <div className="flex h-full flex-col bg-[#102d2c] text-white">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
          <HeartPulse aria-hidden="true" className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-extrabold tracking-tight">MedConnect</p>
          <p className="truncate text-xs text-emerald-100/70">Quản trị toàn hệ thống</p>
        </div>
        <button aria-label="Đóng menu" className="ml-auto rounded-lg p-2 text-emerald-50/80 hover:bg-white/10 lg:hidden" onClick={onCloseMobile} type="button">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/7 px-3 py-3 ring-1 ring-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-200 text-emerald-950">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Trung tâm vận hành</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-100/65">
              <Activity className="h-3 w-3" /> Nền tảng đang hoạt động
            </p>
          </div>
        </div>
      </div>

      <nav aria-label="Điều hướng quản trị hệ thống" className="custom-scrollbar-hide flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAVIGATION_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-100/50">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                const count = counts[item.id];
                return (
                  <button
                    aria-current={active ? 'page' : undefined}
                    className={`group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition-colors ${active ? 'bg-white text-[#0b5754] shadow-sm' : 'text-emerald-50/75 hover:bg-white/8 hover:text-white'}`}
                    key={item.id}
                    onClick={() => selectSection(item.id)}
                    type="button"
                  >
                    <Icon className={`h-[18px] w-[18px] ${active ? 'text-blue-700' : 'text-emerald-100/65'}`} />
                    <span className="flex-1">{item.label}</span>
                    {typeof count === 'number' ? (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? 'bg-blue-50 text-blue-700' : 'bg-white/10 text-white/70'}`}>{count}</span>
                    ) : (
                      <ChevronRight className={`h-4 w-4 ${active ? 'text-slate-400' : 'text-white/25'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-extrabold text-emerald-100">SA</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Quản trị hệ thống</p>
            <p className="truncate text-xs text-emerald-100/55">SUPER_ADMIN</p>
          </div>
        </div>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-emerald-50/70 hover:bg-white/8 hover:text-white" onClick={onLogout} type="button">
          <LogOut className="h-[18px] w-[18px]" /> Đăng xuất
        </button>
      </div>
    </div>
  );
}

export function SystemAdminSidebar(props: SystemAdminSidebarProps) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] lg:block"><SidebarContent {...props} /></aside>
      {props.mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Đóng menu" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={props.onCloseMobile} type="button" />
          <aside className="relative h-full w-[min(86vw,310px)] shadow-2xl"><SidebarContent {...props} /></aside>
        </div>
      )}
      <button aria-label="Mở menu quản trị" className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-lg lg:hidden" onClick={props.onOpenMobile} type="button">
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
}
