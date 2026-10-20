import { HospitalDetail } from '../types';

export const NHI_DONG_2_DETAIL: HospitalDetail = {
  id: 'hosp-1',
  name: 'Bệnh viện Nhi đồng 2',
  tierBadge: 'Bệnh viện Tuyến 1',
  slogan: '“Thân thiện như chính ngôi nhà của bạn”',
  bedsCount: '1.400 Giường bệnh',
  badgeRank: '1',
  address: '14 Lý Tự Trọng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  mainGate: '14 Lý Tự Trọng, P. Bến Nghé, Quận 1',
  emergencyGate: 'Đường Chu Mạnh Trinh (Cổng xe cấp cứu)',
  districtCity: 'Q.1, TP. Hồ Chí Minh',
  mapImageUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDOIJbyH-mXPHbe4svJDPIH5sIqDAmb9S_ymVVoOmg0bmDg9O_9Dc9ayZ_rIovss1ubLtyyvNpG4PwNQ0wUZZP__OEZz1qRSpi8AIkPD_P0fiZAqcoWnUNTDPBC_dlXdJqBCcTRDShga2FEksmWzzKTvdwqDVaeN_xIBsPiQaZlEalW6ZTqAOtEG4GR9uDMIR31ci4ljTD5DZczzHIYR39hWtgIPldrl_pcwdWGCZJG9uQooGfsYmqa',
  googleMapQuery: 'Bệnh viện Nhi Đồng 2, 14 Lý Tự Trọng, Bến Nghé, Quận 1, TP Hồ Chí Minh',
  feeRange: '150.000đ - 500.000đ',
  introP1:
    'Bệnh viện Nhi Đồng 2 tọa lạc trên một khu đất cao với diện tích 8,6 hecta, giáp 4 mặt tiền đường: Lý Tự Trọng, Chu Mạnh Trinh, Nguyễn Du và Hai Bà Trưng (Quận 1). Bệnh viện có vị trí đẹp và gắn liền với quá trình phát triển lịch sử của thành phố.',
  introP2:
    'Được thành lập từ ngày 01/06/1978; Bệnh viện Nhi đồng 2 là bệnh viện chuyên khoa Nhi – hạng 1, trực thuộc Sở Y tế TP.HCM. Đồng thời, cũng là một trong 4 bệnh viện Nhi hàng đầu tại Việt Nam phụ trách công tác khám, chữa bệnh cho các bé từ 0 đến dưới 16 tuổi. Bệnh viện có quy mô 1.400 giường bệnh, được xây dựng trong khuôn viên xanh mát, nhiều cây cổ thụ bóng râm thoáng đãng, sân chơi rộng rãi, đặc biệt thân thiện với trẻ em.',
  expandableIntro: [
    'Hệ thống trang thiết bị y tế hiện đại (hệ thống chụp MRI 1.5 Tesla, CT-Scanner đa lát cắt, phòng mổ nội soi tích hợp chuẩn quốc tế, máy ECMO can thiệp tuần hoàn ngoài cơ thể) cùng với đội ngũ các bác sĩ giỏi chuyên môn, giàu y đức đã đáp ứng tốt nhu cầu chăm sóc, can thiệp phẫu thuật ghép gan, ghép thận và các bệnh lý nhi sơ sinh phức tạp.',
    'Bệnh viện triển khai đồng bộ hóa quy trình tiếp đón và liên kết trực tiếp nền tảng MedConnect nhằm giảm thiểu thời gian chờ đợi tại quầy làm thủ tục cho quý phụ huynh.',
  ],
  specialties: [
    'Nhi khoa Tổng quát',
    'Ngoại Nhi & Phẫu thuật Nhi',
    'Hồi sức Cấp cứu Sơ sinh (NICU)',
  ],
  featuredServices: [
    'Khám Bệnh Thường Gặp',
    'Khám Dinh Dưỡng & Vi chất',
    'Tiêm chủng mở rộng & Dịch vụ',
    'Khám Theo Yêu Cầu Chất Lượng Cao',
    'Hô hấp & Dị ứng Miễn dịch',
    'Tâm lý & Trẻ chậm phát triển ngôn ngữ',
  ],
  workingHours: [
    {
      dayLabel: 'Thứ 2 đến Thứ 6, Buổi sáng',
      timeRange: '7h00 - 11h00',
      iconType: 'sun',
    },
    {
      dayLabel: 'Thứ 2 đến Thứ 6, Buổi chiều',
      timeRange: '13h00 - 16h00',
      iconType: 'twilight',
    },
    {
      dayLabel: 'Thứ 7 và Chủ nhật',
      subNote: '(Khám ngoài giờ / Dịch vụ)',
      timeRange: '7h00 - 19h00',
      iconType: 'weekend',
    },
    {
      dayLabel: 'Khoa Cấp Cứu',
      timeRange: '24 / 7',
      isEmergency: true,
      iconType: 'emergency',
    },
  ],
  bookingNotice: 'Phụ huynh nên đặt lịch trước ít nhất 12 tiếng để nhận đúng số thứ tự mong muốn.',
  cancellationPolicy: 'Hủy miễn phí trước 24h',
  hospitalHotline: '1900 1215',
  medconnectHotline: '1900 2805',
  insurancePolicy: {
    description:
      'Bệnh viện Nhi Đồng 2 tiếp nhận thanh toán BHYT đúng tuyến & trái tuyến theo quy định. Hỗ trợ liên kết thẻ bảo lãnh từ 25+ công ty bảo hiểm nhân thọ và tư nhân lớn tại Việt Nam.',
    acceptedBadges: [
      '✓ BHYT Toàn Quốc',
      '✓ Thẻ bảo hiểm Bảo Việt, AIA, Prudential, Manulife',
    ],
  },
  gallery: [
    {
      id: 'img-1',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe5qqt8VtHZNepstT19tLFAQ-dEf3gwVqMjZDxkKNfgFa62Mox6FC7kYx09cMDW8uK8NeOSlzEoxFwTQsET_DO0SWt8UOsEuBm6yzf8wJ3d0-7rkE_llbWdi_HprYlnslWPZXdA5F1ZPaPX_5aZU_W2s3vEpiavYedtDtdqSbZ8j9WK-TQX1ye4AM7leH5gVSFOw4Bm08MAp9_K3WGwtLOR5s4v4cDyrd2Z-_dQk2aAjP7hFxs0jC6',
      title: 'Khoa Khám Bệnh - Sảnh Tiếp Đón Trung Tâm',
      subtitle: 'Khu lễ tân hướng dẫn đăng ký khám tập trung, điều phối dòng bệnh nhi chuyên nghiệp',
      alt: 'Sảnh tiếp đón và đăng ký khám trung tâm Bệnh viện Nhi đồng 2',
      isMain: true,
    },
    {
      id: 'img-2',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKA1o_k7ryUEViSKp71wyNmHjX9U4OQWbEMgQIYYcNl0Xo3836P-8myYQLaSg67jp6RhloZPBzKoWu3OAl248cU_pfHvSTFwniT2Nky9jo6oiH4s1tcKxtLXuWAW_B5IdsRlHgWmMGxz3fFS_pRhzi4k7V76Tfyfghg3eIUexwFNkNFnCF_yzIU9A31E_aCVgP7VnWNMr5a4HFIe_m2cUYMObjVyJbWpcnA7b8NX28sr0zy0GY_EST',
      title: 'Tòa nhà điều trị kỹ thuật cao',
      alt: 'Tòa nhà điều trị kỹ thuật cao Bệnh viện Nhi Đồng 2',
    },
    {
      id: 'img-3',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1Zx5jpYdT9at8XFiaFLWd76f36NDhhq-MgZu9A6INrqL_rXyl8N5OLExrx3mrHwodXqjQxQe7Oto24n-J9y8wJFP2LYCBCzBwWDIncxoOEhHllRFntWP36XsBGCP3UpvbX1NhQk9vlQEwn6sgXLuUaFmoWheekCCoUWnZK9wZy-em4LQ4lkYLHnt0emDIMmFEgHjihMwdfIroqDM_QEGDliQeXVxu6vuJl6j6VHSejsEWDYCybe6r',
      title: 'Khuôn viên di sản 8,6 hecta',
      alt: 'Khuôn viên nhiều cây xanh thoáng mát của Bệnh viện Nhi Đồng 2',
    },
    {
      id: 'img-4',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASAggKOaEVcC9KqoAn_sT21jgJ9dh9mODWoAlAu_rm7jyXQ53GPUTR7_6CbRpZzwdDhvM-JlkQX4_v4vHzRXdnU3sKJRuC39531Fqg2zMewEWbNQf6zq6_uL9hXV8Ot6d5EsJ31qcrVGkEYrSL7eeMYRQuUslGPLe4DrXQL9r4vVpe9W_xYYGEPA1B5i7MeqM6Wg3LOG-MYReZqeSWtZW0cUOrt75J9uHihaBHALWycWi8fEDwD71i',
      title: 'Khoa Khám Yêu Cầu & Tiêm Chủng',
      alt: 'Khoa khám yêu cầu và phòng tiêm chủng Bệnh viện Nhi Đồng 2',
    },
  ],
  servicesList: [
    {
      id: 'srv-1',
      title: 'Khám Bệnh Thường Gặp & Cảm sốt',
      location: 'Tầng 1 - Khu A',
      description: 'Khám ho, sốt, sổ mũi, viêm tai giữa, phát ban và các bệnh nhiễm khuẩn đường ruột trẻ em.',
      price: 'Từ 42.100đ',
      iconType: 'child',
      accentColor: 'blue',
    },
    {
      id: 'srv-2',
      title: 'Tiêm Chủng Mở Rộng & Dịch Vụ',
      location: 'Khu Tiêm Chủng',
      description: 'Đầy đủ các loại vaccine 6in1, phế cầu, rota virus, viêm não Nhật Bản, cúm mùa với quy trình khám sàng lọc khắt khe.',
      price: 'Theo loại Vaccine',
      iconType: 'vaccine',
      accentColor: 'emerald',
    },
    {
      id: 'srv-3',
      title: 'Khám Dinh Dưỡng & Phát Triển Thể Chất',
      location: 'Tầng 2 - Khu B',
      description: 'Đo vi chất, tư vấn biếng ăn, suy dinh dưỡng, thừa cân béo phì cùng các chuyên gia dinh dưỡng đầu ngành.',
      price: 'Từ 150.000đ',
      iconType: 'nutrition',
      accentColor: 'amber',
    },
    {
      id: 'srv-4',
      title: 'Khám Theo Yêu Cầu Chất Lượng Cao (VIP)',
      location: 'Khu Khám Chất Lượng Cao',
      description: 'Khám chuyên gia TS.BS đầu ngành, phòng chờ riêng có máy lạnh, ưu tiên xét nghiệm nhanh trong ngày.',
      price: 'Từ 300.000đ',
      iconType: 'vip',
      accentColor: 'blue',
    },
    {
      id: 'srv-5',
      title: 'Tâm Lý & Âm Ngữ Trị Liệu Trẻ Em',
      location: 'Tầng 3 - Khoa TL',
      description: 'Sàng lọc sớm chậm phát triển, tự kỷ, tăng động giảm chú ý (ADHD), can thiệp rối loạn phát âm ngôn ngữ.',
      price: 'Từ 200.000đ',
      iconType: 'psychology',
      accentColor: 'emerald',
    },
    {
      id: 'srv-6',
      title: 'Khám Ngoại Khoa & Dị Tật Bẩm Sinh',
      location: 'Khu Ngoại Nhi',
      description: 'Tư vấn thoát vị bẹn, tinh hoàn ẩn, dị tật tay chân, dính thắng lưỡi, lỗ tiểu lệch thấp ở trẻ nhỏ.',
      price: 'Từ 150.000đ',
      iconType: 'surgery',
      accentColor: 'indigo',
    },
  ],
};

const HOSPITAL_DETAILS_MAP: Record<string, Partial<HospitalDetail>> = {
  'hosp-1': NHI_DONG_2_DETAIL,
  'hosp-search-2': NHI_DONG_2_DETAIL,
  'nhi-dong-2': NHI_DONG_2_DETAIL,
  'hosp-2': {
    name: 'Bệnh viện Y Học Cổ Truyền TP.HCM',
    tierBadge: 'Bệnh viện Tuyến Thành phố',
    slogan: '“Kế thừa tinh hoa y học dân tộc, phát triển y học hiện đại”',
    bedsCount: '500 Giường bệnh',
    address: '179 - 187 Nam Kỳ Khởi Nghĩa, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',
    mainGate: '179 Nam Kỳ Khởi Nghĩa, Quận 3',
    districtCity: 'Q.3, TP. Hồ Chí Minh',
    feeRange: '100.000đ - 300.000đ',
    specialties: ['Y học cổ truyền', 'Châm cứu dưỡng sinh', 'Phục hồi chức năng', 'Cơ xương khớp'],
  },
  'hosp-search-1': {
    name: 'Bệnh viện Đại học Y Hà Nội',
    tierBadge: 'Bệnh viện Tuyến Trung ương',
    slogan: '“Nơi hội tụ tri thức y khoa và lòng nhân ái”',
    bedsCount: '1.000 Giường bệnh',
    address: 'Số 1 Tôn Thất Tùng, Phường Kim Liên, Quận Đống Đa, Hà Nội',
    mainGate: 'Số 1 Tôn Thất Tùng, Quận Đống Đa',
    districtCity: 'Đống Đa, Hà Nội',
    feeRange: '150.000đ - 500.000đ',
    specialties: ['Nội tổng hợp', 'Tim mạch can thiệp', 'Tiêu hóa gan mật', 'Hô hấp'],
  },
};

export function getHospitalDetailById(id: string): HospitalDetail {
  const custom = HOSPITAL_DETAILS_MAP[id];
  if (!custom) {
    return {
      ...NHI_DONG_2_DETAIL,
      id,
    };
  }
  return {
    ...NHI_DONG_2_DETAIL,
    ...custom,
    id,
  };
}
