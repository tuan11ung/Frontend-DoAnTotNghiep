"use client";
import { useEffect, useRef, useState } from 'react';
import { getStoredAuthSession } from '@/src/features/auth/auth-storage';

export function encounterDraftKey(encounterId: number, section: string) {
  const session = getStoredAuthSession();
  return `medconnect.clinical-draft:${session?.hospitalId}:${session?.staffId}:${encounterId}:${section}`;
}
export function clearEncounterDraft(encounterId: number, section: string) {
  try { sessionStorage.removeItem(encounterDraftKey(encounterId, section)); } catch { /* Storage may be unavailable. */ }
}
const guards = new Set<symbol>();
const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
const beforeNavigate = (event: MouseEvent) => {
  const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
  if (!anchor || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey
      || anchor.target === '_blank' || anchor.hasAttribute('download') || anchor.getAttribute('href')?.startsWith('#')) return;
  if (!window.confirm('Có thông tin chưa lưu trên máy chủ. Bạn vẫn muốn rời màn hình?')) {
    event.preventDefault(); event.stopPropagation();
  }
};
function useDraftGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const owner = Symbol();
    guards.add(owner);
    if (guards.size === 1) {
      window.addEventListener('beforeunload', beforeUnload);
      document.addEventListener('click', beforeNavigate, true);
    }
    return () => {
      guards.delete(owner);
      if (!guards.size) {
        window.removeEventListener('beforeunload', beforeUnload);
        document.removeEventListener('click', beforeNavigate, true);
      }
    };
  }, [dirty]);
}
export interface EncounterDraftState {
  notice: string;
  hasConflict: boolean;
  canRestore: boolean;
  restoreConflict: () => void;
  discardConflict: () => void;
}
/** A changed server baseline keeps the local draft until the clinician explicitly resolves it. */
export function useEncounterDraft<T>(encounterId: number, section: string, baseline: string, value: T,
  onRestore: (value: T) => boolean | void, dirty: boolean, guardDirty = dirty): EncounterDraftState {
  const key = encounterDraftKey(encounterId, section);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [conflict, setConflict] = useState<{ value: unknown } | null>(null);
  const restore = useRef(onRestore);
  const initialBaseline = useRef(baseline);
  useEffect(() => { restore.current = onRestore; }, [onRestore]);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const raw = sessionStorage.getItem(key);
        if (raw) {
          const saved = JSON.parse(raw);
          if (!saved || typeof saved.baseline !== 'string' || !saved.value || typeof saved.value !== 'object') {
            setConflict({ value: undefined }); setNotice('Bản nháp không hợp lệ. Nháp được giữ lại đến khi bạn chọn bỏ.');
          } else if (saved.baseline !== initialBaseline.current) {
            setConflict({ value: saved.value }); setNotice('Dữ liệu trên máy chủ đã thay đổi. Bản nháp cũ vẫn được giữ để bạn phục hồi hoặc bỏ.');
          } else if (restore.current(saved.value as T) === false) {
            setConflict({ value: undefined }); setNotice('Bản nháp không phù hợp với biểu mẫu hiện tại. Hãy kiểm tra trước khi bỏ.');
          } else {
            setNotice('Đã khôi phục bản nháp. Vui lòng kiểm tra trước khi lưu lên máy chủ.');
          }
        }
      } catch {
        setConflict({ value: undefined }); setNotice('Không đọc được bản nháp. Nội dung lưu cục bộ chưa bị xóa.');
      }
      setReady(true);
    });
    return () => { active = false; };
  }, [key]);
  const serialized = JSON.stringify({ baseline, value });
  useEffect(() => {
    if (!ready || conflict) return;
    try { if (dirty) sessionStorage.setItem(key, serialized); else sessionStorage.removeItem(key); }
    catch { queueMicrotask(() => setNotice('Trình duyệt không lưu được nháp. Hãy lưu nội dung trước khi rời màn hình.')); }
  }, [ready, dirty, key, serialized, conflict]);
  useDraftGuard(guardDirty || conflict !== null);
  return {
    notice, hasConflict: conflict !== null, canRestore: conflict?.value !== undefined,
    restoreConflict: () => {
      if (!conflict || conflict.value === undefined) return;
      try {
        if (restore.current(conflict.value as T) === false) {
          setNotice('Nội dung nháp không hợp lệ; chưa có dữ liệu nào được lưu lên máy chủ.'); return;
        }
        setConflict(null); setNotice('Đã phục hồi nháp cũ để đối chiếu. Chỉ lưu lên máy chủ sau khi bạn kiểm tra.');
      } catch { setNotice('Không thể phục hồi nội dung nháp. Nháp vẫn được giữ lại.'); }
    },
    discardConflict: () => {
      try { sessionStorage.removeItem(key); setConflict(null); setNotice('Đã bỏ nháp cũ; giữ dữ liệu hiện tại trên màn hình.'); }
      catch { setNotice('Không thể xóa nháp cũ trong trình duyệt. Vui lòng thử lại.'); }
    },
  };
}
