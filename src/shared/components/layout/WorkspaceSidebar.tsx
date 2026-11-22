'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight, CircleUserRound, HeartPulse, LogOut, Menu, X } from 'lucide-react';

export type WorkspaceNavigationItem<S extends string> = {
  id: S;
  label: string;
  icon: LucideIcon;
} & ({ href: string; onSelect?: never } | { href?: never; onSelect: (section: S) => void });

export interface WorkspaceNavigationGroup<S extends string> {
  label: string;
  items: readonly WorkspaceNavigationItem<S>[];
}

export interface WorkspaceSidebarProps<S extends string> {
  activeSection: S;
  title: string;
  navigationLabel: string;
  groups: readonly WorkspaceNavigationGroup<S>[];
  context: { title: string; description: ReactNode; avatar: ReactNode };
  account: ReactNode;
  accountAvatar?: ReactNode;
  roleLabel: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenMobile: () => void;
  onLogout?: () => void;
}

function SidebarContent<S extends string>({ activeSection, title, navigationLabel, groups, context, account, accountAvatar, roleLabel, onCloseMobile, onLogout }: WorkspaceSidebarProps<S>) {
  return (
    <div className="flex h-full flex-col bg-[#102d2c] text-white">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
          <HeartPulse aria-hidden="true" className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-extrabold tracking-tight">MedConnect</p>
          <p className="truncate text-xs text-emerald-100/70">{title}</p>
        </div>
        <button
          aria-label="Đóng menu"
          className="ml-auto rounded-lg p-2 text-emerald-50/80 hover:bg-white/10 lg:hidden"
          onClick={onCloseMobile}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/7 px-3 py-3 ring-1 ring-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-200 text-sm font-extrabold text-emerald-950">
            {context.avatar}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{context.title}</p>
            <p className="mt-0.5 text-xs text-emerald-100/65">{context.description}</p>
          </div>
        </div>
      </div>

      <nav aria-label={navigationLabel} className="custom-scrollbar-hide flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-100/50">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                const className = `group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition-colors ${isActive ? 'bg-white text-[#0b5754] shadow-sm' : 'text-emerald-50/75 hover:bg-white/8 hover:text-white'}`;
                const content = <>
                  <Icon aria-hidden="true" className={`h-[18px] w-[18px] ${isActive ? 'text-blue-700' : 'text-emerald-100/65'}`} />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight aria-hidden="true" className={`h-4 w-4 ${isActive ? 'text-slate-400' : 'text-white/25'}`} />
                </>;
                return item.href !== undefined ? (
                  <Link key={item.id} href={item.href} aria-current={isActive ? 'page' : undefined} className={className} onClick={onCloseMobile}>{content}</Link>
                ) : (
                  <button key={item.id} type="button" aria-current={isActive ? 'page' : undefined} className={className} onClick={() => { item.onSelect(item.id); onCloseMobile(); }}>{content}</button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            {accountAvatar ?? <CircleUserRound className="h-5 w-5 text-emerald-100" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{account}</p>
            <p className="truncate text-xs text-emerald-100/55">{roleLabel}</p>
          </div>
        </div>
        {onLogout && <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-emerald-50/70 hover:bg-white/8 hover:text-white" onClick={onLogout} type="button">
          <LogOut className="h-[18px] w-[18px]" />
          Đăng xuất
        </button>}
      </div>
    </div>
  );
}

export function WorkspaceSidebar<S extends string>(props: WorkspaceSidebarProps<S>) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] lg:block">
        <SidebarContent {...props} />
      </aside>

      {props.mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Đóng menu" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={props.onCloseMobile} type="button" />
          <aside className="relative h-full w-[min(86vw,310px)] shadow-2xl">
            <SidebarContent {...props} />
          </aside>
        </div>
      )}

      <button
        aria-label={`Mở menu ${props.title}`}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-lg lg:hidden"
        onClick={props.onOpenMobile}
        type="button"
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
}
