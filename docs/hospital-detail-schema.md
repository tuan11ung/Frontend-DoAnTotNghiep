# Chi tiết bệnh viện theo cấu trúc dữ liệu

Đối chiếu ngày 13/11/2026 bằng truy vấn chỉ đọc trong container `qlbv-postgres`, database `qlbv`, và DTO/controller trong backend `Do_an`. Không sửa database hoặc backend.

## Dữ liệu trong Docker

Bảng `hospital` có các trường:

| Nhóm | Các cột |
| --- | --- |
| Định danh | `id`, `code`, `name`, `level` |
| Liên hệ | `province`, `address`, `hotline`, `email` |
| Giới thiệu | `logo_object_key`, `introduction` |
| Lịch làm việc | `morning_start`, `morning_end`, `afternoon_start`, `afternoon_end`, `working_days` |
| Cấu hình lịch | `slot_minutes`, `slot_capacity`, `online_percent`, `booking_weeks_ahead` |
| Chính sách | `cancel_before_hours`, `refund_percent`, `policy_text` |
| Quản trị | `status`, `suspend_reason`, `created_at`, `updated_at` |

`working_days` dùng 1–7 tương ứng thứ Hai đến Chủ nhật. Tuyến bệnh viện dùng nhãn của enum backend: CENTRAL = Trung ương, PROVINCIAL = Tuyến tỉnh, DISTRICT = Tuyến xã.

Chuyên khoa lấy từ `hospital_specialty` nối `specialty`; chỉ lấy quan hệ đang hoạt động. Dịch vụ/đơn giá lấy từ `service` nối `service_category`, lọc dịch vụ và nhóm đang hoạt động.

Không có trường số giường, khẩu hiệu, bộ ảnh, cổng cấp cứu, tổng đài nền tảng, chính sách BHYT/bảo lãnh chi tiết hay mức giá khám chung trong `hospital`. Trang mới không dùng các nội dung gắn cứng này. Không coi giá CLS là giá khám bác sĩ.

## Giao diện

- Header: tên, mã, tuyến, trạng thái nếu có, địa chỉ, điện thoại, email và nút đặt khám. Logo chưa có dùng biểu tượng cơ sở; không hiển thị logo của bệnh viện khác.
- Thông tin chung: giới thiệu, chuyên khoa, liên hệ/chỉ đường, ngày/giờ sáng–chiều, số tuần cho phép đặt trước, độ dài khung giờ, hạn hủy, tỷ lệ hoàn theo cấu hình và nội dung chính sách.
- Dịch vụ & bảng giá: mã, tên, nhóm và giá từng dịch vụ; tìm tên/mã, lọc nhóm, phân trang 10 dòng và cuộn ngang riêng trên điện thoại.
- Thiếu dữ liệu hiển thị Chưa cập nhật hoặc trạng thái trống, không kế thừa dữ liệu từ Bệnh viện Nhi Đồng 2. ID không xác định trả 404. Cơ sở SUSPENDED không có nút đặt khám.
- `slot_capacity`, `online_percent`, lý do đình chỉ và mốc tạo/cập nhật là thông tin vận hành; không đưa vào luồng thông tin công khai của người bệnh.

## Chế độ mock hiện tại

Theo yêu cầu dùng mock của dự án, chưa kết nối trực tiếp trang này với PostgreSQL hoặc thêm API thu thập dữ liệu. File `hospital-public-snapshot.json` là bản chụp có chọn lọc các trường công khai của bệnh viện mẫu ID 1 cùng chuyên khoa/dịch vụ; không chứa dữ liệu bệnh nhân, tài khoản hay mật khẩu. Không tự làm mới khi database thay đổi.

Mở `/hospitals/1` để xem Bệnh viện Demo: tuyến tỉnh, 07:00–11:30 / 13:30–17:00, thứ 2–thứ 7, khung giờ 30 phút, đặt trước 4 tuần, hạn hủy 24 giờ, tỷ lệ hoàn cấu hình 100%, 1 chuyên khoa và 150 dịch vụ. Giới thiệu, logo và chính sách chi tiết đang trống nên dùng placeholder. Giá trong DB là giá mẫu phát triển, không phải giá áp dụng thực tế hay biểu giá do Bộ Y tế ban hành.

Các ID minh họa từ trang chủ/danh sách (`hosp-*`, `hosp-search-*`, `clinic-search-*`, `nhi-dong-2`) vẫn mở đúng danh tính mock tương ứng. Không gán chính sách/giờ/giá của ID 1 cho các cơ sở đó; các trường chưa có sẽ trống. Các đường dẫn đặt khám vẫn dùng `hospitalId` hiện tại và qua cổng yêu cầu đăng nhập.

Backend có POST `/public/hospitals/detail` (`{id}`) trả `HospitalPublicResponse`, trong đó `logoUrl` do server giải từ object key; và POST `/public/hospitals/specialties/search`. Đây là điểm nối phù hợp khi triển khai API thật. Không dùng object key như một URL hoặc gọi endpoint quản trị từ trang công khai.

## Kiểm tra

ESLint, Next typegen và TypeScript. Kiểm tra trình duyệt cho danh tính/cấu hình, metadata, placeholder, danh mục 150 dịch vụ, giá, tìm kiếm/phân trang, 320–1440px, điều hướng đặt khám qua đăng nhập, ID mock cũ và ID sai/404. Chưa kiểm thử tích hợp API công khai thật; dữ liệu trang vẫn là mock/snapshot.
