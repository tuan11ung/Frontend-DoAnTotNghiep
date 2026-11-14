# Cổng lễ tân

`/reception` dùng giao diện tab ngang cho tra cứu, đăng ký khám tại quầy, phân chuyên khoa, check-in và thanh toán. Chế độ backend yêu cầu vai trò `RECEPTIONIST`.

## Demo ngay trong giao diện hiện tại

Chạy `pnpm dev` rồi mở **http://localhost:3000/reception?demo=1**. Demo dùng chung component với backend; không còn giao diện sidebar riêng. Liên kết nghiệp vụ giữ tham số `demo=1`.

Demo mặc định chỉ mở trong development. Bản build thử nghiệm cần cấu hình `NEXT_PUBLIC_ENABLE_RECEPTION_DEMO=true` trước khi build. Không cần đăng nhập trong demo; không tạo hoặc sửa phiên đăng nhập.

Dữ liệu giả lưu tại `medconnect.reception-preview.v2` trong localStorage và giữ qua tải lại. Không gọi API, gửi email/SMS hoặc thu tiền thật. **Dùng backend** trở lại chế độ có xác thực. **Khôi phục dữ liệu demo** chỉ đặt lại bộ mẫu lễ tân sau khi xác nhận.

## Cách thử

1. Tra cứu `BN0001`, `BN0002`, `BN0003`, tên không dấu, CCCD hoặc điện thoại. Định danh hiển thị được che bớt.
2. Không tìm thấy: thêm bệnh nhân với CCCD 12 số, điện thoại 10 số bắt đầu bằng 0. Thử trùng CCCD/điện thoại để kiểm tra lỗi.
3. Đăng ký: chọn bệnh nhân, khung giờ và lý do, xác nhận để tạo lịch và check-in. Phòng Tim mạch mẫu hết chỗ để thử lỗi công suất. Phiếu có mã lượt khám, số thứ tự, khoa, phòng, bác sĩ và nút **Tiếp nhận bệnh nhân tiếp theo**.
4. **Chờ phân chuyên khoa**: mở `AP-1002`, chọn chuyên khoa/phòng và xác nhận. Sang Check-in để tiếp nhận lịch này.
5. **Check-in**: nhập `AP-1001` hoặc `DEMO:AP-1001`. Thử lại để kiểm tra chặn trùng. `AP-1003` đã hủy; `AP-1004` đã tiếp nhận; `AP-1005` khác ngày.
6. Bấm **Hoàn tất ca demo** trên bảng công cụ để giả lập bác sĩ khám xong và tạo hóa đơn. Đây là điều khiển thử nghiệm.
7. **Thanh toán**: mở `HD-4001` (420.000 đồng) hoặc hóa đơn vừa tạo. Nhập 500.000 đồng, kiểm tra tiền trả lại 80.000 đồng, đánh dấu đã đối chiếu rồi xác nhận thu tiền mặt. Tải lại để xem trạng thái và giao dịch; hóa đơn đã trả không được thu lại.

Bộ mẫu lấy ngày hiện tại khi khởi tạo. Nếu thử vào ngày khác, khôi phục bộ mẫu để cập nhật ngày làm việc.

Demo kiểm thử các nghiệp vụ hiện có trong giao diện chung; chưa gồm kích hoạt cấp cứu R8, chuyển khoản/VietQR thật hoặc biên lai điện tử.

## Kiểm tra

`node scripts/check-reception-preview.mjs` kiểm tra adapter không dùng mạng: tìm kiếm/che định danh, hồ sơ trùng, công suất, phân chuyên khoa, check-in, hoàn tất ca, thu tiền/chặn trùng, dữ liệu lỗi, reset và tách biệt dữ liệu đăng nhập/bệnh nhân.
