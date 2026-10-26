import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  BookOpenText,
  Building2,
  CircleCheckBig,
  FileClock,
  PackageSearch,
  Pill,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import type { SystemDashboardStats, SystemSection } from '../types';

interface SystemOverviewProps {
  stats: SystemDashboardStats;
  onNavigate: (section: SystemSection) => void;
}

interface StatCard {
  label: string;
  value: number;
  note: string;
  icon: LucideIcon;
  section: SystemSection;
  color: string;
}

export function SystemOverview({ stats, onNavigate }: SystemOverviewProps) {
  const cards: StatCard[] = [
    { label: 'Cơ sở y tế', value: stats.hospitals, note: `${stats.activeHospitals} đang hoạt động`, icon: Building2, section: 'hospitals', color: 'bg-blue-50 text-blue-700 ring-blue-100' },
    { label: 'Chuyên khoa', value: stats.specialties, note: 'Danh mục toàn hệ thống', icon: Stethoscope, section: 'specialties', color: 'bg-violet-50 text-violet-700 ring-violet-100' },
    { label: 'Danh mục thuốc', value: stats.medicines, note: 'Thuốc đang quản lý', icon: Pill, section: 'medicines', color: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
    { label: 'Bài viết đã đăng', value: stats.publishedArticles, note: 'Nội dung đang công khai', icon: BookOpenText, section: 'articles', color: 'bg-amber-50 text-amber-700 ring-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f4c4a] via-[#12615d] to-[#12746e] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-emerald-50 ring-1 ring-white/15">
              <ShieldCheck className="h-4 w-4" /> Bảng điều khiển SUPER_ADMIN
            </div>
            <h1 className="max-w-2xl text-2xl font-extrabold tracking-tight sm:text-3xl">Trung tâm vận hành MedConnect</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/75">Theo dõi mạng lưới cơ sở y tế, chuẩn hóa danh mục y khoa và kiểm soát hoạt động trên toàn nền tảng.</p>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 px-5 py-4 ring-1 ring-white/15">
              <p className="text-2xl font-extrabold">{stats.activeHospitals}</p>
              <p className="mt-1 text-xs text-emerald-50/70">Cơ sở trực tuyến</p>
            </div>
            <div className="rounded-xl bg-white/10 px-5 py-4 ring-1 ring-white/15">
              <p className="text-2xl font-extrabold">{stats.recentLogs}</p>
              <p className="mt-1 text-xs text-emerald-50/70">Nhật ký gần nhất</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <button className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-[0_8px_30px_-24px_rgba(15,23,42,0.4)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg" key={card.label} onClick={() => onNavigate(card.section)} type="button">
            <div className="flex items-start justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${card.color}`}><card.icon className="h-5 w-5" /></div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-blue-600" />
            </div>
            <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950">{card.value}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{card.label}</p>
            <p className="mt-1 text-xs text-slate-500">{card.note}</p>
          </button>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="font-bold text-slate-900">Tình trạng nền tảng</h2>
            <p className="mt-1 text-xs text-slate-500">Tổng hợp nhanh các khu vực vận hành chính.</p>
          </div>
          <div className="grid gap-px bg-slate-100 sm:grid-cols-3">
            {[
              { value: `${stats.activeHospitals}/${stats.hospitals}`, label: 'Cơ sở hoạt động', icon: CircleCheckBig },
              { value: stats.publishedArticles, label: 'Nội dung công khai', icon: BookOpenText },
              { value: stats.recentLogs, label: 'Bản ghi giám sát', icon: FileClock },
            ].map((item) => (
              <div className="bg-white p-5 sm:p-6" key={item.label}>
                <item.icon className="h-5 w-5 text-blue-700" />
                <p className="mt-4 text-xl font-extrabold text-slate-900">{item.value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100"><PackageSearch className="h-5 w-5" /></div>
            <div>
              <h2 className="font-bold text-slate-900">Truy cập nhanh</h2>
              <p className="mt-1 text-xs text-slate-500">Các tác vụ quản trị thường dùng.</p>
            </div>
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {[
              { label: 'Quản lý mạng lưới cơ sở y tế', target: 'hospitals' as const },
              { label: 'Chuẩn hóa danh mục mã bệnh ICD-10', target: 'icd10' as const },
              { label: 'Kiểm tra nhật ký truy cập dữ liệu', target: 'system-logs' as const },
            ].map((item) => (
              <button className="flex w-full items-center gap-3 py-3 text-left text-sm font-semibold text-slate-600 hover:text-blue-700" key={item.label} onClick={() => onNavigate(item.target)} type="button">
                <span className="flex-1">{item.label}</span><ArrowUpRight className="h-4 w-4 text-slate-300" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
