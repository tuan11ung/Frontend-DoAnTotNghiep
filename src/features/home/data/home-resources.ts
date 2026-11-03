export interface HomeGuide {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  sections: { title: string; body: string }[];
  action: { label: string; href: string };
}

export const HOME_GUIDES: HomeGuide[] = [
  {
    slug: 'bat-dau-dat-kham', title: 'Đặt khám trên MedConnect: bắt đầu từ đâu?',
    excerpt: 'Tìm bác sĩ, chọn cơ sở và xem lại thông tin lịch hẹn trong một hành trình.',
    image: '/images/home/patient-guide.svg',
    sections: [
      { title: 'Tìm cơ sở hoặc bác sĩ phù hợp', body: 'Từ trang chủ, chọn Đặt khám Bác sĩ hoặc Đặt khám Bệnh viện. Bạn cũng có thể dùng ô tìm kiếm để tra cứu theo tên, chuyên khoa hoặc cơ sở y tế.' },
      { title: 'Kiểm tra trước khi xác nhận', body: 'Trong trang đặt khám, chọn đúng hồ sơ người bệnh, cơ sở, bác sĩ và khung giờ. Kiểm tra phí dự kiến cùng chính sách được cơ sở công bố trước khi xác nhận lịch hẹn.' },
      { title: 'Theo dõi lịch của mình', body: 'Khi đã đăng nhập, mở menu Tài khoản và chọn Lịch khám. Tại đây bạn có thể xem lại thông tin lịch hẹn và phiếu khám. Khả năng hủy lịch phụ thuộc vào trạng thái lịch và chính sách của từng cơ sở.' },
    ],
    action: { label: 'Bắt đầu đặt khám', href: '/booking' },
  },
  {
    slug: 'theo-doi-ket-qua', title: 'Theo dõi chỉ định và kết quả sau mỗi ca khám',
    excerpt: 'Xem từng ca khám và nhận biết dịch vụ nào đang chờ hoặc đã có kết quả.',
    image: '/images/home/patient-guide.svg',
    sections: [
      { title: 'Mở đúng hồ sơ người bệnh', body: 'Từ menu Tài khoản, chọn Kết quả khám và kiểm tra hồ sơ đang xem. Danh sách hiển thị các ca khám thuộc hồ sơ được chọn.' },
      { title: 'Xem các dịch vụ đã được chỉ định', body: 'Chọn Xem kết quả ở một ca khám để xem danh sách chỉ định cận lâm sàng. Mỗi dịch vụ có một trong ba trạng thái: Chưa khám, Đang chờ kết quả hoặc Đã có kết quả. Có thể chọn ô trạng thái để lọc nhanh danh sách.' },
      { title: 'Liên hệ cơ sở khi cần hỗ trợ', body: 'Nếu không tìm thấy ca khám, hãy kiểm tra lại hồ sơ đang chọn hoặc liên hệ quầy tiếp đón của cơ sở. Bản giao diện hiện sử dụng dữ liệu minh họa; nội dung ca khám thực tế cần được đồng bộ từ cơ sở y tế.' },
    ],
    action: { label: 'Mở kết quả khám', href: '/patient/results' },
  },
];

export interface HomeResourceArticle {
  id: string;
  category: 'HEALTH' | 'SYSTEM';
  title: string;
  excerpt: string;
  image: string;
  href: string;
  source: string;
  external: boolean;
}

// Source links checked on 03/11/2026; medical guidance is read on the original site.
export const HOME_RESOURCE_ARTICLES: HomeResourceArticle[] = [
  {
    id: 'who-healthier-future', category: 'HEALTH', title: 'Những hành động nhỏ cho sức khỏe và môi trường',
    excerpt: 'Gợi ý chăm sóc sức khỏe gắn với lối sống bền vững, từ WHO Việt Nam.',
    image: '/images/home/active-living.svg',
    href: 'https://www.who.int/vietnam/vi/news/detail/12-10-2022-10-simple-actions-you-can-take-for-both-your-health-and-for-a-more-environmentally-friendly-future%21',
    source: 'WHO Việt Nam · Tiếng Việt', external: true,
  },
  ...HOME_GUIDES.slice(0, 1).map((guide) => ({ id: guide.slug, category: 'SYSTEM' as const, title: guide.title, excerpt: guide.excerpt, image: guide.image, href: `/guides/${guide.slug}`, source: 'Hướng dẫn MedConnect', external: false })),
  {
    id: 'who-healthy-diet', category: 'HEALTH', title: 'Dinh dưỡng lành mạnh: tài liệu tham khảo từ WHO',
    excerpt: 'Tìm hiểu các nguyên tắc dinh dưỡng trong tài liệu gốc của Tổ chức Y tế Thế giới.',
    image: '/images/home/balanced-meals.svg',
    href: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet', source: 'WHO · Tiếng Anh', external: true,
  },
  ...HOME_GUIDES.slice(1).map((guide) => ({ id: guide.slug, category: 'SYSTEM' as const, title: guide.title, excerpt: guide.excerpt, image: guide.image, href: `/guides/${guide.slug}`, source: 'Hướng dẫn MedConnect', external: false })),
];

export const HOME_POLICY_LINKS = [
  { title: 'Thủ tục khám, chữa bệnh BHYT', description: 'Hướng dẫn thủ tục do Bộ Y tế công bố.', source: 'Bảo hiểm xã hội Việt Nam', href: 'https://baohiemxahoi.gov.vn/tintuc/Pages/linh-vuc-bao-hiem-y-te.aspx?CateID=169&ItemID=25292&OtItem=date', external: true },
  { title: 'Luật BHYT: văn bản sửa đổi 51/2024/QH15', description: 'Tra cứu toàn văn trên cổng văn bản Chính phủ.', source: 'Cổng thông tin điện tử Chính phủ', href: 'https://vanban.chinhphu.vn/?pageid=27160&docid=212479', external: true },
  { title: 'Chính sách đặt khám của từng cơ sở', description: 'Chọn bệnh viện để xem thông tin và chính sách đặt, hủy lịch.', source: 'Danh mục cơ sở MedConnect', href: '/search?type=hospital', external: false },
];
