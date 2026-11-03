import type { DisplayFacility, DisplayQueueTicket } from '../models/types/queue-display.types';

// Deliberately synthetic, public-safe display fixtures. No connection to patient storage.
const internalMedicineTickets: DisplayQueueTicket[] = [
  { id: 'a23', number: 'A.023', displayName: 'L.T.H', status: 'SERVING', priority: 'NORMAL' },
  { id: 'a24', number: 'A.024', displayName: 'N.V.A', status: 'CALLED', priority: 'NORMAL' },
  { id: 'a28', number: 'A.028', displayName: 'T.T.M', status: 'WAITING', priority: 'PRIORITY' },
  { id: 'a25', number: 'A.025', displayName: 'P.H.N', status: 'WAITING', priority: 'RETURN_FROM_CLS' },
  { id: 'a26', number: 'A.026', displayName: 'L.V.H', status: 'WAITING', priority: 'NORMAL' },
  { id: 'a27', number: 'A.027', displayName: 'H.T.L', status: 'WAITING', priority: 'NORMAL' },
  { id: 'a29', number: 'A.029', displayName: 'V.M.T', status: 'WAITING', priority: 'NORMAL' },
  { id: 'a30', number: 'A.030', displayName: 'Đ.T.H', status: 'WAITING', priority: 'NORMAL' },
  { id: 'a31', number: 'A.031', displayName: 'B.V.K', status: 'WAITING', priority: 'NORMAL' },
  { id: 'a32', number: 'A.032', displayName: 'N.T.P', status: 'WAITING', priority: 'NORMAL' },
  { id: 'a33', number: 'A.033', displayName: 'T.Q.B', status: 'WAITING', priority: 'NORMAL' },
  { id: 'a19', number: 'A.019', displayName: 'Đ.V.D', status: 'MISSED', priority: 'NORMAL' },
  { id: 'a21', number: 'A.021', displayName: 'P.T.T', status: 'MISSED', priority: 'NORMAL' },
];

export const QUEUE_DEMO_FACILITIES: DisplayFacility[] = [
  {
    id: 'an-khang',
    name: 'Bệnh viện Đa khoa An Khang',
    shortName: 'BV Đa khoa An Khang',
    rooms: [
      {
        id: 'noi-201', number: '201', name: 'Khám Nội tổng quát',
        department: 'Khoa Nội tổng hợp', location: 'Tầng 2 · Tòa A',
        doctorName: 'BS.CKII Nguyễn Minh Tuấn', doctorInitials: 'MT', status: 'OPEN',
        tickets: internalMedicineTickets,
      },
      {
        id: 'tim-mach-202', number: '202', name: 'Khám Tim mạch',
        department: 'Khoa Tim mạch', location: 'Tầng 2 · Tòa A',
        doctorName: 'BS.CKI Trần Thu Hà', doctorInitials: 'TH', status: 'OPEN',
        tickets: [
          { id: 'b08', number: 'B.008', displayName: 'N.T.L', status: 'SERVING', priority: 'NORMAL' },
          { id: 'b09', number: 'B.009', displayName: 'T.V.M', status: 'WAITING', priority: 'NORMAL' },
          { id: 'b10', number: 'B.010', displayName: 'L.T.A', status: 'WAITING', priority: 'NORMAL' },
          { id: 'b11', number: 'B.011', displayName: 'P.Q.H', status: 'WAITING', priority: 'NORMAL' },
          { id: 'b12', number: 'B.012', displayName: 'Đ.T.N', status: 'WAITING', priority: 'NORMAL' },
        ],
      },
      {
        id: 'nhi-203', number: '203', name: 'Khám Nhi',
        department: 'Khoa Nhi', location: 'Tầng 2 · Tòa A',
        doctorName: 'BS.CKI Lê Ngọc Mai', doctorInitials: 'NM', status: 'PAUSED',
        tickets: [
          { id: 'c15', number: 'C.015', displayName: 'N.G.B', status: 'WAITING', priority: 'NORMAL' },
          { id: 'c16', number: 'C.016', displayName: 'T.M.A', status: 'WAITING', priority: 'NORMAL' },
        ],
      },
    ],
  },
  {
    id: 'binh-an', name: 'Bệnh viện Đa khoa Bình An', shortName: 'BV Đa khoa Bình An',
    rooms: [
      {
        id: 'noi-101', number: '101', name: 'Khám Nội tổng quát',
        department: 'Khoa Nội tổng hợp', location: 'Tầng 1 · Tòa B',
        doctorName: 'BS.CKI Phạm Quang Huy', doctorInitials: 'QH', status: 'OPEN', tickets: [],
      },
    ],
  },
];
