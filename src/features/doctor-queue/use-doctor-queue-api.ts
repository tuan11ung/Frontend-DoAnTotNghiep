'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { countQueuePatients, filterQueuePatients } from '@/src/features/clinical-queue/queue-utils';
import type { PatientTag, QueueFilterStatus, QueuePatient, QueueShift, QueueStatus } from '@/src/features/clinical-queue/types';
import { doctorQueueApi, type DoctorQueuePatientResponse, type DoctorQueueRoomResponse } from './api/doctor-queue-api';

import { watchExamQueue } from '@/src/shared/lib/exam-queue-events';

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
    if (patient.inRoom) return 'in-room';
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
    detail: patient.encounterId && status === 'waiting' && patient.consultationPaymentStatus && patient.consultationPaymentStatus !== 'PAID' ? `${patient.consultationPaymentStatus === 'FEE_PENDING' ? 'Chưa xác định phí khám' : 'Chờ thanh toán tiền khám'} · ${detail}` : patient.missedTurn && status === 'waiting' ? `Đã lỡ lượt · Nhóm đến muộn · ${detail}` : detail,
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
  const [loadedScheduleId, setLoadedScheduleId] = useState('');
  const [queueError, setQueueError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [calling, setCalling] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<QueueFilterStatus>('waiting');
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [tagFilter, setTagFilter] = useState<PatientTag | ''>('');
  const [callingRecord, setCallingRecord] = useState<DoctorQueuePatientResponse | null>(null);
  const [selectedReturnId, setSelectedReturnId] = useState('');
  const [notice, setNotice] = useState('');
  const selectedScheduleRef = useRef('');
  const requestVersion = useRef(0);
  const callingLock = useRef(false);

  const loadQueue = useCallback(async (room: DoctorQueueRoomResponse, signal?: AbortSignal, showRefresh = false, retryFailure = false) => {
    const version = ++requestVersion.current;
    if (showRefresh) setRefreshing(true);
    try {
      const nextRecords = await doctorQueueApi.getQueue(room.roomId, room.scheduleId, signal);
      if (!signal?.aborted && version === requestVersion.current && selectedScheduleRef.current === String(room.scheduleId)) {
        setRecords(nextRecords);
        setLoadedScheduleId(String(room.scheduleId));
        setQueueError('');
      }
    } catch (loadError) {
      if (!signal?.aborted && version === requestVersion.current && !(loadError instanceof DOMException && loadError.name === 'AbortError')) {
        setQueueError(errorMessage(loadError));
        if (retryFailure) throw loadError;
      }
    } finally {
      if (!signal?.aborted && version === requestVersion.current) setLoading(false);
      if (showRefresh && selectedScheduleRef.current === String(room.scheduleId)) setRefreshing(false);
    }
  }, []);

  const loadRooms = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const nextRooms = await doctorQueueApi.getRooms(signal);
      if (signal?.aborted) return;
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
    } catch (loadError) {
      if (!(loadError instanceof DOMException && loadError.name === 'AbortError')) {
        setError(errorMessage(loadError));
        setLoading(false);
      }
    }
  }, []);

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
    return watchExamQueue({ kind: 'clinic', workScheduleId: selectedRoom.scheduleId },
      signal => loadQueue(selectedRoom, signal, false, true), setQueueError);
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
  const currentPatients = patients.filter((patient) => patient.status === 'in-room');
  const currentPatient = currentPatients[0];
  const callingPatient = callingRecord ? mapPatient(callingRecord) : null;
  const selectedReturnPatient = records.find((record) => (
    record.encounterCode === selectedReturnId && record.clsQueueStatus === 'RETURN_READY'
  ));
  const visiblePatients = filterQueuePatients(patients, statusFilter, query, tagFilter, true);

  function changeShift(id: string) {
    const room = rooms.find((item) => String(item.scheduleId) === id);
    if (!room || selectedScheduleRef.current === id || currentPatient || callingRecord || callingLock.current || continuing) return;
    selectedScheduleRef.current = id;
    setSelectedScheduleId(id);
    setStatusFilter('waiting');
    setQuery('');
    setSearchInput('');
    setTagFilter('');
    setSelectedReturnId('');
    setRecords([]);
    setLoadedScheduleId('');
    setQueueError('');
    setError('');
    setRefreshing(false);
    setLoading(true);
  }

  async function callNextPatient() {
    if (!nextPatient || currentPatient || callingRecord || callingLock.current) return;
    callingLock.current = true;
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
      callingLock.current = false;
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
    if (!selectedReturnPatient?.encounterCode || !selectedRoom || currentPatient || callingRecord) return;
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
      setSearchInput('');
      setTagFilter('');
      return;
    }
    setSelectedReturnId('');
  }

  return {
    shifts, shift, patients, counts, nextPatient, currentPatient, callingPatient,
    currentEncounters: currentPatients.map(patient => {
      const record = records.find(item => item.encounterCode === patient.id);
      return { patient, href: record?.encounterId ? `/doctor/encounters/${record.encounterId}?patientId=${record.patientId}` : null };
    }),
    initialCallCount: callingRecord?.callCount ?? 1, returnQueueActive,
    selectedReturnId, selectedReturnPatient, setSelectedReturnId, continueDiagnosis,
    visiblePatients, statusFilter, setStatusFilter: changeStatusFilter, query, setQuery, searchInput, setSearchInput, tagFilter, setTagFilter,
    filtered: Boolean(query.trim() || tagFilter),
    resetFilters: () => { setQuery(''); setSearchInput(''); setTagFilter(''); },
    changeShift, callNextPatient, recallPatient, admitPatient, markAbsent,
    closeCall: () => setCallingRecord(null),
    loading, refreshing, calling, continuing, error, queueError,
    queueReady: Boolean(selectedScheduleId && selectedScheduleId === loadedScheduleId),
    retry: () => void loadRooms(),
    refresh: () => selectedRoom && void loadQueue(selectedRoom, undefined, true),
    notice, dismissNotice: () => setNotice(''),
  };
}
