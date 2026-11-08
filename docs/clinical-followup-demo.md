# Hoàn thiện giao diện bác sĩ và theo dõi khám bệnh

## Phạm vi và cách chạy

Chạy `pnpm dev`. Toàn bộ phần mới dùng mock trong trình duyệt, không gọi API,
không gửi thông báo thật và không truy cập dữ liệu VNeID. Preview production
cần `NEXT_PUBLIC_ENABLE_DOCTOR_DEMO=true` khi build. Phân quyền ở đây chỉ mô phỏng
luồng UI; backend phải kiểm tra danh tính, cơ sở, khoa, ca trực và quyền hồ sơ.

### Đánh dấu đáng chú ý

1. Mở `/doctor/queue`, gọi bệnh nhân và chọn **Đã vào phòng**.
2. Trong màn Khám bệnh, chọn **Đánh dấu đáng chú ý**.
3. Chọn lý do, nhập ghi chú từ 20 đến 2.000 ký tự (bỏ khoảng trắng đầu/cuối).
   Tùy chọn thông báo trưởng khoa mặc định bật; lưu chỉ tạo yêu cầu thông báo
   mô phỏng cùng ghi chú và audit trong một lần ghi.
4. Mở lại nút **Đã đánh dấu đáng chú ý** để xem nội dung chỉ đọc.

Chỉ ca do chính bác sĩ điều trị tại cơ sở mình mới có nút. Phiên lịch sử
`history-12-1` và `history-12-5` là các ca cùng bác sĩ/cơ sở; phiên thứ hai thuộc
cơ sở khác, phiên thứ ba thuộc bác sĩ khác để thử nhánh bị chặn. Nút trong D6
không mở rộng quyền đọc hồ sơ D6. Sau hoàn tất D5e vẫn có thể đánh dấu qua màn
xác nhận hoàn tất; ghi chú nằm riêng, không mở lại bệnh án hay grant đã đóng.

Store `medconnect.doctor-queue-demo.v2` giữ ledger tùy chọn `notable`, tương thích
snapshot cũ. Chống nhấp/lưu lại trùng bằng request ID; Web Locks dùng chung với
luồng khám. Lỗi ghi storage không lưu một phần ghi chú/thông báo. Audit popup
được ghi trước khi trả nội dung; chuyển tài khoản/vai trò không giữ popup cũ.

### Tra cứu hồ sơ khẩn cấp sau R8

1. Mở `/reception?tab=patients`. Chọn **Nguyễn Văn An** hoặc **Trần Thị Mai**.
2. Trong khung **R8 · Hồ sơ cấp cứu**, chọn **Kích hoạt R8**.
3. Mở `/doctor/emergency?demo=1` từ điều hướng bác sĩ hoặc một tab khác.
4. Chuyển vai trò mô phỏng từ bác sĩ Nội tổng quát sang **Bác sĩ khoa cấp cứu**.
   Chọn đúng bệnh nhân được R8 kích hoạt tại cơ sở An Khang.
5. Tìm bệnh nhân; tìm nội dung hồ sơ theo cơ sở, mã bệnh/chẩn đoán và lọc chuyên
   khoa. Mở từng phiên để xem tổng quan, lâm sàng, sinh hiệu, chẩn đoán, chỉ định,
   phiếu kết quả, đơn thuốc, lời dặn và hẹn tái khám của dữ liệu mẫu.
6. Đóng quyền R8 tại lễ tân. Tab bác sĩ gỡ hồ sơ/phiếu đang mở ngay khi nhận sự
   kiện storage. Mở lại tạo grant mới và tải/audit lại, không dùng dữ liệu cũ.

Hai bệnh nhân có hồ sơ riêng; không ghép hồ sơ P12 của người khác vào bệnh nhân
cấp cứu. Bác sĩ sai khoa, sai cơ sở, bệnh nhân chưa kích hoạt hoặc R8 đã đóng
không được service trả dữ liệu. Mỗi lần mở hồ sơ/phiên/phiếu có audit, lỗi lưu
audit không trả dữ liệu mới. R8 nằm ở store độc lập
`medconnect.emergency-r8-demo.v1`; không thay đổi grant điều trị D5/D6.
Khách được phép thử vai trò trong chế độ demo; session PATIENT bị chặn.

### Kết quả khám bệnh phía bệnh nhân

`/patient/results` bỏ tên, CCCD, ngày/năm sinh, giới tính, diện điều trị và mã ca
khám trong thẻ, phần chi tiết và phiếu kết quả. Chọn thành viên bằng quan hệ
(Bản thân/Mẹ/Con); nhóm thông tin gần nhau theo ngày khám dạng dòng chữ, cơ sở,
chuyên khoa và bác sĩ; không hiển thị địa điểm phòng trong thẻ patient. Giữ tìm cơ sở/chuyên khoa/bác sĩ, lọc trạng thái, chia sẻ và
hỗ trợ. Mã phiếu kết quả vẫn hiển thị để phân biệt các phiếu, khác mã ca khám.

Component chi tiết/phiếu dùng chung vẫn giữ thông tin người bệnh đã masking
trong `mode="doctor"`, navigation theo scope và chỉ đọc. Bốn tab patient và ba
tab doctor tiếp tục dùng cùng component; chế độ không lấy từ tham số URL.

### Hàng chờ trước check-in

`/patient/appointments` hiển thị một ô nhỏ cạnh thông tin cơ sở, chỉ chứa số người
đang chờ cho lịch **Đã đặt lịch**. Bỏ khung thông tin lớn, số người đang khám,
thời gian ước tính, thời điểm cập nhật và nút mô phỏng trên thẻ. Phạm vi room key gồm
cơ sở, khoa, phòng và ngày khám; không yêu cầu có ticket của bệnh nhân mới xem
được độ đông phòng. Các màn dùng cùng store hàng chờ hiện có, cập nhật qua
storage/custom event giữa các tab cùng trình duyệt.

Trong demo, nếu phòng chưa có dữ liệu thì tạo bốn ticket ẩn danh: một đang khám,
một đã gọi và hai đang chờ. Không tạo ticket cho lịch hẹn, không check-in tự động.
Check-in thật trong luồng demo lễ tân tiếp tục dùng phòng đó và chỉ cấp một ticket.
Lỗi storage hiển thị lỗi, không diễn giải thành 0 người. Ô số lượng vẫn nhận
cập nhật từ store dùng chung; chưa có WebSocket/SSE hoặc đồng bộ giữa các thiết bị.

Thẻ lịch sắp tới ghi **Chưa cấp số thứ tự** trước khi lễ tân check-in. Sau check-in,
lịch đang diễn ra hiển thị số được cấp trong phần hàng chờ. Modal **Xem chi tiết**
cũng hiển thị số thứ tự của đúng lịch hẹn và cập nhật khi store thay đổi. Không lấy
số từ mã lịch hẹn hoặc ticket của người khác; lịch đã hủy không hiển thị số.

## Kiểm tra và tích hợp

- `node scripts/check-clinical-demo.mjs`: kiểm tra quyền, ownership, R8, audit,
  tính nguyên tử khi storage lỗi, lưu đồng thời, Unicode và preview không check-in.
- `pnpm exec tsc --noEmit`, ESLint theo các module thay đổi và `pnpm build`.
- Kiểm tra trình duyệt: gọi lại/tiếp nhận; popup đánh dấu; R8 hai tab; bộ lọc;
  phiếu P12; QR lịch hẹn; cập nhật số người chờ; viewport 320–1440 px.

Nhánh triển khai giữ nguyên các commit D5a–D5e và D6, tích hợp `origin/main`
`f92a45b` có module kỹ thuật viên. Hai xung đột do main chuyển queue sang
`clinical-queue` được xử lý bằng cách giữ hook bác sĩ riêng với store/grant
hiện có, dùng lại component/type queue chung. Luồng kỹ thuật viên vẫn dùng
`usePatientQueue` của main, không bị chuyển sang actor/store bác sĩ.

Không cherry-pick riêng commit cuối: cần merge cả nhánh để mang đủ các commit
khám bác sĩ và phần mới. Luôn fetch main và kiểm tra merge lại nếu main thay đổi.
