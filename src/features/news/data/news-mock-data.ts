import {
  FeaturedHighlightItem,
  DictionaryItem,
  TopicItem,
  VideoItem,
  ExpertAdvisorItem,
  TrustPillarItem,
  MediaPartnerItem,
  NewsSectionData,
} from '../types';

export const MOCK_FEATURED_HIGHLIGHTS: FeaturedHighlightItem[] = [
  {
    id: 'highlight-1',
    badge: 'Chấn thương & Phù nề',
    badgeBgClass: 'bg-white/80 text-blue-700 backdrop-blur font-bold',
    titlePrefix: '',
    titleHighlight: '5 LỚP',
    titleRest: 'BẢO VỆ',
    subtitle: 'GIẢM SƯNG PHÙ NỀ',
    note: 'Tự tin năng động mỗi ngày',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB3tOSRnts6dV_Kjqt9doXCA_BgoI6ic2ZxDMEhonrrWLE1rXLoErgsDmmo1SHly35f4dXVG5E28zpdIULTCSP5nRCHhmHYl_lnhZLeUIzz4rF-Js9TZGxXHRhLyHB4BWvmtZz9WzxgOAYBteUFO8KcG7IsVBGME9nz5lkFGNckAowV5A-CuHhyUJlV3lL_s_iOXYW85mA71_BRep16EjIxMvM5NyLols_wrIDMskcI2uEbvBQ75spk',
    tags: ['Bong gân', 'Chấn thương mô mềm'],
    gradientClass: 'bg-gradient-to-b from-sky-400 via-sky-100 to-white',
  },
  {
    id: 'highlight-2',
    badge: 'Thai kỳ & Sau sinh',
    badgeBgClass: 'bg-white/80 text-pink-700 backdrop-blur font-bold',
    titlePrefix: '',
    titleHighlight: 'BẠN THÂN',
    titleRest: 'CỦA MẸ',
    subtitle: 'Cẩm nang sức khỏe mẹ bầu & thai nhi trọn vẹn',
    note: 'Đồng hành cùng bác sĩ sản khoa 315',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAPJ6QanQS_9O2r6zH38jm2f4mfz2CAm8MaJg5GpVdnvN1BV5QG7shBWiCivNGvgpVAojdLdpwUDWbdumu-egxJp7OWtmxb7MtYX0CuQIG26cls9tbmH1NXlgYc7yYeCuVJfbaV91jk8K3VlGs6GO2tXThQ2PwRWPD9-9nrvI3qjGd6cFqx5Jj0UpxvqEv9Ymxyq9GlKePDkStgtHJgHSecWGfGte_tyx9i3c81znLxySjwOqs-WN5Z',
    tags: ['Tam cá nguyệt', 'Dinh dưỡng thai kỳ'],
    gradientClass: 'bg-gradient-to-b from-pink-300 via-pink-50 to-white',
  },
  {
    id: 'highlight-3',
    badge: 'Thần kinh - Khớp',
    badgeBgClass: 'bg-cyan-400 text-slate-950 font-bold',
    titlePrefix: '',
    titleHighlight: 'TÊ NẶNG TÊ',
    titleRest: '',
    subtitle: 'Dấu hiệu chèn ép thần kinh và thiếu hụt dưỡng chất',
    note: 'Đừng chủ quan với cơn tê bì kéo dài',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBozD3AsXeNYQm7l8L_NVUvl4SLevb1kaDmVtJ6QV34E7sY29OzhBJ2Um3mSQv9712LXtMG_ZKvT8dkTbzfmmsJv5i2iT96yHVH-EcaDNeXavCZhaYZTaw03_zM077TqkvMI4ai_073bJ9xxC5FWqr4p5Bq9ONoDbTZ0tB5SW-eJoD63wGwi-zjPEEIM8eGVswiZW3acETvnNFpKsN847arBCl0APK_HKDxF7nCD2uTbeOYxVcEvJQA',
    tags: ['Tê bì chân tay', 'Hội chứng ống cổ tay'],
    gradientClass: 'bg-gradient-to-b from-cyan-600 via-slate-800 to-slate-900 text-white',
    textClass: 'text-white',
  },
  {
    id: 'highlight-4',
    badge: 'Ung Bướu',
    badgeBgClass: 'bg-white text-blue-700 font-bold',
    titlePrefix: '',
    titleHighlight: 'UNG THƯ PHỔI',
    titleRest: '',
    subtitle: 'Đừng để "được phát hiện muộn"',
    note: 'Tầm soát định kỳ bảo vệ lá phổi',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAfNt68w0gVmbeftzxo2AtxY2EybPzPKNlloKe2bsVSrF7vug1QYuQfWF-W4EIDZC2EMsZN1qNfia8HqeQbFgBcWqE3KaYHP4RsQPEMuZz8x-evSnU9uB95st9uhOiRXDQUDWp95z93f4IjRhJdF8M4ox0fe1aXLTRYsAbnw-49Ku3Kl_7Veh0Zf0GPcpLYws-ZLnGSSqJOXDj5qeSleOnPFNTE8iJNQuWGIASGE6YoS1E_2_6hrx-q',
    tags: ['CT xoắn ốc liều thấp', 'Phòng chống thuốc lá'],
    gradientClass: 'bg-gradient-to-b from-sky-500 via-sky-200 to-blue-50',
  },
];

export const MOCK_DICTIONARY_ITEMS: DictionaryItem[] = [
  {
    id: 'dict-1',
    name: 'Thuốc Medrol (methylprednisolon): Chỉ định & Liều dùng',
    category: 'thuoc',
    firstLetter: 'M',
    shortDesc: 'Kháng viêm steroid mạnh điều trị dị ứng nặng, viêm khớp, bệnh tự miễn.',
    detailDesc:
      'Medrol chứa hoạt chất methylprednisolon - một glucocorticoid tổng hợp có tác dụng chống viêm, ức chế miễn dịch và chống dị ứng mạnh mẽ. Thường được chỉ định trong viêm khớp dạng thấp, lupus ban đỏ hệ thống, hen phế quản nặng và các phản ứng dị ứng cấp.',
    author: 'ThS, Dược sĩ Phan Tiểu Long',
    publishDate: '12 Th12, 2019',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA6q4l6O9J09bAsiM8Yji9KUo_IpfhBvvkdtt3gmQPLxZaYwyrozu1RPmcLsyTHYgiAEPjdt5SQL2ZiqEDlaMi_RUEF0V9Qw-WKiaIcRc8RsCtZc2kwtALTZNYjDn6zhnxvP--oBDOkya_TiADLcFoUyUQV4SIlJ5PsI9cqPZXif7dQ9PHqNIQ_Z728rL8R50X_W17E_4KTTeeOPGyTdTaVMxNEkOzRZKNauFsy734auz40KQXmFyGy',
    activeIngredient: 'Methylprednisolon 4mg / 16mg',
    usage: 'Uống sau bữa ăn sáng. Không tự ý ngưng thuốc đột ngột khi dùng dài ngày.',
    contraindications: 'Nhiễm nấm toàn thân, mẫn cảm với thành phần của thuốc, đang tiêm vaccine sống.',
  },
  {
    id: 'dict-2',
    name: 'Những điều cần biết về thuốc Panadol Extra',
    category: 'thuoc',
    firstLetter: 'P',
    shortDesc: 'Giảm đau, hạ sốt nhanh chóng phối hợp Paracetamol và Caffeine.',
    detailDesc:
      'Panadol Extra chứa Paracetamol kết hợp cùng Caffeine giúp tăng cường hiệu quả giảm đau đáng kể đối với các cơn đau đầu, đau cơ, đau răng và đau bụng kinh. Tác dụng hạ sốt nhanh và an toàn khi dùng đúng liều lượng chỉ định.',
    author: 'Dược sĩ Phan Hữu Xuân Hạo',
    publishDate: '29 Th6, 2020',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC8giVasc49O1Skx-U0bPO9APUNFMlgFJkGNamMex0Y21dBTpwB8A4VVZWlN-7MuiHrQ__UQuNDhQdJMO80MmD86L32u9fIZGysNb-K4I4IYzixZBiUaDvUwtec_X3QruA4FCsO8agK5eSng6xySFted-lR9J7vBM31PzS9Pz9kCUCC_XnxdSsl5u5emBqkZ4AWVJhDCkk0sfJq0U4tB96d5brUNcl3CqNLGWinHYZAolU32wfNfqqm',
    activeIngredient: 'Paracetamol 500mg, Caffeine 65mg',
    usage: 'Người lớn: 1-2 viên mỗi 4-6 giờ. Tối đa không quá 8 viên trong 24 giờ.',
    contraindications: 'Người suy gan nặng, thiếu hụt men G6PD, mẫn cảm với paracetamol hoặc caffeine.',
  },
  {
    id: 'dict-3',
    name: 'Thuốc Augmentin: Kháng sinh, liều dùng và tác dụng phụ',
    category: 'thuoc',
    firstLetter: 'A',
    shortDesc: 'Kháng sinh phổ rộng Amoxicillin phối hợp Acid Clavulanic diệt khuẩn đề kháng.',
    detailDesc:
      'Augmentin là kháng sinh phối hợp giữa amoxicillin và acid clavulanic giúp ức chế beta-lactamase của vi khuẩn, khôi phục hoạt tính kháng khuẩn đối với nhiều chủng vi khuẩn kháng thuốc. Thường dùng trong nhiễm trùng hô hấp, tai mũi họng, tiết niệu và da.',
    author: 'Dược sĩ Nguyễn Thị Mai',
    publishDate: '18 Th11, 2021',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDcBJcErShSgd84Ty7DqhI2MVIT-Dqj9IBE-iLcP1b9TerYZGUxrYV4GgIu8UMf6La5AHE56EpeG_7-jQu6xcnJ7izInx1jYAK79CSR10Yzt-onxACpR43qc7SnkSuaE0dOr0gWVIxR_C6hvyhX-9wNG9Duzdft8KCaxJADFK39LYMXopq-nf63zxcwFQHJb4rKEWK-LBc9nMbEoW_hcOPy4-aQL1nBwhZ9QMBB5w6g118NMjxJLPjC',
    activeIngredient: 'Amoxicillin + Acid Clavulanic (1g / 625mg)',
    usage: 'Uống ngay trước bữa ăn để giảm thiểu tác dụng phụ trên đường tiêu hóa.',
    contraindications: 'Tiền sử dị ứng kháng sinh nhóm Penicillin / Cephalosporin, vàng da tắc mật do thuốc.',
  },
  {
    id: 'dict-4',
    name: 'Dược liệu Hoàng Liên: Công dụng thanh nhiệt táo thấp',
    category: 'duoc-lieu',
    firstLetter: 'H',
    shortDesc: 'Vị thuốc quý chứa hàm lượng cao Berberin giúp kháng khuẩn đường ruột.',
    detailDesc:
      'Hoàng liên (Coptis teeta) có vị đắng tính hàn, quy kinh tâm, can, đởm, vị, đại tràng. Chứa alcaloid chính là berberin có khả năng ức chế vi khuẩn lỵ, thương hàn, tụ cầu vàng và giảm viêm đường tiêu hóa rõ rệt.',
    author: 'Bác sĩ Y học Cổ truyền Lê Thị Hương',
    publishDate: '05 Th8, 2022',
    image:
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
    activeIngredient: 'Berberin hydroclorid tự nhiên > 5%',
    usage: 'Dùng dạng sắc 3-6g mỗi ngày hoặc tán bột hoàn.',
    contraindications: 'Người tỳ vị hư hàn, tiêu chảy do lạnh bụng không nên dùng.',
  },
  {
    id: 'dict-5',
    name: 'Bệnh Viêm xoang mạn tính: Phác đồ điều trị và phòng ngừa',
    category: 'benh',
    firstLetter: 'V',
    shortDesc: 'Tình trạng viêm niêm mạc các xoang cạnh mũi kéo dài trên 12 tuần.',
    detailDesc:
      'Viêm xoang mạn tính gây nghẹt mũi, chảy dịch mũi sau, giảm khứu giác và đau tức vùng mặt kéo dài. Cần kết hợp rửa mũi nước muối sinh lý, xịt corticoid tại chỗ và phẫu thuật nội soi xoang khi có chỉ định.',
    author: 'ThS.BS Đinh Thị Lan Phương',
    publishDate: '15 Th04, 2023',
    image:
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    activeIngredient: 'Chẩn đoán lâm sàng & CT-Scanner mũi xoang',
    usage: 'Tuân thủ rửa mũi ngày 2 lần và kiểm soát dị ứng môi trường sống.',
  },
  {
    id: 'dict-6',
    name: 'Giải phẫu Hệ tiêu hóa: Cấu trúc dạ dày và ruột non',
    category: 'co-the',
    firstLetter: 'G',
    shortDesc: 'Hiểu rõ cơ chế tiêu hóa thức ăn và hấp thu chất dinh dưỡng của cơ thể.',
    detailDesc:
      'Hệ tiêu hóa người là một ống cơ dài bắt đầu từ miệng và kết thúc ở hậu môn. Dạ dày chịu trách nhiệm nhào trộn và tiêu hóa sơ bộ protein, trong khi ruột non là nơi diễn ra hơn 90% quá trình hấp thu dưỡng chất vào máu.',
    author: 'TS.BS Trần Quang Nam',
    publishDate: '20 Th10, 2023',
    image:
      'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=600&q=80',
    activeIngredient: 'Enzyme tiêu hóa: Pepsin, Amylase, Lipase',
    usage: 'Duy trì chế độ ăn giàu chất xơ, uống đủ nước và hạn chế rượu bia.',
  },
];

export const MOCK_POPULAR_TOPICS: TopicItem[] = [
  { id: 'topic-1', name: 'Chăm sóc da', icon: '🧴', slug: 'cham-soc-da' },
  { id: 'topic-2', name: 'Da liễu', icon: '🖐️', slug: 'da-lieu' },
  { id: 'topic-3', name: 'Dinh Dưỡng', icon: '🥗', slug: 'dinh-duong' },
  { id: 'topic-4', name: 'Đái tháo đường', icon: '🩸', slug: 'dai-thao-duong' },
  { id: 'topic-5', name: 'Mang thai', icon: '🤰', slug: 'mang-thai' },
  { id: 'topic-6', name: 'Nhãn khoa', icon: '👁️', slug: 'nhan-khoa' },
  { id: 'topic-7', name: 'Nuôi dạy con', icon: '👶', slug: 'nuoi-day-con' },
  { id: 'topic-8', name: 'Răng - Hàm - Mặt', icon: '🦷', slug: 'rang-ham-mat' },
  { id: 'topic-9', name: 'Sức khỏe nam giới', icon: '👨', slug: 'suc-khoe-nam-gioi' },
  { id: 'topic-10', name: 'Sức khỏe nữ giới', icon: '👩', slug: 'suc-khoe-nu-gioi' },
  { id: 'topic-11', name: 'Sức khỏe tình dục', icon: '⚧️', slug: 'suc-khoe-tinh-duc' },
  { id: 'topic-12', name: 'Ung Thư', icon: '🦠', slug: 'ung-thu', colorClass: 'text-rose-600' },
];

export const MOCK_FEATURED_VIDEOS: { mainVideo: VideoItem; sideVideos: VideoItem[] } = {
  mainVideo: {
    id: 'vid-main',
    title: 'Lễ Ký Kết Hợp Tác "Viết Vì Người Bệnh" giữa MedConnect & ĐH Y Dược',
    category: 'Hợp tác chiến lược',
    categoryColorClass: 'bg-blue-600 text-white',
    publisher: 'Ban Truyền Thông MedConnect & Đại học Y Dược TP.HCM',
    duration: '08:45',
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB2xBLPx7FFeIWQW8m9tj8H4ZQ1Wu1JFtkhuoVNYkLxI-2Ke8WfvOix3XoYAacJypQom0ryqiAYTYtdEFDUT_JqJUQvYcFXiqt4XwQpXfsOlmoyH4YdF74RdtctmPu0qZsqH-vdtnJBwEKkJYrSSch_UJpfE7C0G9ygUjAkddXCYfrPFuSk8RwkmWN7UEVk4tIIz6OqrYLvJRqjuIZhdOJ48Mog_b4LjBhJMqwNBTSVcDxDR1CO04gK',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    isMain: true,
  },
  sideVideos: [
    {
      id: 'vid-side-1',
      title: 'Lễ ký kết hợp tác cùng Đại học Y Dược TP.HCM chung tay "Viết vì...',
      category: 'Tin sự kiện',
      categoryColorClass: 'text-blue-600',
      publisher: 'MedConnect Media',
      duration: '03:20',
      thumbnail:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC7MySMTaqMLQSVAAWC-9AZ0WjKtxJtrkduVJ5uRlzsnH2CjQphyCS2K8Miuau-kW5hVzEitjk1YUmsCW8_hbY2JqO4S7rmklHLxg2rjurKZMR9ULPpQ6ztqLiOYU4I19kcSW9f9tptHPmJHjQTOxbucly1z8WXGCq4vAVBAN1L2_HLvvCeliAz9jRM5-TldjMGt6DfhzdOamrCXF14pkholTcZ7wP_Yx0vd5tJBtmFg7j-txR3yB81',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
      id: 'vid-side-2',
      title: 'Bạn thân của mẹ (tập 6): Đôi bạn khỏe đẹp - Đón xuân phấn khởi',
      category: 'Talkshow Sức Khỏe',
      categoryColorClass: 'text-pink-600',
      publisher: 'Chuyên gia Sản Khoa',
      duration: '14:15',
      thumbnail:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAcrOZGCAr3tlVYj6DCUuV6RHBwq2EQ9D9U0af0EeoArnjqJqLh3qFd7fiRTr9UDMi5vbsrVNJxng2LK8DXLWRiFV8HcIyQvAyX1q4tQaPaqE5f6WqfYwUN4I16AIz02A3-D1VBqfAksKyNKkHUH5Yrf0EuDABFdjWz5bsirHHUdzJs1rpEozU1hq9LOO_7kCuZDonBt2sgghKeXU9s9ATSaRePUPP9zjwXjwXYfzawB6hZDyvkAk3M',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
      id: 'vid-side-3',
      title: 'Kiểm soát chỉ số đường huyết qua chế độ ăn thông minh hàng ngày',
      category: 'Dinh dưỡng đúng cách',
      categoryColorClass: 'text-emerald-600',
      publisher: 'BS CKII Nguyễn Văn Hùng',
      duration: '06:50',
      thumbnail:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDNfQmHFbPlxiyvCGAWfIDAQoGhE50rAP3I7H2KLAHMDGOKQmIK_0jHsFsRvm8VXNwonzDgNRiOG61tRp2VoZ2d0Io3biGcgQq3rzbb7ZzAqH6lunElO_dqw8ClEV2EYSALCOFXWeJcvfoJ8JrqYLHiGQEo-Tck0gNfiliBlQK7WK35Eyupp6rlMVvl3xHTIZSQOrrqoZKNVRlgpVqWYRQC_ZpG8QJGBWEINky4yg3j-DFLU6w8UR34',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
  ],
};

export const MOCK_EXPERT_ADVISORS: ExpertAdvisorItem[] = [
  {
    id: 'exp-1',
    name: 'ThS.BS Nguyễn Hồng Vân Khánh',
    degree: 'ThS. Bác sĩ Chuyên khoa',
    specialty: 'Gan mật tụy - Ghép gan, Nhi',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDPG7EMIWyVGMYsCm2F5L2XVSmC_540YFG0_TUR7EHa-Fs0w9h5FIUxYV8KI5zWYDLPuRRrs4HX0eQOv9tOaYvNRCICSh6VSlRP19p5IRmCKMMqR1bH-puytWMafVSOyXdVxeNxqT5o9jl2NljpBEelHP9lZjvcGDJ0xGvHEJObfiQYXXxUys966oSDBCl9VqLtAXUZkbaCmjOzVQOQf32SPql10xBMZQmcQh0CeaFVHqJgtflG1jMF',
    workplace: 'Bệnh viện Nhi Đồng 2',
  },
  {
    id: 'exp-2',
    name: 'ThS.BS Phan Lê Nam',
    degree: 'Thạc sĩ Bác sĩ',
    specialty: 'Sản phụ khoa',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBLAjqHz8_pxECnMTEFAl-SrKBscvgckAqGzBrOAAIye2_yup1lRfK212XWk0k-KEtC_X947HQTyrDn7kF3oMhZmE5_kZXZM9wyqh1__5tsaXnJcLIAkvCFwfkl6YcSFzPTbqE83q_ck5PjQ-VCg6suwNKynSkL_oRLf1pzqtDg1tZR5nStIeb8F68Ea_qO-c3JtZxPdA1udmFzMJInIGepVFvNuZ0vMmB3ot2kpPMOAyswQxyNHF_K',
    workplace: 'Bệnh viện Từ Dũ',
  },
  {
    id: 'exp-3',
    name: 'ThS.BS Đinh Thị Lan Phương',
    degree: 'Thạc sĩ Bác sĩ',
    specialty: 'Tai - Mũi - Họng',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCJeEP77bC3qhheD-assaXqyArRyMbPm2Y8-srti50OURNaN9z0JMwesWDd3Mt6jTO1LDWznibEPn_aVO5eYBC5Si0buPOoPFUXaEYYUSnHIKjiRxAs0jz4s1ZKvm9lSLLeNJr_GatGPA9TmB6re5Wuk9_LD-CtiG63aSumFE_lyPqmrRSUtYcWveJKtTo-r506DapYH8Fks7hY1RGUYQtKA9i6Xf56ZMYt3pW2379sYLfa7sICFxsU',
    workplace: 'Bệnh viện Tai Mũi Họng TP.HCM',
  },
  {
    id: 'exp-4',
    name: 'Dược sĩ Dương Anh Hoàng',
    degree: 'Dược sĩ Chuyên khoa',
    specialty: 'Dược lý lâm sàng',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuARl7zFS78bwdlUAEKrbdRRNF8D1g7gb_8ZQKYgLa29Uoa-lYPlbKhqNuASuLHlYP-piOf4rUTEN3vuBULYdO_HyPxxld3MtYOSQjgDLjCMyqFaHoDbr_40t_IvCBRd2CykzCVhqOSilYsXmhDaE_RxwOBVqb2psTDwPUaoFlhWJ8qYmmh5gCnCj4zvwA9oN8Cor0Lj-E7s8QTFywe6g6EjaqTcuPdV5C3omENpfzAze6ZXEfL38EfK',
    workplace: 'Hội đồng Dược lâm sàng',
  },
  {
    id: 'exp-5',
    name: 'ThS.BS Vũ Thành Đô',
    degree: 'Thạc sĩ Bác sĩ',
    specialty: 'Tim - Thận - Khớp - Nội tiết',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDPH8w_ls68VjwBq10jk6S2QnZjIQAjr6V7P7WQTrpJLiAdPYoZHXjis5AH2lpwfokbHS6_SaUe0vw3oInXLHqs-8FlTzirpXYV1ipcJ1KF-uv58QGH0rjt4cZlycaQq0kV_L-xzNLuPOvpH158VcU3wxvoCQeC91uHyjlG4FDINYlxfb9I_81n7UN7DDLqLKeFN5B8oIqd-X1BWafT3xAX2NtR_-IWTDk-JEiPeP0RPyXR4MoivD18',
    workplace: 'Bệnh viện Bạch Mai',
  },
  {
    id: 'exp-6',
    name: 'ThS.BS Nguyễn Trung Nghĩa',
    degree: 'Thạc sĩ Bác sĩ',
    specialty: 'Tâm thần - Trị liệu tâm lý',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAT4QwTR0HpziyyH-7sGZJAjyq6J4NvLtqBrzScAvKGRRIpjrz7C-59l3MNhIEc_TrkQqQe2oEVH1hDgXY-aFvyhxh0NSiZ_j9uef7AhJ1RaZmGtpO969IWFZ4K-5xY5OvNuSUs6QUWOmIRJCTnEEtwj_cpm138ols7hFuNK8Idz-7p1x0WjYDgKbt2reNavh5bY5U1An18mmWskgKZ8z9vRbqYA-b8lOTFiJT7zFJmDFJlS9hqBWhj',
    workplace: 'Viện Sức khỏe Tâm thần',
  },
];

export const MOCK_TRUST_PILLARS: TrustPillarItem[] = [
  { id: 'pil-1', icon: '👨‍⚕️', title: 'Biên soạn bởi Bác sĩ và Dược sĩ' },
  { id: 'pil-2', icon: '📋', title: 'Chính sách biên tập nội dung minh bạch' },
  { id: 'pil-3', icon: '👥', title: 'Thành viên ban điều hành y khoa' },
  { id: 'pil-4', icon: 'HON', title: 'Được chứng nhận bởi HON' },
];

export const MOCK_MEDIA_PARTNERS: MediaPartnerItem[] = [
  {
    id: 'med-1',
    partnerName: 'Đại học Y Dược TP.HCM',
    quote: 'Chương trình "Viết vì người bệnh": 200 bài viết y tế lan tỏa giá trị nhân văn',
    logoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCp0TukL_iElqRj3GjWXNjVQTzoWl8PaAtHAYA5iECp7uwpq3W9yLvS8uCC-zOYCejNOKsNs1HOUS81-_AB24d8RfX4T33xkvqnZcannTRk17i_zdeRrL5k6wGF0lJzV-1xmeEqCWou6yxIk2qLVF4zAwxpejJtfTiqWB-8WJn7PsBqP_L_EHV2wvd4romob19hwg0BtkOb21gaHbFWnF0X0cy_Dbck0BkPlCpYfUdpgeujjNVbrxq3',
  },
  {
    id: 'med-2',
    partnerName: 'MedConnect Hợp Tác',
    quote: 'MedConnect hợp tác cùng Đại học Y Dược TPHCM "Viết vì người bệnh"',
    logoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmaONraXSQusiAj-jNuJyfI0pVlc3avH1R_MDvqUUdNXmIZurKxYoZWFG-YFZPx7nuJ4wJGfkAHpPiyTVHJ56fayf4CKiUXGLaqMhLkM7dWXg3aJSaZ2wm1F80Ay0F7SLD6bzupsnM4ntL78sGM2d2ciZEbtecpMkMrMdK2bmkHp2VJq2wABLOXBZaRBkznn1i5vRf_xpnydL0cnIuTcnR3z_5jL5Cm3XpWYB1fE7NKhq9c-SOYq_9',
  },
  {
    id: 'med-3',
    partnerName: 'VnExpress',
    quote: "CEO MedConnect: 'Nỗ lực xây dựng nền tảng y tế toàn diện'",
    textLogo: {
      prefix: 'VN',
      suffix: 'EXPRESS',
    },
  },
  {
    id: 'med-4',
    partnerName: 'Tiền Phong',
    quote: 'MedConnect và những “cú bắt tay” để lan tỏa thông tin y khoa chính thống',
    textLogo: {
      prefix: 'Tiền',
      suffix: 'phong',
    },
  },
];

export const MOCK_ARTICLE_SECTIONS: NewsSectionData[] = [
  {
    id: 'section-hospital',
    title: 'Thông Tin Bệnh Viện',
    categorySlug: 'thong-tin-benh-vien',
    viewAllHref: '/hospitals',
    featuredArticle: {
      id: 'art-hosp-1',
      title: 'Hướng dẫn khám, chữa bệnh tại Bệnh viện A Thái Nguyên',
      excerpt:
        'Trải qua hơn 60 năm hình thành và phát triển, Bệnh viện A Thái Nguyên không chỉ là một cơ sở khám chữa bệnh quen thuộc của người dân địa phương mà còn là địa chỉ khám chữa bệnh uy tín của khu vực trung du miền núi.',
      category: 'Bệnh viện',
      categoryColorClass: 'bg-blue-50 text-blue-600',
      publishDate: '10 Th9, 2026',
      author: 'MedConnect',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDUFNo_n5uS33xJAXuCQ4Nz6VEW9uJUXwJfxOQYikxKMn4LMCZLzEGqg5l6NcbVAJ3PzwZ73U27up6UievX8dHa4w4aFCWQSJ2HBLqPJS6a1Kco0iqkS-5KxtzCfNBLTlWz1HQLKe4HBGiukVF7-T0Bl-YuqdQA13OUuMdPSdoh4nR-nxfoeMqoPbHiFeBNwKovl0CGRnYueqXkRXEwE9YGq6sZBqJxGL2Wy_6V3Rv8J-SYh1vm77rD',
    },
    sideArticles: [
      {
        id: 'art-hosp-2',
        title: 'Những điều cần lưu ý khi đi khám, chữa bệnh tại Bệnh viện Mắt Cao Thắng',
        excerpt: 'Kinh nghiệm đặt lịch, quy trình khám khúc xạ và phẫu thuật đục thủy tinh thể.',
        category: 'Bệnh viện',
        categoryColorClass: 'bg-blue-50 text-blue-600',
        publishDate: '22 Th4, 2020',
        author: 'MedConnect',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDnEc9uxxrAFdWjSdxPM1KW_JkBS0oKMtKvnMXPU6PQ0G3_ExqOoo3hlVm0HgPvz9lmuA1epJuvXtVA2o_fASxsRYdN6zqg85PllFfHXp55UGwuGD_UaKBDClHDK8p_6Oz5N8ereDSSnhcA4UiL2gFyFazbU0yF2IX8i-T90dcKLGxEK2cMCBdXZKhDUY0PGzraQtSxw35rWLrAPwWOlCFgBF0U0P7Al5XpFUnDuD483bN2P-K5T342',
      },
      {
        id: 'art-hosp-3',
        title: 'Bệnh viện Răng Hàm Mặt TP HCM có tốt không? Quy trình và bảng giá',
        excerpt: 'Đánh giá chuyên sâu về cơ sở vật chất, đội ngũ bác sĩ và bảng giá dịch vụ mới nhất.',
        category: 'Bệnh viện',
        categoryColorClass: 'bg-blue-50 text-blue-600',
        publishDate: '23 Th4, 2021',
        author: 'MedConnect',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCSJR8FK5ouwWUEi_L-jXuODu2mTgxOX6gvXfx4p9CdED7CM5dRt4FkF3-jFmHk1dH7M8wm9QJYdln_aq3D5s8Cpjmtx8rDCARZNKJfDV2E-It6-Mis0JBnn27kbG1JUu6hAxgzZ1s7CtMRVWIxvGBUsv3ZRT9H3DMq0F3CsvJ71cel2Q8fmMHgla0LxsFhnqKOR9ey0FvNv66XKub8nhZADshXINcOLDe8zGP_VeFVwDyaxTWd8hdN',
      },
    ],
  },
  {
    id: 'section-symptoms',
    title: 'Triệu Chứng & Bệnh',
    categorySlug: 'trieu-chung-va-benh',
    viewAllHref: '#trieu-chung',
    featuredArticle: {
      id: 'art-symp-1',
      title: 'Tầm quan trọng của việc xây dựng thương hiệu cá nhân cho Bác sĩ trong thời đại số',
      excerpt:
        'Ngày nay, việc xây dựng thương hiệu cá nhân cho Bác sĩ ngày càng trở nên quan trọng. Đây không chỉ là hành trình khẳng định chuyên môn, mà còn là cầu nối vững chắc nâng cao uy tín và lòng tin với bệnh nhân.',
      category: 'Sức khỏe số',
      categoryColorClass: 'bg-blue-50 text-blue-600',
      publishDate: '09 Th10, 2025',
      author: 'MedConnect',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB1RJfGsEYSeGoJUUVzTje7w9OcCtxSnF4OZH0MAgpyyFBBmZXb5o3CIeZOHEvlP4xPhOe_yOKvyFEUCiovp-CtGeI6JQ1iwqQNpgfsb_2sCyPY7LFY-qn5yWxQMLThKn5Oe5wdrzBukjQKSiXgrQAzNX20_iEmfra8gHrYTG0wWmwO5-JjCYimENzEgfaL1dnblBMgc6FKLw-F7sxBnr4kSYHeqlr-ALH4Wj6wRUNPiQ1bN8mE8tzm',
      isSponsored: true,
    },
    sideArticles: [
      {
        id: 'art-symp-2',
        title: 'Viêm khớp ngón tay: Nguyên nhân, triệu chứng và các phương pháp phục hồi',
        excerpt: 'Cảnh báo sớm thoái hóa khớp bàn tay, ngón tay và bài tập phục hồi chức năng.',
        category: 'Cơ Xương Khớp',
        categoryColorClass: 'bg-indigo-50 text-indigo-600',
        publishDate: '02 Th11, 2020',
        author: 'ThS.BS Vũ Thành Đô',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCqiZXE5SJG3mG2eZWgnsanZimqNE7hMNAbdipM-J7KDEGC6ZoDCp0ysGf98J0j_NfvVepw115bkSm1ZPT-6_r9ymhdBFJ7Wqk63LQMPepEHW9-Xsrc537ZwvPWf8TvtkuprorebCs296jFqaGjzooMrlPRqM2n5AcbZKWTwA9A3U9UhDf8Yhm7GMhwM4y4s701S3tXOJI2bVzTwE2oS5OeFKqEUGfXXZvfiFX_Nb6HE1gFxbijsF53',
      },
      {
        id: 'art-symp-3',
        title: 'Bệnh phổi tắc nghẽn mạn tính (COPD): Nguyên nhân & Cách điều trị',
        excerpt: 'Nhận biết sớm cơn khó thở, ho có đờm mạn tính và quản lý bệnh lý hô hấp kéo dài.',
        category: 'Bệnh hô hấp',
        categoryColorClass: 'bg-cyan-50 text-cyan-600',
        publishDate: '12 Th11, 2019',
        author: 'ThS.BS Trần Thanh Long',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDiEyOk_MzFZajgaOtV32ydmwA55ENtIkszZIRfiY7Jzsai0B_ZVRUmXJvxdHsdS5Uo1RTW2zq7jeo_ABVgmucrNd7DmumflOr9CRbIFo21ahoZl19RJBRUQG3GIFQ1iZpufvJNqcr5LGkjU69wxq8efb_2Bd2TaFC7MSMuhlbBI6F5EI_K3M4LD8Gnvk7H1It9xF3YQBrMWcMS3xBlXV68cYmAA-h5tflxoRdq1lE8mY0wbjcqr-SR',
      },
    ],
  },
  {
    id: 'section-maternity',
    title: 'Chăm Sóc Mẹ Bầu',
    categorySlug: 'cham-soc-me-bau',
    viewAllHref: '#me-bau',
    featuredArticle: {
      id: 'art-mat-1',
      title: 'Tầm quan trọng của việc theo dõi sức khỏe thai kỳ định kỳ với Bác sĩ sản khoa',
      excerpt:
        'Chăm sóc mẹ bầu đúng cách trong từng tam cá nguyệt là chìa khóa để đảm bảo sự phát triển toàn diện của thai nhi và sự hồi phục an toàn của người mẹ sau sinh. Đừng bỏ lỡ các mốc siêu âm sàng lọc dị tật quan trọng.',
      category: 'Sức khỏe số & Sản khoa',
      categoryColorClass: 'bg-pink-50 text-pink-600',
      publishDate: '09 Th10, 2025',
      author: 'MedConnect',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBKByKiymFqzz8fsXO6b5V5mCoIQZqSFTtgWSHKlOpdMCrcf3t2bfuYSQYalAS8OgVVcDHcaIsiYtwSjFUcslkLXdckDQrMykWzR46fUBJxi5GEFRv19oXoN_AvsG2PbJYcZm7FWcuN8Fvge3veTNbyhEbGSNhufQg2iHGTeaTKfgfnZrO244Yb2IyDAegSeDPXxydf2VT88Kx0CnNd29rBLRCjFBb1k_BF3kfmWoCPuhZ0gIbdY3Jh',
      isSponsored: true,
    },
    sideArticles: [
      {
        id: 'art-mat-2',
        title: 'Dưỡng da khi mang thai: Mẹ bầu cần lưu ý những gì để an toàn cho thai nhi?',
        excerpt: 'Danh sách thành phần mỹ phẩm an toàn và các hoạt chất cần tuyệt đối tránh xa.',
        category: 'Chăm sóc mẹ bầu',
        categoryColorClass: 'bg-pink-50 text-pink-600',
        publishDate: '12 Th10, 2020',
        author: 'ThS.BS Phan Lê Nam',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAe3IDt0L0o5YjrfL1Ya5fjA47BV0gafrfrt334WPcyZcNAjbF2ystEUWNK6h8beozCo9BYgBjYYEgCDwbNazI1ZjIyIQapTrtI21hg3TTDv6JZp0k4SIYMqOIeosw01vMhpptu8S7MUZNLMTe8A7MaTP7uXXgbjcl0h4zaosD0dcKGqKKIN2CdvkdtWbWPSZmJE-wAZOMvYqKvJqsUmFbsiHeD4z_D8W8zv44WuQjb8c8JL7qxFN4Q',
      },
      {
        id: 'art-mat-3',
        title: 'Tiêm trưởng thành phổi thai nhi: Lợi ích, tác dụng phụ và khi nào cần tiêm?',
        excerpt: 'Chỉ định tiêm trong trường hợp dọa sinh non trước tuần 37 để bảo vệ trẻ.',
        category: 'Chăm sóc mẹ bầu',
        categoryColorClass: 'bg-pink-50 text-pink-600',
        publishDate: '30 Th9, 2020',
        author: 'ThS.BS Phan Lê Nam',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBquL6PfxMhA_y0y1k7uZGFXuI3kvQxUoDwG45KFQ38kofwbkl_vyLB2ZPgcAyI82IC4IiXxoWoWGztkoQtUMnSSNjRFPxQzN-z9ZPRxj3lm6_jkAVAs_tJysJsEY0w1P78HZDh4D7buFTfDUoneex3FhaPsUQuRXSmYve0sf6hQm6eaJdpf5M6Ux9Tf2NxSnGlDnwZnQ3yfXh9fgD2hRsFt46WBVe5F2Dj-RilUkDh5xYDNO3ccP7b',
      },
    ],
  },
];
