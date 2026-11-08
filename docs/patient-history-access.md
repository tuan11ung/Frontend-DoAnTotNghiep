# Quyền truy cập bệnh sử trong Hồ sơ cá nhân

Mở `/patient/profile#history-access` từ menu **Hồ sơ cá nhân**, hoặc chọn mục
**Quyền truy cập bệnh sử** ở thanh điều hướng trong trang.

## Nội dung

- **Đang mở:** bác sĩ, cơ sở y tế, thời điểm mở quyền và nút Thu hồi quyền.
- **Đã đóng:** cùng thông tin trên, thêm thời điểm đóng và lý do (bệnh nhân thu
  hồi, kết thúc lượt khám hoặc hết hạn).
- **Nhật ký xem:** bác sĩ/cơ sở đã xem, thời điểm xem, mã phiên khám, ngày khám,
  chuyên khoa và cơ sở của phiên được xem. Giữ nhật ký sau khi quyền đã đóng.
- Tìm theo bác sĩ/cơ sở; ở nhật ký có thể tìm thêm mã phiên khám hoặc chuyên khoa.
- Ngày hiển thị DD/MM/YYYY; thời điểm hiển thị DD/MM/YYYY HH:mm, giờ Việt Nam.

Thu hồi có cửa sổ xác nhận **Giữ quyền / Xác nhận thu hồi**. Khi lưu thành công,
quyền chuyển sang Đã đóng; không sửa hoặc xóa các lượt xem trước đó. Khi quyền
được đóng ở tab khác, cửa sổ đang mở thông báo trạng thái mới và không cho thu
hồi lần nữa. Lỗi ghi bộ nhớ giữ nguyên quyền; không báo thành công giả.

## Mô phỏng

Trên thanh xem thử của trang chủ chọn **Đã đăng nhập**, sau đó mở Hồ sơ cá nhân.
Hồ sơ mẫu `BN-DEMO-0001` có 2 quyền mở, 2 quyền đóng và 5 lượt xem để thử các mục.
Dữ liệu lưu tại `medconnect.patient-history-access-demo.v1`, đồng bộ giữa các tab
cùng trình duyệt qua storage/custom event. Tải lại vẫn giữ trạng thái thu hồi.

Module có ledger riêng gắn với patient ID của hồ sơ cá nhân mẫu. Không lấy quyền
hoặc bệnh án của bệnh nhân khác trong các bộ dữ liệu D5/D6/R8 để ghép vào hồ sơ
này. Các fixture đó có danh tính khác nhau. Màn mới chưa nối API quyền thực tế;
thu hồi mô phỏng không đổi quyền trên backend hoặc các store mô phỏng cũ.
Chế độ tài khoản thật hiển thị trạng thái chờ tích hợp thay vì hiển thị quyền mẫu.

`recordHistoryViewDemo` là cổng ghi lượt xem của mô hình này: chỉ ghi khi đúng
patient/grant/visit và quyền còn mở. `revokeHistoryAccessDemo` đóng quyền và ghi
sự kiện trong một lần lưu. Web Locks tuần tự hóa thao tác giữa các tab; fallback
không có Web Locks chỉ phục vụ preview. Muốn đồng bộ với các màn bác sĩ thật cần
API quản lý quyền và audit cùng một định danh bệnh nhân, bác sĩ và phiên khám.

Parser kiểm tra quyền sở hữu, tham chiếu grant/visit, trùng ID, thời điểm mở/đóng
và các lượt xem nằm trong thời gian có quyền. Dữ liệu lỗi không tự khôi phục các
quyền mặc định đang mở. Đổi vai trò/đăng xuất gỡ nội dung và đóng dialog; thao tác
đang chờ khóa bị hủy khi component không còn ở hồ sơ tương ứng.

## Kiểm tra

- `node scripts/check-history-access.mjs`: sáu nhóm kiểm tra scope, validation,
  ghi lỗi, tính nguyên tử, lưu đồng thời/idempotency, giữ lịch sử, thu hồi trước
  lượt đọc đang chờ và dữ liệu hỏng.
- Trình duyệt: đăng nhập preview, điều hướng, tìm kiếm, xác nhận/hủy, lỗi quota,
  lưu qua reload, hai tab thu hồi cùng quyền, nhật ký sau đóng, logout cleanup,
  trạng thái rỗng/lỗi và viewport 320–1440px.

Đã cài các dependency khai báo với `pnpm install --lockfile=false --ignore-scripts`
để đồng bộ môi trường kiểm tra; không sửa package.json hoặc pnpm-lock.yaml.
