'use client';

import { useMemo, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpenText,
  Building2,
  FileHeart,
  Microscope,
  Pencil,
  Pill,
  Plus,
  Search,
  Stethoscope,
  Tags,
  UserCog,
} from 'lucide-react';
import type {
  ArticleItem,
  EditableSection,
  HospitalLevel,
  HospitalSummary,
  Icd10Item,
  IngredientItem,
  MedicineItem,
  RankItem,
  ResourceSection,
  ServiceCategoryItem,
  SpecialtyItem,
  SystemResource,
} from '../types';
import { getRankOrderLabel } from '../rank-levels';

interface SystemResourceViewProps {
  section: ResourceSection;
  items: SystemResource[];
  loading: boolean;
  onAdd: (section: EditableSection) => void;
  onEdit: (section: EditableSection, item: SystemResource) => void;
  onRefresh: () => void;
  onToggle: (section: EditableSection, item: SystemResource) => void;
}

interface SectionMeta {
  title: string;
  subtitle: string;
  addLabel: string;
  search: string;
  icon: LucideIcon;
  columns: string[];
  hasStatus: boolean;
}

const SECTION_META: Record<ResourceSection, SectionMeta> = {
  hospitals: { title: 'Quản lý cơ sở y tế', subtitle: 'Khởi tạo, cập nhật và kiểm soát trạng thái các cơ sở trong mạng lưới.', addLabel: 'Thêm cơ sở', search: 'Tìm theo mã, tên hoặc tỉnh thành', icon: Building2, columns: ['Cơ sở y tế', 'Tuyến', 'Tỉnh / Thành', 'Trạng thái', 'Thao tác'], hasStatus: true },
  specialties: { title: 'Danh mục chuyên khoa', subtitle: 'Danh mục chuyên khoa chuẩn được sử dụng trên toàn hệ thống.', addLabel: 'Thêm chuyên khoa', search: 'Tìm theo mã hoặc tên chuyên khoa', icon: Stethoscope, columns: ['Chuyên khoa', 'Mô tả', 'Mã hệ thống', 'Thao tác'], hasStatus: false },
  'service-categories': { title: 'Nhóm dịch vụ cận lâm sàng', subtitle: 'Quản lý cấu trúc nhóm dịch vụ dùng chung cho các cơ sở.', addLabel: 'Thêm nhóm dịch vụ', search: 'Tìm theo mã hoặc tên nhóm', icon: Tags, columns: ['Nhóm dịch vụ', 'Nhóm cha', 'Cấp danh mục', 'Trạng thái', 'Thao tác'], hasStatus: true },
  ranks: { title: 'Danh mục trình độ bác sĩ', subtitle: 'Danh mục chuẩn dùng chung toàn hệ thống; mỗi trình độ có một bậc chuyên môn cố định.', addLabel: '', search: 'Tìm theo mã hoặc tên trình độ', icon: UserCog, columns: ['Trình độ', 'Mã', 'Bậc chuyên môn'], hasStatus: false },
  icd10: { title: 'Danh mục mã bệnh ICD-10', subtitle: 'Quản lý bộ mã chẩn đoán bệnh dùng trong hồ sơ khám chữa bệnh.', addLabel: 'Thêm mã ICD-10', search: 'Tìm theo mã hoặc tên bệnh', icon: FileHeart, columns: ['Mã ICD-10', 'Tên bệnh / Chẩn đoán', 'ID', 'Thao tác'], hasStatus: false },
  ingredients: { title: 'Danh mục hoạt chất', subtitle: 'Quản lý hoạt chất dùng để cấu thành danh mục thuốc.', addLabel: 'Thêm hoạt chất', search: 'Tìm theo tên hoạt chất', icon: Microscope, columns: ['Hoạt chất', 'ID hệ thống', 'Phạm vi sử dụng', 'Thao tác'], hasStatus: false },
  medicines: { title: 'Danh mục thuốc', subtitle: 'Quản lý thuốc, đường dùng, hàm lượng và thành phần hoạt chất.', addLabel: 'Thêm thuốc', search: 'Tìm theo mã, tên hoặc hoạt chất', icon: Pill, columns: ['Thuốc', 'Hàm lượng / Đường dùng', 'Hoạt chất', 'Trạng thái', 'Thao tác'], hasStatus: true },
  articles: { title: 'Bài viết sức khỏe', subtitle: 'Biên tập và kiểm soát nội dung được công khai trên MedConnect.', addLabel: 'Viết bài mới', search: 'Tìm theo tiêu đề, tóm tắt hoặc chuyên khoa', icon: BookOpenText, columns: ['Bài viết', 'Chuyên khoa', 'Cập nhật', 'Trạng thái', 'Thao tác'], hasStatus: true },
};

const LEVEL_LABELS: Record<HospitalLevel, string> = {
  CENTRAL: 'Trung ương',
  PROVINCIAL: 'Tuyến tỉnh',
  DISTRICT: 'Tuyến xã',
};

function getSearchText(item: SystemResource) {
  if ('title' in item) return `${item.title} ${item.summary ?? ''} ${item.specialtyName ?? ''}`;
  if ('ingredients' in item) return `${item.code} ${item.name} ${item.ingredients.map((entry) => entry.ingredientName).join(' ')}`;
  if ('province' in item) return `${item.code} ${item.name} ${item.province ?? ''}`;
  if ('code' in item) return `${item.code} ${item.name}`;
  return item.name;
}

function getActive(item: SystemResource): boolean | undefined {
  if ('status' in item) return item.status === 'ACTIVE';
  if ('isActive' in item) return item.isActive;
  if ('active' in item) return item.active;
  if ('published' in item) return item.published;
  return undefined;
}

function StatusBadge({ active, activeLabel = 'Đang hoạt động', inactiveLabel = 'Tạm ngừng' }: { active: boolean; activeLabel?: string; inactiveLabel?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function Toggle({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button aria-label={label} aria-pressed={active} className={`relative h-7 w-12 rounded-full transition-colors ${active ? 'bg-emerald-600' : 'bg-slate-300'}`} onClick={onClick} type="button">
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function RowActions({ active, item, section, onEdit, onToggle }: { active?: boolean; item: SystemResource; section: EditableSection; onEdit: SystemResourceViewProps['onEdit']; onToggle: SystemResourceViewProps['onToggle'] }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700" onClick={() => onEdit(section, item)} type="button">
        <Pencil className="h-3.5 w-3.5" /> Sửa
      </button>
      {typeof active === 'boolean' && <Toggle active={active} label="Đổi trạng thái" onClick={() => onToggle(section, item)} />}
    </div>
  );
}

function renderCells(section: ResourceSection, item: SystemResource, items: SystemResource[], onEdit: SystemResourceViewProps['onEdit'], onToggle: SystemResourceViewProps['onToggle']): ReactNode {
  if (section === 'hospitals') {
    const hospital = item as HospitalSummary;
    const active = hospital.status === 'ACTIVE';
    return <><td className="px-5 py-4"><p className="font-bold text-slate-900">{hospital.name}</p><p className="mt-1 font-mono text-xs text-slate-400">{hospital.code}</p></td><td className="px-4 py-4"><span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{LEVEL_LABELS[hospital.level]}</span></td><td className="px-4 py-4 font-medium text-slate-600">{hospital.province || 'Chưa cập nhật'}</td><td className="px-4 py-4"><StatusBadge active={active} inactiveLabel="Đã tạm ngừng" /></td><td className="px-5 py-4"><RowActions active={active} item={item} onEdit={onEdit} onToggle={onToggle} section={section} /></td></>;
  }
  if (section === 'specialties') {
    const specialty = item as SpecialtyItem;
    return <><td className="px-5 py-4"><p className="font-bold text-slate-900">{specialty.name}</p><p className="mt-1 text-xs text-slate-400">Danh mục toàn hệ thống</p></td><td className="max-w-md px-4 py-4 text-slate-600">{specialty.description || 'Chưa có mô tả'}</td><td className="px-4 py-4 font-mono text-sm font-bold text-slate-600">{specialty.code}</td><td className="px-5 py-4"><RowActions item={item} onEdit={onEdit} onToggle={onToggle} section={section} /></td></>;
  }
  if (section === 'service-categories') {
    const category = item as ServiceCategoryItem;
    const parent = (items as ServiceCategoryItem[]).find((entry) => entry.id === category.parentId);
    return <><td className="px-5 py-4"><p className="font-bold text-slate-900">{category.name}</p><p className="mt-1 font-mono text-xs text-slate-400">{category.code}</p></td><td className="px-4 py-4 text-slate-600">{parent?.name || '— Danh mục gốc —'}</td><td className="px-4 py-4"><span className="rounded-md bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">{category.parentId ? 'Nhóm con' : 'Nhóm gốc'}</span></td><td className="px-4 py-4"><StatusBadge active={category.isActive} /></td><td className="px-5 py-4"><RowActions active={category.isActive} item={item} onEdit={onEdit} onToggle={onToggle} section={section} /></td></>;
  }
  if (section === 'ranks') {
    const rank = item as RankItem;
    return <><td className="px-5 py-4 font-bold text-slate-900">{rank.name}</td><td className="px-4 py-4 font-mono text-sm text-slate-600">{rank.code}</td><td className="px-4 py-4"><span className="inline-flex min-h-8 items-center justify-center rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-extrabold text-slate-700">{getRankOrderLabel(rank.rankOrder)}</span></td></>;
  }
  if (section === 'icd10') {
    const icd = item as Icd10Item;
    return <><td className="px-5 py-4"><span className="rounded-lg bg-rose-50 px-3 py-1.5 font-mono text-sm font-extrabold text-rose-700">{icd.code}</span></td><td className="px-4 py-4 font-semibold text-slate-800">{icd.name}</td><td className="px-4 py-4 font-mono text-xs text-slate-400">#{icd.id}</td><td className="px-5 py-4"><RowActions item={item} onEdit={onEdit} onToggle={onToggle} section={section} /></td></>;
  }
  if (section === 'ingredients') {
    const ingredient = item as IngredientItem;
    return <><td className="px-5 py-4 font-bold text-slate-900">{ingredient.name}</td><td className="px-4 py-4 font-mono text-xs text-slate-500">#{ingredient.id}</td><td className="px-4 py-4 text-slate-500">Danh mục dùng chung</td><td className="px-5 py-4"><RowActions item={item} onEdit={onEdit} onToggle={onToggle} section={section} /></td></>;
  }
  if (section === 'medicines') {
    const medicine = item as MedicineItem;
    return <><td className="px-5 py-4"><p className="font-bold text-slate-900">{medicine.name}</p><p className="mt-1 font-mono text-xs text-slate-400">{medicine.code}</p></td><td className="px-4 py-4"><p className="font-semibold text-slate-700">{medicine.strength || 'Chưa cập nhật'}</p><p className="mt-1 text-xs text-slate-500">{medicine.route || 'Chưa có đường dùng'}</p></td><td className="max-w-sm px-4 py-4"><div className="flex flex-wrap gap-1.5">{medicine.ingredients.map((entry) => <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700" key={`${entry.ingredientId}-${entry.strength}`}>{entry.ingredientName}{entry.strength ? ` ${entry.strength}` : ''}</span>)}</div></td><td className="px-4 py-4"><StatusBadge active={medicine.active} /></td><td className="px-5 py-4"><RowActions active={medicine.active} item={item} onEdit={onEdit} onToggle={onToggle} section={section} /></td></>;
  }
  const article = item as ArticleItem;
  return <><td className="max-w-md px-5 py-4"><p className="line-clamp-2 font-bold text-slate-900">{article.title}</p><p className="mt-1 line-clamp-1 text-xs text-slate-500">{article.summary || 'Chưa có tóm tắt'}</p></td><td className="px-4 py-4 text-sm font-semibold text-slate-600">{article.specialtyName || 'Tin chung'}</td><td className="px-4 py-4 text-xs text-slate-500">{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(article.updatedAt))}</td><td className="px-4 py-4"><StatusBadge active={article.published} activeLabel="Đã đăng" inactiveLabel="Bản nháp" /></td><td className="px-5 py-4"><RowActions active={article.published} item={item} onEdit={onEdit} onToggle={onToggle} section={section} /></td></>;
}

export function SystemResourceView({ section, items, loading, onAdd, onEdit, onRefresh, onToggle }: SystemResourceViewProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const meta = SECTION_META[section];
  const Icon = meta.icon;
  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi');
    return items.filter((item) => {
      const active = getActive(item);
      if (status === 'ACTIVE' && active === false) return false;
      if (status === 'INACTIVE' && active === true) return false;
      return !normalized || getSearchText(item).toLocaleLowerCase('vi').includes(normalized);
    });
  }, [items, query, status]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100"><Icon className="h-5 w-5" /></div>
          <div><h2 className="text-lg font-extrabold text-slate-950">{meta.title}</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{meta.subtitle}</p></div>
        </div>
        <div className="flex gap-2">
          <button className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 hover:bg-slate-50" onClick={onRefresh} type="button">Làm mới</button>
          {section !== 'ranks' && <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-800" onClick={() => onAdd(section)} type="button"><Plus className="h-4 w-4" /> {meta.addLabel}</button>}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
        <label className="min-w-[240px] flex-1 sm:max-w-md"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Tìm kiếm</span><span className="relative block"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => setQuery(event.target.value)} placeholder={meta.search} type="search" value={query} /></span></label>
        {meta.hasStatus && <label className="w-44"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Trạng thái</span><select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => setStatus(event.target.value as typeof status)} value={status}><option value="ALL">Tất cả</option><option value="ACTIVE">Đang hoạt động</option><option value="INACTIVE">Tạm ngừng / Nháp</option></select></label>}
        <p className="ml-auto pb-2 text-xs font-medium text-slate-500">{items.length} bản ghi</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr>{meta.columns.map((column, index) => <th className={`${index === 0 ? 'px-5' : 'px-4'} py-3 ${index === meta.columns.length - 1 ? 'pr-5 text-right' : ''}`} key={column}>{column}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{filteredItems.map((item) => <tr className={getActive(item) === false ? 'bg-slate-50/70' : 'hover:bg-blue-50/20'} key={item.id}>{renderCells(section, item, items, onEdit, onToggle)}</tr>)}</tbody>
        </table>
        {!loading && filteredItems.length === 0 && <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center"><Search className="h-9 w-9 text-slate-300" /><p className="mt-3 font-bold text-slate-700">Không tìm thấy dữ liệu phù hợp</p><p className="mt-1 text-sm text-slate-500">Thử thay đổi từ khóa hoặc tải lại dữ liệu.</p></div>}
        {loading && <div className="flex min-h-56 items-center justify-center text-sm font-semibold text-slate-500">Đang tải dữ liệu...</div>}
      </div>
    </section>
  );
}
