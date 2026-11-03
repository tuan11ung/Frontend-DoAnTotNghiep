# Đăng nhập trước khi đặt khám

- `BookingAuthGate` tại `/booking` kiểm tra trạng thái đăng nhập trước khi hiển thị hoặc khởi tạo form đặt khám. Áp dụng cho mọi liên kết/nút từ trang chủ, menu, tìm kiếm, chi tiết bác sĩ/bệnh viện, bài viết và lịch khám, kể cả mở đường dẫn trực tiếp.
- Khách được chuyển đến `/patient/login?next=<đường dẫn đặt khám>`. Toàn bộ query của đường dẫn được giữ lại, gồm bệnh viện, bác sĩ, chuyên khoa và lựa chọn lịch do nơi gọi truyền vào.
- Liên kết đăng nhập ↔ đăng ký luôn giữ `next`. Đăng nhập thành công bằng tài khoản `PATIENT` sẽ quay về đường dẫn này. Điều hướng quản trị theo vai trò vẫn được ưu tiên.
- Nếu đăng ký từ luồng đặt khám: xác thực OTP thành công → gọi API đăng nhập với thông tin vừa đăng ký → lưu phiên trong sessionStorage → tiếp tục đặt khám. Nếu đăng nhập tự động thất bại, hiển thị tài khoản đã kích hoạt và nút đăng nhập tiếp tục; không bắt xác thực lại OTP. Mật khẩu chỉ được giữ trong state trong khi đăng ký và được xóa khi hoàn tất.
- Chỉ chấp nhận `next` có pathname chính xác `/booking`; bỏ qua URL bên ngoài, URL giao thức khác và các đường dẫn khác. Không lưu mật khẩu hay thông tin đăng nhập vào query.
- Luồng đăng nhập thông thường không có `next` vẫn về trang chủ. Đăng ký thông thường vẫn hiển thị màn kích hoạt thành công; nút đặt khám đưa qua đăng nhập.

## Mô phỏng giao diện hiện có

Trong `pnpm dev`, tại trang chủ, chọn **Khách** trong thanh mô phỏng rồi bấm nút đặt khám: trang đăng nhập xuất hiện kèm thông báo giữ lựa chọn. Chọn **Đã đăng nhập** để vào form đặt khám bằng chế độ mô phỏng, không cần backend. Phiên đăng nhập thật thành công tự tắt mô phỏng. Việc đăng nhập/đăng ký thật vẫn dùng các API hiện có.

Đây là điều hướng phía trình duyệt phù hợp với phiên đăng nhập hiện đang lưu trong Web Storage. Backend phải kiểm tra phiên/quyền khi nhận yêu cầu đặt khám thật; trạng thái mô phỏng chỉ phục vụ UI.
