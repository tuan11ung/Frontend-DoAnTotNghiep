'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { countQueuePatients, filterQueuePatients } from '@/src/features/clinical-queue/queue-utils';
import type { PatientTag, QueueFilterStatus, QueuePatient, QueueShift, QueueStatus } from '@/src/features/clinical-queue/types';
import { doctorQueueApi, type DoctorQueuePatientResponse, type DoctorQueueRoomResponse } from './api/doctor-queue-api';

const POLLING_INTERVAL_MS = 15_000;

function formatTime(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 5);
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date);
}

function formatLocalTime(value: string) {
  return value.slice(0, 5);
}

function mapStatus(patient: DoctorQueuePatientResponse): QueueStatus {
  if (patient.status === 'IN_PROGRESS') {
    if (patient.clsQueueStatus === 'WAITING_RESULTS') return 'awaiting-results';
    if (patient.clsQueueStatus === 'RETURN_READY') return 'return-ready';
    return 'in-room';
  }
  return {
    WAITING: 'waiting', ABSENT: 'absent', COMPLETED: 'completed',
  }[patient.status] as QueueStatus;
}

function mapPatient(patient: DoctorQueuePatientResponse): QueuePatient {
  const gender = patient.gender === 'FEMALE' ? 'Nữ' : patient.gender === 'MALE' ? 'Nam' : 'Khác';
  const status = mapStatus(patient);
  const detail = status === 'return-ready'
    ? `Đã đủ kết quả CLS · Hoàn thành lúc ${formatTime(patient.clsCompletedAt)}`
    : status === 'awaiting-results'
      ? 'Đang thực hiện hoặc chờ kết quả CLS'
      : patient.appointReason || 'Khám theo lịch hẹn';
  const tags: PatientTag[] = [
    ...(status === 'return-ready' ? ['return' as const] : []),
    ...(patient.online ? ['online' as const] : []),
  ];
  return {
    id: patient.encounterCode || `appointment-${patient.appointmentId}`,
    number: patient.queueNumber,
    name: patient.patientName || 'Bệnh nhân',
    birthYear: patient.birthYear,
    maskedCitizenId: patient.maskedNationalId || 'Chưa cập nhật',
    gender,
    avatar: null,
    detail,
    checkIn: patient.checkedInAt ? formatTime(patient.checkedInAt) : 'Chưa check-in',
    status,
    tags,
  };
}

function mapShift(room: DoctorQueueRoomResponse, patients: QueuePatient[]): QueueShift {
  return {
    id: String(room.scheduleId),
    room: room.roomName,
    location: room.roomLocation || 'Chưa cập nhật vị trí',
    specialty: room.roomCode,
    session: room.session === 'MORNING' ? 'Ca sáng' : 'Ca chiều',
    hours: `${formatLocalTime(room.startTime)} – ${formatLocalTime(room.endTime)}`,
    patients,
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể tải hàng chờ. Vui lòng thử lại.';
}

export function useDoctorQueueApi() {
  const router = useRouter();
  const [rooms, setRooms] = useState<DoctorQueueRoomResponse[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [records, setRecords] = useState<DoctorQueuePatientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [calling, setCalling] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<QueueFilterStatus>('waiting');
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<PatientTag | ''>('');
  const [callingRecord, setCallingRecord] = useState<DoctorQueuePatientResponse | null>(null);
  const [selectedReturnId, setSelectedReturnId] = useState('');
  const [notice, setNotice] = useState('');
  const selectedScheduleRef = useRef('');

  const loadQueue = useCallback(async (room: DoctorQueueRoomResponse, signal?: AbortSignal, showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const nextRecords = await doctorQueueApi.getQueue(room.roomId, room.scheduleId, signal);
      if (selectedScheduleRef.current === String(room.scheduleId)) {
        setRecords(nextRecords);
        setError('');
      }
    } catch (loadError) {
      if (!(loadError instanceof DOMException && loadError.name === 'AbortError')) setError(errorMessage(loadError));
    } finally {
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  }, []);

  const loadRooms = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const nextRooms = await doctorQueueApi.getRooms(signal);
      setRooms(nextRooms);
      const firstRoom = nextRooms[0];
      if (!firstRoom) {
        selectedScheduleRef.current = '';
        setSelectedScheduleId('');
        setRecords([]);
        setLoading(false);
        return;
      }
      selectedScheduleRef.current = String(firstRoom.scheduleId);
      setSelectedScheduleId(String(firstRoom.scheduleId));
      await loadQueue(firstRoom, signal);
    } catch (loadError) {
      if (!(loadError instanceof DOMException && loadError.name === 'AbortError')) {
        setError(errorMessage(loadError));
        setLoading(false);
      }
    }
  }, [loadQueue]);

  useEffect(() => {
    const controller = new AbortController();
    const start = window.setTimeout(() => void loadRooms(controller.signal), 0);
    return () => {
      window.clearTimeout(start);
      controller.abort();
    };
  }, [loadRooms]);

  const selectedRoom = rooms.find((room) => String(room.scheduleId) === selectedScheduleId);

  useEffect(() => {
    if (!selectedRoom) return;
    const interval = window.setInterval(() => void loadQueue(selectedRoom), POLLING_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [loadQueue, selectedRoom]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const patients = useMemo(() => records.map(mapPatient), [records]);
  const shifts = useMemo(() => rooms.map((room) => mapShift(
    room,
    String(room.scheduleId) === selectedScheduleId ? patients : [],
  )), [patients, rooms, selectedScheduleId]);
  const shift = shifts.find((item) => item.id === selectedScheduleId);
  const counts = countQueuePatients(patients);
  const returnQueueActive = statusFilter === 'return-ready';
  const nextRecord = records.find((record) => record.nextToCall && record.encounterCode);
  const nextPatient = nextRecord ? mapPatient(nextRecord) : undefined;
  const currentPatient = patients.find((patient) => patient.status === 'in-room');
  const callingPatient = callingRecord ? mapPatient(callingRecord) : null;
  const selectedReturnPatient = records.find((record) => (
    record.encounterCode === selectedReturnId && record.clsQueueStatus === 'RETURN_READY'
  ));
  const visiblePatients = filterQueuePatients(patients, statusFilter, query, tagFilter, true);

  async function changeShift(id: string) {
    const room = rooms.find((item) => String(item.scheduleId) === id);
    if (!room || currentPatient || callingRecord) return;
    selectedScheduleRef.current = id;
    setSelectedScheduleId(id);
    setStatusFilter('waiting');
    setQuery('');
    setTagFilter('');
    setSelectedReturnId('');
    setRecords([]);
    setLoading(true);
    await loadQueue(room);
  }

  async function callNextPatient() {
    if (!nextPatient || currentPatient || callingRecord) return;
    setSelectedReturnId('');
    setCalling(true);
    try {
      const called = await doctorQueueApi.call(nextPatient.id);
      setCallingRecord(called);
      setRecords((previous) => previous.map((item) => item.encounterCode === called.encounterCode ? called : item));
      setError('');
    } catch (callError) {
      setError(errorMessage(callError));
    } finally {
      setCalling(false);
    }
  }

  async function recallPatient() {
    if (!callingRecord?.encounterCode) return 0;
    const called = await doctorQueueApi.call(callingRecord.encounterCode);
    setCallingRecord(called);
    setRecords((previous) => previous.map((item) => item.encounterCode === called.encounterCode ? called : item));
    return called.callCount;
  }

  async function admitPatient() {
    if (!callingRecord?.encounterCode || !selectedRoom) return;
    const patientName = callingRecord.patientName;
    const started = await doctorQueueApi.start(callingRecord.encounterCode);
    setCallingRecord(null);
    setNotice(`${patientName} đã vào phòng.`);
    await loadQueue(selectedRoom);
    router.push(`/doctor/encounters/${started.encounterId}?patientId=${started.patientId}`);
  }

  async function markAbsent() {
    if (!callingRecord?.encounterCode || !selectedRoom) return;
    const patientName = callingRecord.patientName;
    const absent = await doctorQueueApi.markAbsent(callingRecord.encounterCode);
    setCallingRecord(null);
    setNotice(`Đã chuyển ${patientName} sang danh sách Vắng mặt.`);
    setRecords((previous) => previous.map((item) => item.encounterCode === absent.encounterCode ? absent : item));
    await loadQueue(selectedRoom);
  }

  async function continueDiagnosis() {
    if (!selectedReturnPatient?.encounterCode || !selectedRoom || currentPatient) return;
    setContinuing(true);
    try {
      const resumed = await doctorQueueApi.resumeAfterCls(selectedReturnPatient.encounterCode);
      setRecords((previous) => previous.map((item) => (
        item.encounterCode === resumed.encounterCode ? resumed : item
      )));
      setSelectedReturnId('');
      setError('');
      setNotice(`Đã tiếp tục lượt khám của ${selectedReturnPatient.patientName}.`);
      await loadQueue(selectedRoom);
      if (resumed.encounterId) router.push(`/doctor/encounters/${resumed.encounterId}?patientId=${resumed.patientId}`);
    } catch (continueError) {
      setError(errorMessage(continueError));
    } finally {
      setContinuing(false);
    }
  }

  function changeStatusFilter(status: QueueFilterStatus) {
    setStatusFilter(status);
    if (status === 'return-ready') {
      setQuery('');
      setTagFilter('');
      return;
    }
    setSelectedReturnId('');
  }

  return {
    shifts, shift, patients, counts, nextPatient, currentPatient, callingPatient,
    currentEncounterHref: (() => { const record = records.find(item => item.encounterCode === currentPatient?.id); return record?.encounterId ? `/doctor/encounters/${record.encounterId}?patientId=${record.patientId}` : null; })(),
    initialCallCount: callingRecord?.callCount ?? 1, returnQueueActive,
    selectedReturnId, selectedReturnPatient, setSelectedReturnId, continueDiagnosis,
    visiblePatients, statusFilter, setStatusFilter: changeStatusFilter, query, setQuery, tagFilter, setTagFilter,
    filtered: Boolean(query.trim() || tagFilter),
    resetFilters: () => { setQuery(''); setTagFilter(''); },
    changeShift, callNextPatient, recallPatient, admitPatient, markAbsent,
    closeCall: () => setCallingRecord(null),
    loading, refreshing, calling, continuing, error,
    retry: () => void loadRooms(),
    refresh: () => selectedRoom && void loadQueue(selectedRoom, undefined, true),
    notice, dismissNotice: () => setNotice(''),
  };
}
