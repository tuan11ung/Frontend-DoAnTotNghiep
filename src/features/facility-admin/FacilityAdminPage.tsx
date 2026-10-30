'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  HelpCircle,
  LoaderCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { clearStoredAuthSession, getStoredAuthSession } from '../auth/auth-storage';
import { WorkScheduleScreen } from '../work-schedules/WorkScheduleScreen';
import { AdminApiError } from './api/admin-api-client';
import { facilityAdminApi } from './api/facility-admin-api';
import { medicalServiceAdminApi } from './api/medical-service-admin-api';
import { staffAdminApi } from './api/staff-admin-api';
import { AdminSidebar } from './components/AdminSidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { EntityEditorModal } from './components/EntityEditorModal';
import { FacilityInfoView } from './components/FacilityInfoView';
import { ResourceListView } from './components/ResourceListView';
import {
  INITIAL_FACILITY,
} from './data/facility-admin-data';
import type {
  AdminEntity,
  AdminSection,
  Department,
  EditorState,
  EntityKind,
  FacilityInfo,
  MedicalService,
  RankCatalogItem,
  Room,
  ServiceCategory,
  Specialty,
  SpecialtyCatalogItem,
  StaffAccount,
} from './types';

const SECTION_CONTENT: Record<AdminSection, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: 'Điều hành', title: 'Tổng quan cơ sở', description: 'Theo dõi nhanh cấu hình tổ chức, nguồn lực và tình trạng vận hành của bệnh viện.' },
  facility: { eyebrow: 'Điều hành', title: 'Thông tin cơ sở y tế', description: 'Quản lý hồ sơ công khai, giờ làm việc và chính sách đặt hoặc hủy lịch khám.' },
  'work-schedules': { eyebrow: 'Điều hành', title: 'Phân công lịch làm việc', description: 'Sắp xếp bác sĩ theo phòng và ca khám để chủ động điều phối lịch làm việc trong tuần.' },
  departments: { eyebrow: 'Cơ cấu chuyên môn', title: 'Khoa', description: 'Quản lý các đơn vị chuyên môn của cơ sở y tế.' },
  specialties: { eyebrow: 'Cơ cấu chuyên môn', title: 'Chuyên khoa', description: 'Bật, tắt hoặc bổ sung chuyên khoa từ danh mục chung của hệ thống.' },
  rooms: { eyebrow: 'Cơ cấu chuyên môn', title: 'Phòng', description: 'Quản lý phòng khám, phòng chức năng và năng lực tiếp nhận.' },
  staff: { eyebrow: 'Nguồn lực', title: 'Tài khoản nhân viên', description: 'Quản lý tài khoản và vai trò của nhân sự thuộc cơ sở.' },
  services: { eyebrow: 'Nguồn lực', title: 'Dịch vụ khám & Bảng giá', description: 'Quản lý danh mục dịch vụ, phạm vi bảo hiểm và giá niêm yết.' },
};

const SECTION_TO_KIND: Partial<Record<AdminSection, EntityKind>> = {
  departments: 'department',
  specialties: 'specialty',
  rooms: 'room',
  staff: 'staff',
  services: 'service',
};

type ToastState = { type: 'success' | 'warning'; message: string } | null;

function replaceOrAppend<T extends { id: number }>(items: T[], next: T) {
  return items.some((item) => item.id === next.id)
    ? items.map((item) => (item.id === next.id ? next : item))
    : [next, ...items];
}

export function FacilityAdminPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSection: AdminSection = pathname === '/admin/facility/work-schedules'
    ? 'work-schedules'
    : (Object.keys(SECTION_CONTENT) as AdminSection[]).find((section) => section !== 'work-schedules' && section === searchParams.get('section')) ?? 'overview';
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [facility, setFacility] = useState<FacilityInfo>(INITIAL_FACILITY);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [specialtyCatalog, setSpecialtyCatalog] = useState<SpecialtyCatalogItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [staff, setStaff] = useState<StaffAccount[]>([]);
  const [rankCatalog, setRankCatalog] = useState<RankCatalogItem[]>([]);
  const [services, setServices] = useState<MedicalService[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const navigateToSection = (section: AdminSection) => {
    if (section === activeSection) return;
    setEditor(null);
    setToast(null);
    const href = section === 'work-schedules'
      ? '/admin/facility/work-schedules'
      : section === 'overview'
        ? '/admin/facility'
        : `/admin/facility?section=${section}`;
    router.push(href);
  };

  const showToast = (nextToast: Exclude<ToastState, null>) => {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 3500);
  };

  const loadFacilityData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [hospital, departmentItems, specialtyItems, catalogItems, roomItems, staffItems, ranks, serviceItems, categories] = await Promise.all([
        facilityAdminApi.getHospital(),
        facilityAdminApi.searchDepartments(),
        facilityAdminApi.searchSpecialties(),
        facilityAdminApi.searchSpecialtyCatalog(),
        facilityAdminApi.searchRooms(),
        staffAdminApi.searchStaff(),
        staffAdminApi.searchRanks(),
        medicalServiceAdminApi.searchServices(),
        medicalServiceAdminApi.searchCategories(),
      ]);
      setFacility(hospital);
      setDepartments(departmentItems);
      setSpecialties(specialtyItems);
      setSpecialtyCatalog(catalogItems);
      setRooms(roomItems);
      setStaff(staffItems);
      setRankCatalog(ranks);
      setServices(serviceItems);
      setServiceCategories(categories);
    } catch (error) {
      if (error instanceof AdminApiError && (error.status === 401 || error.status === 403)) {
        router.replace('/patient/login');
        return;
      }
      setLoadError(error instanceof Error ? error.message : 'Không thể tải dữ liệu quản trị cơ sở.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const authSession = getStoredAuthSession();
    if (!authSession?.roles.includes('HOSPITAL_ADMIN')) {
      router.replace('/patient/login');
      return;
    }
    const initialization = window.setTimeout(() => void loadFacilityData(), 0);
    return () => window.clearTimeout(initialization);
  }, [loadFacilityData, router]);

  const counts = {
    departments: departments.length,
    specialties: specialties.length,
    rooms: rooms.length,
    staff: staff.length,
    services: services.length,
  };

  const getItems = (kind: EntityKind): AdminEntity[] => {
    if (kind === 'department') return departments;
    if (kind === 'specialty') return specialties;
    if (kind === 'room') return rooms;
    if (kind === 'staff') return staff;
    return services;
  };

  const getEditingEntity = () => {
    if (!editor?.id) return undefined;
    return getItems(editor.kind).find((item) => item.id === editor.id);
  };

  const saveEntity = async (entity: AdminEntity) => {
    const isEditing = entity.id > 0;

    if ('staffCode' in entity) {
      const saved = await staffAdminApi.saveStaff(entity);
      setStaff((items) => replaceOrAppend(items, saved));
    } else if ('price' in entity) {
      const saved = await medicalServiceAdminApi.saveService(entity);
      setServices((items) => replaceOrAppend(items, saved));
    } else if ('location' in entity) {
      const saved = await facilityAdminApi.saveRoom(entity);
      setRooms((items) => replaceOrAppend(items, saved));
    } else if ('specialtyId' in entity) {
      const saved = await facilityAdminApi.addSpecialty(entity.specialtyId);
      setSpecialties((items) => replaceOrAppend(items, saved));
    } else {
      const saved = await facilityAdminApi.saveDepartment(entity);
      setDepartments((items) => replaceOrAppend(items, saved));
    }

    setEditor(null);
    showToast({ type: 'success', message: `Đã ${isEditing ? 'cập nhật' : 'thêm mới'} dữ liệu thành công.` });
  };

  const toggleEntity = async (kind: EntityKind, id: number) => {
    try {
      if (kind === 'department') {
        const target = departments.find((item) => item.id === id);
        if (!target) return;
        const saved = await facilityAdminApi.changeDepartmentStatus(id, !target.active);
        setDepartments((items) => replaceOrAppend(items, saved));
      } else if (kind === 'specialty') {
        const target = specialties.find((item) => item.id === id);
        if (!target) return;
        const saved = await facilityAdminApi.changeSpecialtyStatus(id, !target.active);
        setSpecialties((items) => replaceOrAppend(items, saved));
      } else if (kind === 'room') {
        const target = rooms.find((item) => item.id === id);
        if (!target) return;
        const saved = await facilityAdminApi.changeRoomStatus(id, !target.active);
        setRooms((items) => replaceOrAppend(items, saved));
      } else if (kind === 'staff') {
        const target = staff.find((item) => item.id === id);
        if (!target) return;
        if (target.status === 'DEACTIVATED') {
          showToast({ type: 'warning', message: 'Nhân viên đã nghỉ việc không thể kích hoạt lại theo quy định backend.' });
          return;
        }
        const saved = await staffAdminApi.changeStaffStatus(id, target.active ? 'LOCKED' : 'ACTIVE');
        setStaff((items) => replaceOrAppend(items, saved));
      } else {
        const target = services.find((item) => item.id === id);
        if (!target) return;
        const saved = await medicalServiceAdminApi.changeServiceStatus(id, !target.active);
        setServices((items) => replaceOrAppend(items, saved));
      }
      showToast({ type: 'success', message: 'Đã cập nhật trạng thái hoạt động.' });
    } catch (error) {
      showToast({ type: 'warning', message: error instanceof Error ? error.message : 'Không thể cập nhật trạng thái.' });
    }
  };

  const saveFacility = async (nextFacility: FacilityInfo) => {
    const saved = await facilityAdminApi.updateHospital(nextFacility);
    setFacility(saved);
    showToast({ type: 'success', message: 'Đã lưu thông tin cơ sở y tế.' });
    return saved;
  };

  const uploadLogo = async (file: File) => {
    const uploaded = await facilityAdminApi.uploadLogo(file);
    setFacility((current) => ({ ...current, logoObjectKey: uploaded.objectKey, logoUrl: uploaded.url }));
    showToast({ type: 'success', message: 'Đã cập nhật logo cơ sở.' });
    return uploaded.url;
  };

  const handleLogout = () => {
    clearStoredAuthSession();
    router.replace('/patient/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4f7f7] px-5 text-center text-slate-600">
        <LoaderCircle className="h-9 w-9 animate-spin text-blue-700" />
        <p className="mt-4 font-bold text-slate-800">Đang tải dữ liệu cơ sở y tế</p>
        <p className="mt-1 text-sm">Thông tin được đồng bộ từ hệ thống quản lý bệnh viện.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4f7f7] px-5 text-center">
        <CircleAlert className="h-10 w-10 text-rose-600" />
        <h1 className="mt-4 text-xl font-extrabold text-slate-900">Không thể tải trang quản trị</h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">{loadError}</p>
        <button className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800" onClick={() => void loadFacilityData()} type="button"><RefreshCw className="h-4 w-4" /> Thử lại</button>
      </div>
    );
  }

  const currentContent = SECTION_CONTENT[activeSection];
  const currentKind = SECTION_TO_KIND[activeSection];

  return (
    <div className="min-h-screen bg-[#f4f7f7] text-slate-800">
      <AdminSidebar
        activeSection={activeSection}
        counts={counts}
        facility={facility}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        onLogout={handleLogout}
        onOpenMobile={() => setMobileNavOpen(true)}
        onSelect={navigateToSection}
      />

      <div className="min-h-screen lg:pl-[280px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center gap-4 px-4 pl-18 sm:px-6 sm:pl-20 lg:px-8 lg:pl-8 xl:px-10">
            <div className="hidden min-w-0 flex-1 items-center gap-2 text-xs font-semibold text-slate-400 sm:flex">
              <span>Quản trị cơ sở</span><ChevronRight className="h-3.5 w-3.5" /><span className="truncate text-slate-600">{currentContent.title}</span>
            </div>
            <div className="relative ml-auto hidden w-full max-w-xs xl:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder="Tìm nhanh chức năng..." type="search" />
            </div>
            <button aria-label="Trợ giúp" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50" type="button"><HelpCircle className="h-5 w-5" /></button>
            <button aria-label="Thông báo" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50" type="button"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" /></button>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
          <div className="mx-auto max-w-[1500px]">
            <div className="mb-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-blue-700">{currentContent.eyebrow}</p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{currentContent.title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{currentContent.description}</p>
            </div>

            {activeSection === 'overview' && <DashboardOverview departments={departments} onNavigate={navigateToSection} rooms={rooms} services={services} specialties={specialties} staff={staff} />}
            {activeSection === 'facility' && <FacilityInfoView key={facility.id} facility={facility} onSave={saveFacility} onUploadLogo={uploadLogo} />}
            {activeSection === 'work-schedules' && <WorkScheduleScreen />}
            {currentKind && (
              <ResourceListView
                departments={departments}
                specialties={specialties}
                items={getItems(currentKind)}
                kind={currentKind}
                onAdd={(kind) => setEditor({ kind })}
                onEdit={(kind, id) => setEditor({ kind, id })}
                onToggle={toggleEntity}
                staff={staff}
              />
            )}
          </div>
        </main>
      </div>

      {editor && (
        <EntityEditorModal
          departments={departments}
          entity={getEditingEntity()}
          kind={editor.kind}
          onClose={() => setEditor(null)}
          onSave={saveEntity}
          rankCatalog={rankCatalog}
          serviceCategories={serviceCategories}
          specialties={specialties}
          specialtyCatalog={specialtyCatalog.filter((catalogItem) => !specialties.some((item) => item.specialtyId === catalogItem.id))}
        />
      )}

      {toast && (
        <div aria-live="polite" className={`fixed bottom-5 right-5 z-[100] flex max-w-sm items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-semibold shadow-xl ${toast.type === 'success' ? 'border-emerald-200 text-emerald-800' : 'border-amber-200 text-amber-800'}`} role="status">
          {toast.type === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}

export { FacilityAdminPage as FacilityAdminScreen };
