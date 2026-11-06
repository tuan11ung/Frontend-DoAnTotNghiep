'use client';
import { useSyncExternalStore } from 'react';
import { doctorQueueSnapshot, parseDoctorQueue, subscribeDoctorQueue } from '../api/doctor-queue-demo-store';
import { INITIAL_DOCTOR_SNAPSHOT } from '../data/doctor-queue-demo';
export function useDoctorQueue() {
  const snapshot = useSyncExternalStore(subscribeDoctorQueue, doctorQueueSnapshot, () => INITIAL_DOCTOR_SNAPSHOT);
  const data = parseDoctorQueue(snapshot);
  return { data, error: data ? '' : 'Không thể đọc hàng chờ mô phỏng. Vui lòng kiểm tra dữ liệu đã lưu trong trình duyệt.' };
}
