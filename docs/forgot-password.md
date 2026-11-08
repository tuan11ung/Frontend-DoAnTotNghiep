# Quên mật khẩu

Route: `/patient/forgot-password`. Mở từ liên kết **Quên mật khẩu?** ở trang đăng
nhập; dùng cùng bố cục, màu sắc và điều hướng với cụm xác thực bệnh nhân.

1. **Nhập email:** kiểm tra email hợp lệ và tiếp tục.
2. **Xác thực OTP:** chỉ nhập mã OTP sáu chữ số, rồi chọn Xác nhận OTP.
3. **Đặt lại mật khẩu:** chỉ hiển thị mật khẩu mới và nhập lại mật khẩu, sau khi
   OTP hợp lệ. Mật khẩu từ 8 đến 255 ký tự, có chữ và số; xác nhận phải khớp.

Không hiển thị thanh tiến độ. Tiêu đề/nội dung thay đổi theo màn đang mở. Có thể
quay lại nhập OTP; đổi email, gửi lại OTP hoặc quay lại đều xóa xác thực cũ và các
ô mật khẩu. Nếu phiên OTP hết hạn khi đang nhập mật khẩu, thao tác hoàn tất đưa
về xác thực OTP, không báo thành công. Mã OTP được xóa khỏi form khi xác thực xong.

Có hiện/ẩn riêng từng ô mật khẩu, đổi email, gửi lại OTP sau 30 giây, thông báo
OTP sai/hết hạn và màn xác nhận hoàn tất. Khi đổi email hoặc hoàn tất, xóa OTP
và mật khẩu khỏi form. Refresh bắt đầu lại từ bước email.

## Chạy thử không cần backend

- Chạy `pnpm dev`, mở trang đăng nhập và chọn **Quên mật khẩu?**.
- Nhập một email mẫu, ví dụ `person@example.com`.
- Dùng OTP **123456** trong 5 phút sau khi chuyển sang bước hai hoặc gửi lại mã.
- Chọn **Xác nhận OTP**, rồi nhập mật khẩu thử, ví dụ `NewDemo123`, và nhập lại.
- Hoàn tất để xem xác nhận; chọn **Quay lại đăng nhập**.

Đây là UI mô phỏng: không gửi email, không gọi API, không đổi mật khẩu tài khoản
thật, không đăng nhập tự động và không lưu email/OTP/mật khẩu vào localStorage
hoặc sessionStorage. Sau này cần nối các thao tác yêu cầu OTP, gửi lại và xác
nhận đặt lại mật khẩu với dịch vụ tài khoản.

Nếu người dùng đến từ luồng đặt khám, query `next` hợp lệ được giữ qua trang
quên mật khẩu và liên kết quay lại đăng nhập. Chỉ chấp nhận URL nội bộ `/booking`
theo helper hiện có; không nới điều kiện điều hướng sang URL tùy ý.

Kiểm tra trình duyệt đã bao gồm email sai, OTP sai/hết hạn, mật khẩu yếu/không
khớp, hiện/ẩn, cooldown gửi lại, đổi email, hoàn tất/xóa giá trị, không gọi API,
giữ tiếp tục đặt khám và viewport 320–1440px.
