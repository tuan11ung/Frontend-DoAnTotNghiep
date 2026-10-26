'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CalendarDays, LoaderCircle, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { clearStoredAuthSession, getStoredAuthSession } from '../auth/auth-storage';
import {
  activateHospital,
  changeArticlePublication,
  changeServiceCategoryStatus,
  createHospital,
  exportSystemLogs,
  getArticleDetail,
  getHospitalDetail,
  logoutSystemAdmin,
  saveArticle,
  saveIcd10,
  saveIngredient,
  saveMedicine,
  saveServiceCategory,
  saveSpecialty,
  searchArticles,
  searchHospitals,
  searchIcd10,
  searchIngredients,
  searchMedicines,
  searchRanks,
  searchServiceCategories,
  searchSpecialties,
  searchSystemLogs,
  suspendHospital,
  updateHospital,
  uploadArticleThumbnail,
  type SystemLogFilters,
} from './api/system-admin-api';
import { SystemAdminApiError } from './api/system-admin-client';
import { SystemAdminSidebar } from './components/SystemAdminSidebar';
import { SystemEditorModal } from './components/SystemEditorModal';
import { SystemLogView } from './components/SystemLogView';
import { SystemOverview } from './components/SystemOverview';
import { SystemResourceView } from './components/SystemResourceView';
import type {
  ArticleItem,
  EditableSection,
  EditorState,
  HospitalSummary,
  IngredientItem,
  MedicineItem,
  ServiceCategoryItem,
  SpecialtyItem,
  ResourceSection,
  SystemDashboardStats,
  SystemLogItem,
  SystemResource,
  SystemSection,
} from './types';

const SECTION_TITLES: Record<SystemSection, string> = {
  overview: 'Tổng quan hệ thống',
  hospitals: 'Cơ sở y tế',
  specialties: 'Chuyên khoa',
  'service-categories': 'Nhóm dịch vụ',
  ranks: 'Trình độ bác sĩ',
  icd10: 'Mã bệnh ICD-10',
  ingredients: 'Hoạt chất',
  medicines: 'Danh mục thuốc',
  articles: 'Bài viết sức khỏe',
  'system-logs': 'Nhật ký hệ thống',
};

const EMPTY_RESOURCES: Record<ResourceSection, SystemResource[]> = {
  hospitals: [],
  specialties: [],
  'service-categories': [],
  ranks: [],
  icd10: [],
  ingredients: [],
  medicines: [],
  articles: [],
};

const EMPTY_STATS: SystemDashboardStats = {
  hospitals: 0,
  activeHospitals: 0,
  specialties: 0,
  medicines: 0,
  publishedArticles: 0,
  recentLogs: 0,
};

export function SystemAdminScreen() {
  const router = useRouter();
  const loadedSections = useRef(new Set<SystemSection>());
  const [ready, setReady] = useState(false);
  const [activeSection, setActiveSection] = useState<SystemSection>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resources, setResources] = useState(EMPTY_RESOURCES);
  const [logs, setLogs] = useState<SystemLogItem[]>([]);
  const [counts, setCounts] = useState<Partial<Record<SystemSection, number>>>({});
  const [stats, setStats] = useState(EMPTY_STATS);
  const [overviewLoaded, setOverviewLoaded] = useState(false);
  const [loadingSection, setLoadingSection] = useState<SystemSection | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const handleError = useCallback((caught: unknown) => {
    if (caught instanceof SystemAdminApiError && (caught.status === 401 || caught.status === 403)) {
      router.replace('/patient/login');
      return;
    }
    setError(caught instanceof Error ? caught.message : 'Không thể tải dữ liệu quản trị hệ thống.');
  }, [router]);

  const setSectionData = useCallback((section: ResourceSection, items: SystemResource[], total: number) => {
    setResources((current) => ({ ...current, [section]: items }));
    setCounts((current) => ({ ...current, [section]: total }));
    loadedSections.current.add(section);
  }, []);

  const loadSection = useCallback(async (section: SystemSection, force = false) => {
    if (!force && loadedSections.current.has(section)) return;
    setLoadingSection(section);
    setError('');
    try {
      if (section === 'hospitals') { const page = await searchHospitals(); setSectionData(section, page.content, page.totalElements); }
      else if (section === 'specialties') { const page = await searchSpecialties(); setSectionData(section, page.content, page.totalElements); }
      else if (section === 'service-categories') { const page = await searchServiceCategories(); setSectionData(section, page.content, page.totalElements); }
      else if (section === 'ranks') { const page = await searchRanks(); setSectionData(section, page.content, page.totalElements); }
      else if (section === 'icd10') { const page = await searchIcd10(); setSectionData(section, page.content, page.totalElements); }
      else if (section === 'ingredients') { const page = await searchIngredients(); setSectionData(section, page.content, page.totalElements); }
      else if (section === 'medicines') { const page = await searchMedicines(); setSectionData(section, page.content, page.totalElements); }
      else if (section === 'articles') { const page = await searchArticles(); setSectionData(section, page.content, page.totalElements); }
      else if (section === 'system-logs') {
        const page = await searchSystemLogs();
        setLogs(page.content);
        setCounts((current) => ({ ...current, 'system-logs': page.totalElements }));
        loadedSections.current.add(section);
      }
    } catch (caught) {
      handleError(caught);
    } finally {
      setLoadingSection(null);
    }
  }, [handleError, setSectionData]);

  const loadOverview = useCallback(async () => {
    setLoadingSection('overview');
    setError('');
    const results = await Promise.allSettled([
      searchHospitals(), searchSpecialties(), searchMedicines(), searchArticles(), searchSystemLogs(),
    ]);
    const [hospitalResult, specialtyResult, medicineResult, articleResult, logResult] = results;
    if (hospitalResult.status === 'fulfilled') {
      const page = hospitalResult.value;
      setSectionData('hospitals', page.content, page.totalElements);
      setStats((current) => ({ ...current, hospitals: page.totalElements, activeHospitals: page.content.filter((item) => item.status === 'ACTIVE').length }));
    }
    if (specialtyResult.status === 'fulfilled') {
      setSectionData('specialties', specialtyResult.value.content, specialtyResult.value.totalElements);
      setStats((current) => ({ ...current, specialties: specialtyResult.value.totalElements }));
    }
    if (medicineResult.status === 'fulfilled') {
      setSectionData('medicines', medicineResult.value.content, medicineResult.value.totalElements);
      setStats((current) => ({ ...current, medicines: medicineResult.value.totalElements }));
    }
    if (articleResult.status === 'fulfilled') {
      setSectionData('articles', articleResult.value.content, articleResult.value.totalElements);
      setStats((current) => ({ ...current, publishedArticles: articleResult.value.content.filter((item) => item.published).length }));
    }
    if (logResult.status === 'fulfilled') {
      setLogs(logResult.value.content);
      setCounts((current) => ({ ...current, 'system-logs': logResult.value.totalElements }));
      setStats((current) => ({ ...current, recentLogs: logResult.value.totalElements }));
      loadedSections.current.add('system-logs');
    }
    const failure = results.find((result) => result.status === 'rejected');
    if (failure?.status === 'rejected' && results.every((result) => result.status === 'rejected')) handleError(failure.reason);
    loadedSections.current.add('overview');
    setOverviewLoaded(true);
    setLoadingSection(null);
  }, [handleError, setSectionData]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const session = getStoredAuthSession();
      if (!session?.roles.includes('SUPER_ADMIN')) router.replace('/patient/login');
      else setReady(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    const timeout = window.setTimeout(() => {
      if (activeSection === 'overview') void loadOverview();
      else void loadSection(activeSection);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [activeSection, loadOverview, loadSection, ready]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const ensureEditorCatalogs = async (section: EditableSection) => {
    const tasks: Promise<unknown>[] = [];
    if (section === 'medicines' && !loadedSections.current.has('ingredients')) tasks.push(loadSection('ingredients'));
    if (section === 'articles' && !loadedSections.current.has('specialties')) tasks.push(loadSection('specialties'));
    if (section === 'service-categories' && !loadedSections.current.has('service-categories')) tasks.push(loadSection('service-categories'));
    await Promise.all(tasks);
  };

  const openCreate = async (section: EditableSection) => {
    await ensureEditorCatalogs(section);
    setEditor({ section });
  };

  const openEdit = async (section: EditableSection, item: SystemResource) => {
    setError('');
    try {
      await ensureEditorCatalogs(section);
      if (section === 'hospitals') setEditor({ section, item: await getHospitalDetail(item.id) });
      else if (section === 'articles') setEditor({ section, item: await getArticleDetail(item.id) });
      else setEditor({ section, item });
    } catch (caught) { handleError(caught); }
  };

  const refreshSection = async (section: SystemSection) => {
    loadedSections.current.delete(section);
    if (section === 'overview') await loadOverview();
    else await loadSection(section, true);
  };

  const saveEditor = async (section: EditableSection, payload: Record<string, unknown>) => {
    if (section === 'hospitals') {
      if (payload.id) await updateHospital(payload as Parameters<typeof updateHospital>[0]);
      else await createHospital(payload as Parameters<typeof createHospital>[0]);
    } else if (section === 'specialties') await saveSpecialty(payload as Parameters<typeof saveSpecialty>[0]);
    else if (section === 'service-categories') await saveServiceCategory(payload as Parameters<typeof saveServiceCategory>[0]);
    else if (section === 'icd10') await saveIcd10(payload as Parameters<typeof saveIcd10>[0]);
    else if (section === 'ingredients') await saveIngredient(payload as Parameters<typeof saveIngredient>[0]);
    else if (section === 'medicines') await saveMedicine(payload as Parameters<typeof saveMedicine>[0]);
    else {
      const { thumbnailFile, ...articlePayload } = payload;
      const savedArticle = await saveArticle(articlePayload as Parameters<typeof saveArticle>[0]);
      if (thumbnailFile instanceof File) await uploadArticleThumbnail(savedArticle.id, thumbnailFile);
    }
    setEditor(null);
    setNotice('Đã lưu thay đổi thành công.');
    await refreshSection(section);
  };

  const toggleResource = async (section: EditableSection, item: SystemResource) => {
    setError('');
    try {
      if (section === 'hospitals') {
        const hospital = item as HospitalSummary;
        if (hospital.status === 'ACTIVE') {
          const reason = window.prompt('Nhập lý do tạm ngừng cơ sở:');
          if (!reason?.trim()) return;
          await suspendHospital(hospital.id, reason.trim());
        } else await activateHospital(hospital.id);
      } else if (section === 'service-categories') {
        const category = item as ServiceCategoryItem;
        await changeServiceCategoryStatus(category.id, !category.isActive);
      } else if (section === 'medicines') {
        const medicine = item as MedicineItem;
        await saveMedicine({ id: medicine.id, code: medicine.code, name: medicine.name, strength: medicine.strength, route: medicine.route, active: !medicine.active, ingredients: medicine.ingredients.map(({ ingredientId, strength }) => ({ ingredientId, strength })) });
      } else if (section === 'articles') {
        const article = item as ArticleItem;
        await changeArticlePublication(article.id, !article.published);
      }
      setNotice('Đã cập nhật trạng thái.');
      await refreshSection(section);
    } catch (caught) { handleError(caught); }
  };

  const filterLogs = async (filters: SystemLogFilters) => {
    setLoadingSection('system-logs');
    setError('');
    try {
      const page = await searchSystemLogs(filters);
      setLogs(page.content);
      setCounts((current) => ({ ...current, 'system-logs': page.totalElements }));
    } catch (caught) { handleError(caught); }
    finally { setLoadingSection(null); }
  };

  const downloadLogs = async (filters: SystemLogFilters) => {
    try {
      const blob = await exportSystemLogs(filters);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `system-logs-${new Date().toISOString().slice(0, 10)}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
      setNotice('Đã xuất báo cáo nhật ký.');
    } catch (caught) { handleError(caught); }
  };

  const logout = async () => {
    const session = getStoredAuthSession();
    try {
      if (session?.refreshToken) await logoutSystemAdmin(session.refreshToken);
    } catch {
      // Phiên phía client vẫn phải được xóa nếu Backend không phản hồi.
    } finally {
      clearStoredAuthSession();
      router.replace('/patient/login');
    }
  };

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><LoaderCircle className="h-8 w-8 animate-spin text-blue-700" /></div>;

  const today = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
  const resourceSection: ResourceSection | null = activeSection !== 'overview' && activeSection !== 'system-logs' ? activeSection : null;

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-slate-800">
      <SystemAdminSidebar activeSection={activeSection} counts={counts} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} onLogout={() => void logout()} onOpenMobile={() => setMobileOpen(true)} onSelect={setActiveSection} />
      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 pl-20 sm:px-6 sm:pl-20 lg:px-8">
            <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Quản trị hệ thống</p><h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">{SECTION_TITLES[activeSection]}</h1></div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 md:flex"><CalendarDays className="h-4 w-4" /><span className="capitalize">{today}</span></div>
              <button aria-label="Thông báo" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50" type="button"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" /></button>
              <div className="hidden h-10 items-center gap-2 rounded-xl bg-emerald-50 px-3 text-xs font-bold text-emerald-700 sm:flex"><ShieldCheck className="h-4 w-4" /> SUPER_ADMIN</div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {error && <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" role="alert"><span className="flex-1">{error}</span><button aria-label="Đóng thông báo lỗi" onClick={() => setError('')} type="button"><X className="h-4 w-4" /></button></div>}
          {activeSection === 'overview' && loadingSection === 'overview' && !overviewLoaded ? <div className="flex min-h-[55vh] items-center justify-center"><RefreshCw className="h-7 w-7 animate-spin text-blue-700" /></div> : null}
          {activeSection === 'overview' && (overviewLoaded || loadingSection !== 'overview') && <SystemOverview onNavigate={setActiveSection} stats={stats} />}
          {resourceSection && <SystemResourceView items={resources[resourceSection]} loading={loadingSection === resourceSection} onAdd={(section) => void openCreate(section)} onEdit={(section, item) => void openEdit(section, item)} onRefresh={() => void refreshSection(resourceSection)} onToggle={(section, item) => void toggleResource(section, item)} section={resourceSection} />}
          {activeSection === 'system-logs' && <SystemLogView items={logs} loading={loadingSection === 'system-logs'} onExport={downloadLogs} onSearch={filterLogs} />}
        </main>
      </div>

      {notice && <div className="fixed bottom-5 right-5 z-[90] flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-700 shadow-xl"><span className="h-2 w-2 rounded-full bg-emerald-500" />{notice}</div>}
      {editor && <SystemEditorModal ingredients={resources.ingredients as IngredientItem[]} item={editor.item} key={`${editor.section}-${editor.item?.id ?? 'new'}`} onClose={() => setEditor(null)} onSave={saveEditor} section={editor.section} serviceCategories={resources['service-categories'] as ServiceCategoryItem[]} specialties={resources.specialties as SpecialtyItem[]} />}
    </div>
  );
}
