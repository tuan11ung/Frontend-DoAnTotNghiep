'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { accountRequest, loadProfile, saveAllergy, saveCondition, updateProfile } from './profile-api';
import { DEFAULT_DEMO_SNAPSHOT, parseDemo, readDemoSnapshot, subscribeDemo, updateDemo } from './profile-demo';
import { canEditHealth, type AllergyInput, type ConditionInput, type ProfileData, type ProfileInput } from './profile.types';

export function useProfile(isPreview: boolean, token: string | null) {
  const snapshot = useSyncExternalStore(subscribeDemo, readDemoSnapshot, () => DEFAULT_DEMO_SNAPSHOT);
  const [remote, setRemote] = useState<ProfileData | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => {
    if (isPreview || !token) return;
    const controller = new AbortController();
    loadProfile(token, controller.signal).then(data => {
      if (!controller.signal.aborted) { setRemote(data); setError(''); }
    }).catch(() => {
      if (!controller.signal.aborted) setError('Không thể tải hồ sơ. Hãy kiểm tra kết nối và phiên đăng nhập, rồi thử lại.');
    });
    return () => controller.abort();
  }, [isPreview, token, revision]);
  const data = isPreview ? parseDemo(snapshot) : remote;
  const message = isPreview && !data ? 'Dữ liệu mô phỏng không hợp lệ. Vui lòng kiểm tra dữ liệu đã lưu trong trình duyệt.' : error;
  const patientId = data?.profile.id;
  function requirePatient() {
    if (!patientId || !active.current || (!isPreview && !token)) throw new Error('Vui lòng đăng nhập và tải lại hồ sơ.');
    return patientId;
  }
  return {
    data, error: message, retry: () => { setError(''); setRevision(r => r + 1); },
    async savePersonal(input: ProfileInput) {
      const id = requirePatient();
      if (isPreview) updateDemo(d => ({ ...d, profile: { ...d.profile, ...input } }));
      else {
        const profile = await updateProfile(token!, id, input);
        if (active.current) setRemote(d => d ? { ...d, profile } : d);
      }
    },
    async saveAllergy(input: AllergyInput) {
      const id = requirePatient();
      if (input.id && !data?.allergies.some(a => a.id === input.id && canEditHealth(a))) throw new Error('Khai báo này không được phép chỉnh sửa.');
      if (isPreview) updateDemo(d => {
        const entry = { ...input, id: input.id ?? Math.max(0, ...d.allergies.map(a => a.id)) + 1, patientId: id, source: 'PATIENT' as const, verified: false };
        return { ...d, allergies: [...d.allergies.filter(a => a.id !== entry.id), entry] };
      });
      else {
        const entry = await saveAllergy(token!, id, input);
        if (active.current) setRemote(d => d ? { ...d, allergies: [...d.allergies.filter(a => a.id !== entry.id), entry] } : d);
      }
    },
    async saveCondition(input: ConditionInput) {
      const id = requirePatient();
      if (input.id && !data?.conditions.some(c => c.id === input.id && canEditHealth(c))) throw new Error('Khai báo này không được phép chỉnh sửa.');
      if (isPreview) updateDemo(d => {
        const entry = { ...input, id: input.id ?? Math.max(0, ...d.conditions.map(c => c.id)) + 1, patientId: id, source: 'PATIENT' as const, verified: false };
        return { ...d, conditions: [...d.conditions.filter(c => c.id !== entry.id), entry] };
      });
      else {
        const entry = await saveCondition(token!, id, input);
        if (active.current) setRemote(d => d ? { ...d, conditions: [...d.conditions.filter(c => c.id !== entry.id), entry] } : d);
      }
    },
    async deleteHealth(kind: 'allergies' | 'conditions', entryId: number) {
      const id = requirePatient();
      const entry = data?.[kind].find(e => e.id === entryId);
      if (!entry || !canEditHealth(entry)) throw new Error('Khai báo này không được phép xóa.');
      const remove = (d: ProfileData): ProfileData => kind === 'allergies'
        ? { ...d, allergies: d.allergies.filter(e => e.id !== entryId) }
        : { ...d, conditions: d.conditions.filter(e => e.id !== entryId) };
      if (isPreview) updateDemo(remove);
      else {
        await accountRequest(`${kind}/delete`, token!, { patientId: id, id: entryId });
        if (active.current) setRemote(d => d ? remove(d) : d);
      }
    },
  };
}
export type ProfileActions = ReturnType<typeof useProfile>;
