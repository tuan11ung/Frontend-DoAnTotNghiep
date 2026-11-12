'use client';

import { useEffect, useState } from 'react';
import { loadDoctorScheduleWeek } from '../api/doctor-schedule-api';
import type { DoctorScheduleShift } from '../doctor-schedule.types';

export function useDoctorSchedule(weekStart: string, token: string) {
  const [revision, setRevision] = useState(0);
  const key = `${token}:${weekStart}:${revision}`;
  const [result, setResult] = useState<{ key: string; shifts: DoctorScheduleShift[]; error: string | null }>({ key: '', shifts: [], error: null });
  useEffect(() => {
    const controller = new AbortController();
    void loadDoctorScheduleWeek(weekStart, controller.signal).then(shifts => {
      if (!controller.signal.aborted) setResult({ key, shifts, error: null });
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setResult({ key, shifts: [], error: error instanceof Error ? error.message : 'Không thể tải lịch làm việc. Vui lòng thử lại.' });
    });
    return () => controller.abort();
  }, [key, weekStart]);
  const current = result.key === key;
  return { shifts: current ? result.shifts : [], error: current ? result.error : null, loading: !current, reload: () => setRevision(value => value + 1) };
}
