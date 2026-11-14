# Xác thực bằng backend

Giao diện khách/bệnh nhân chỉ lấy trạng thái từ phiên đăng nhập ở
`medconnect.auth`, được tạo bởi phản hồi thành công của API đăng nhập.
Đã bỏ thanh chuyển Khách/Đã đăng nhập và cơ chế ghi đè bằng
`medconnect.auth-preview`. Key mô phỏng còn lưu trên trình duyệt cũ không còn
được đọc và không thể bật tài khoản bệnh nhân.

Lịch khám, kết quả, hồ sơ cá nhân/gia đình, quyền bệnh sử, đổi mật khẩu,
thông báo và hóa đơn dùng các API đã tích hợp. Lỗi API hiển thị lỗi tải dữ liệu;
không thay thế bằng hồ sơ hoặc giao dịch mẫu trong trình duyệt.
Thanh toán tại quầy và xác nhận giao dịch theo backend được giữ nguyên;
đã bỏ đường mở xác nhận thanh toán giả lập từ cổng bệnh nhân.

Các tài liệu mô phỏng viết trước đây mô tả phiên bản lịch sử.
Fixture độc lập phục vụ kiểm thử hoặc màn nhân viên không tạo phiên đăng nhập
và không được các trang bệnh nhân nạp qua chế độ xem thử.

Luồng kiểm tra: mở trang chủ khi chưa đăng nhập; mở đặt khám để được chuyển
tới đăng nhập; đăng nhập rồi tiếp tục lịch đang đặt; tải lại trang; đăng xuất;
kiểm tra các trang riêng tư yêu cầu đăng nhập lại. Thử với key mô phỏng cũ
ở cả giá trị `guest` và `patient` để xác nhận chúng không còn tác dụng.
