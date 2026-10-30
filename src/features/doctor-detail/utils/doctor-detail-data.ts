import { DoctorDetail } from '../types';

export const DEFAULT_DOCTOR_DETAIL: DoctorDetail = {
  id: 'dr-phong',
  name: 'Bác sĩ chuyên khoa I Trịnh Quốc Phong',
  avatarUrl:
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
  experienceYears: 11,
  titleBadge: 'Bác sĩ',
  specialty: 'Răng - Hàm - Mặt',
  position: 'Bác sĩ Răng Hàm Mặt',
  workplace: 'BV Đa Khoa Tỉnh Khánh Hòa',
  fee: '500.000 VNĐ',
  feeNote: '(Dự kiến)',
  bioP1:
    'Sinh ra và lớn lên tại Phú Yên, bác sĩ Trịnh Quốc Phong sớm lựa chọn con đường Y khoa như một cách để cống hiến cho sức khỏe cộng đồng. Sau nhiều năm công tác tại Bệnh viện Đa Khoa Tỉnh Khánh Hòa trong chuyên ngành Răng - Hàm - Mặt, bác sĩ Phong đã điều trị thành công hàng ngàn ca bệnh lý nha khoa chuyên sâu...',
  expandableBio:
    'Bác sĩ không ngừng trau dồi chuyên môn qua các hội nghị nha khoa quốc tế, ứng dụng công nghệ chẩn đoán hình ảnh 3D và các kỹ thuật can thiệp thẩm mỹ răng hàm mặt ít xâm lấn, đem lại kết quả điều trị tối ưu và sự an tâm tối đa cho người bệnh.',
  treatmentSpecialties: [
    'Đái tháo đường & biến chứng',
    'Bướu cổ & tuyến giáp',
    'Tiền tiểu đường',
    'Tiểu đường tuýp 1',
    'Tiểu đường tuýp 2',
    'Răng hàm mặt tổng quát',
  ],
  clinicAddress: '8 Phan Phú Tiên, Phường 10, Quận 5, Hồ Chí Minh',
  clinicMapQuery: '8 Phan Phú Tiên, Phường 10, Quận 5, Hồ Chí Minh',
  clinicImages: [
    {
      id: 'clinic-img-1',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0uObXf-zsHExFuFsAsbYn607tc7Tbgf5cyg0pR37SMx9gpd8FmXr54ha2WgpRvlqdGuFlWjDnC-vui5KZsZzkzoMQ7n1L9UMTKcqNUn249pXCaINOg3LF242BPkQeYBsMfFTMdGAP0QH-OIcxQxX2KFVPxWVuB9h7GD1Nifu_Pfpre8R4X2tiLH-dRrzkQRHIHiBrF5dxfWNdDgxOguuzsnQEt1eo3wKY-d_nhhM1DuuV2hMa20e-5KrdaEDFSUupnA',
      alt: 'Sảnh đón tiếp phòng khám',
    },
    {
      id: 'clinic-img-2',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0uObXf-zsHExFuFsAsbYn607tc7Tbgf5cyg0pR37SMx9gpd8FmXr54ha2WgpRvlqdGuFlWjDnC-vui5KZsZzkzoMQ7n1L9UMTKcqNUn249pXCaINOg3LF242BPkQeYBsMfFTMdGAP0QH-OIcxQxX2KFVPxWVuB9h7GD1Nifu_Pfpre8R4X2tiLH-dRrzkQRHIHiBrF5dxfWNdDgxOguuzsnQEt1eo3wKY-d_nhhM1DuuV2hMa20e-5KrdaEDFSUupnA',
      alt: 'Khu vực chờ thăm khám tiện nghi',
    },
    {
      id: 'clinic-img-3',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBb5NbSWRSxKo17WROQ1HPtsjFVRV0QNmPemiEhUxJSO19vPJc1BOh_kfmo9NK-pa1b7a-aHW74MiV6Qh2OGq78dgYXZFk2q9AJkabm9MIv9JeAaCFCLlzd3sXtGFpy8oRMCUz29UgmGqSR7V06iBwamMj3sVROYUTWqjqpJT4VzR3uISPlU37NT5vNOrjnDCDiy8asOPrUKueVeEm2Kit5o9lpp-h87tYjnnRqKfUtOKlewHJT6XtVYbPcGq-4XrSkeg',
      alt: 'Phòng khám chuyên khoa tiêu chuẩn',
    },
  ],
  schedules: [
    { id: 'date-1', dayText: 'Thứ 5', dateText: '15-10', slotCountText: '18 khung giờ' },
    { id: 'date-2', dayText: 'Thứ 6', dateText: '16-10', slotCountText: '18 khung giờ' },
    { id: 'date-3', dayText: 'Thứ 7', dateText: '17-10', slotCountText: '18 khung giờ' },
    { id: 'date-4', dayText: 'CN', dateText: '18-10', slotCountText: '16 khung giờ' },
    { id: 'date-5', dayText: 'Thứ 2', dateText: '19-10', slotCountText: '18 khung giờ' },
    { id: 'date-6', dayText: 'Thứ 3', dateText: '20-10', slotCountText: '20 khung giờ' },
  ],
  morningSlots: [
    '08:00 - 08:30',
    '08:30 - 09:00',
    '09:00 - 09:30',
    '09:30 - 10:00',
    '10:00 - 10:30',
    '10:30 - 11:00',
    '11:00 - 11:30',
    '11:30 - 12:00',
  ],
  afternoonSlots: [
    '14:00 - 14:30',
    '14:30 - 15:00',
    '15:00 - 15:30',
    '15:30 - 16:00',
    '16:00 - 16:30',
    '16:30 - 17:00',
    '17:00 - 17:30',
    '17:30 - 18:00',
    '18:00 - 18:30',
    '18:30 - 19:00',
  ],
  hotline: '1900-2805',
};

const DOCTORS_MAP: Record<string, Partial<DoctorDetail>> = {
  'dr-1': {
    name: 'PGS. TS. BS Trần Quang Nam',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAcr3lnsPFgivCg2ClOBs6CEi_AdWMmeiIczUGlymA3UKoamGo8iKjGxQe2AI-cu5iJs5w5qTLUeJKhfI16XQPZgxq7fYJG7QNvvaAlW5hgYOQztdtRWFuvHMWJYiq2QATsAlGdsWDA2TzY5fbLXuW0C2xwqBPgSoQfO0FXG-zHOBaA2Kk_ODPKoGASZsEL-eA66TT24jhYuG_QMfeG77xBeopBTO4uI2Ae9wxDf3FzpJuvmsxvrqmJ',
    experienceYears: 25,
    titleBadge: 'Phó Giáo Sư',
    specialty: 'Nội tiết - Đái tháo đường',
    position: 'Trưởng khoa Nội tiết',
    workplace: 'BV Đại Học Y Dược TP.HCM',
    fee: '500.000 VNĐ',
    treatmentSpecialties: [
      'Đái tháo đường & biến chứng',
      'Bướu cổ & bệnh tuyến giáp',
      'Bệnh tuyến yên - tuyến thượng thận',
      'Rối loạn chuyển hóa lipid',
      'Tiền tiểu đường & béo phì',
    ],
    clinicAddress: '215 Hồng Bàng, Phường 11, Quận 5, TP. Hồ Chí Minh',
    clinicMapQuery: 'Bệnh viện Đại học Y Dược TP.HCM 215 Hồng Bàng',
  },
  'dr-2': {
    name: 'BS. CKII Lê Thị Minh Hồng',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAzqBp7URNhLFD_cBdaDUWxSIbRiPjkfsZKD_2LRIONQjLaq5ahQH57M_ZB6JPaLO84gP2a0BqDkjNPm0-MglkrxZFnjUUnfWzBiJ-o0lnyOYxuBdpwajqMwGOATEiRmBezrLJuLBXYwazHUhSfMtJDgDbFG2h1RvNvkA54HIO0QDl0hu_cMQHrqeIwmcukml6SO9Plgl7Xe86xVAmtNOUpTsQGi3i47wMskVGSKFFLitlntrWw85sM',
    experienceYears: 22,
    titleBadge: 'Bác sĩ CKII',
    specialty: 'Nhi khoa - Hô hấp',
    position: 'Phó Giám đốc',
    workplace: 'Bệnh viện Nhi Đồng 2',
    fee: '450.000 VNĐ',
    treatmentSpecialties: [
      'Hô hấp nhi & viêm phổi',
      'Hen suyễn ở trẻ em',
      'Dị ứng & Miễn dịch nhi',
      'Nhi khoa tổng quát',
      'Tư vấn tiêm chủng',
    ],
    clinicAddress: '14 Lý Tự Trọng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    clinicMapQuery: 'Bệnh viện Nhi Đồng 2 14 Lý Tự Trọng',
  },
  'dr-3': {
    name: 'PGS. TS. BS Lâm Việt Trung',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC8cr2uZIOPxmTN2VViUBhBbAp5mrbtGCXzMqd_HgbnQUHM0iRtl2po8d07RTks7xqGLOP-7MZtQccWnPuHwgeUDqk1HaFKjyWcKzQyApYqVTiAyoyn8cVuJhq4TQm4V_QNG44vgRhzTEJneKOpZ0fRM6APYoMIDeR0F8e0WGfJhTNpYfzl4FHwmAnndP1ZEYIPPpmGuA1nDaLfOgq96P8lBALxCyV7M3yskT2H4q-X05Ickul56B_9',
    experienceYears: 28,
    titleBadge: 'Phó Giáo Sư',
    specialty: 'Tiêu hoá • Ngoại tiết niệu',
    position: 'Phó Giám đốc',
    workplace: 'Bệnh viện Chợ Rẫy',
    fee: '500.000 VNĐ',
    treatmentSpecialties: [
      'Phẫu thuật tiêu hóa - gan mật',
      'Nội soi can thiệp tiêu hóa',
      'Bệnh lý dạ dày - tá tràng',
      'Bệnh lý đại trực tràng',
      'Ngoại tiết niệu',
    ],
    clinicAddress: '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP. Hồ Chí Minh',
    clinicMapQuery: 'Bệnh viện Chợ Rẫy 201B Nguyễn Chí Thanh',
  },
  'dr-4': {
    name: 'BS. CKII Nguyễn Thị Thu Hà',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBg3YSHJcKUUmwQSAXmvpu5o9dfmdTef_-n2osyzjwxUob5-phvdl_jaRkONBC8roM49KTkpvQJ6cv4rJ_bZvJTWcaUvAy4QrhL8Layr6YJmFYVSAAMkiwwVrZdbSAFOkoQ0mVm_5zuLXagL30Kv1rvxQzHenaUNaViLdO4_Q2n0BhrRGkc7L31nLAiVNm_Z3DCIASPrVosY1O8tAuZVoX_fxzoKjfco8qv0BV1QlN8G8mcqNavI6fi',
    experienceYears: 19,
    titleBadge: 'Bác sĩ CKII',
    specialty: 'Nhi khoa - Sơ sinh',
    position: 'Trưởng khoa Sơ sinh',
    workplace: 'Bệnh viện Nhi Đồng 1',
    fee: '400.000 VNĐ',
    treatmentSpecialties: [
      'Chăm sóc trẻ sơ sinh & sinh non',
      'Dinh dưỡng nhi & biếng ăn',
      'Các bệnh nhiễm khuẩn ở trẻ',
      'Theo dõi phát triển thể chất',
      'Tiêm chủng mở rộng',
    ],
    clinicAddress: '341 Sư Vạn Hạnh, Phường 10, Quận 10, TP. Hồ Chí Minh',
    clinicMapQuery: 'Bệnh viện Nhi Đồng 1 341 Sư Vạn Hạnh',
  },
};

export function getDoctorDetailById(id: string): DoctorDetail {
  const custom = DOCTORS_MAP[id];
  if (!custom) {
    return {
      ...DEFAULT_DOCTOR_DETAIL,
      id,
    };
  }
  return {
    ...DEFAULT_DOCTOR_DETAIL,
    ...custom,
    id,
  };
}
