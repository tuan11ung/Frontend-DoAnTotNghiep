# Cổng lễ tân

Route `/reception` có sidebar và khung làm việc độc lập, không dùng menu hoặc footer của cổng bệnh nhân.

## Chức năng

- `/reception`: tra cứu theo tên có/không dấu, CCCD, số điện thoại hoặc mã bệnh nhân. Hiển thị thông tin định danh đã che bớt, đối chiếu hồ sơ rồi chuyển sang đăng ký khám. Có luồng tạo hồ sơ mới, kiểm tra trùng CCCD/số điện thoại và xác nhận trước khi tạo.
- `/reception?tab=registration`: chọn bệnh nhân, chuyên khoa, mức khám, bác sĩ, lý do khám và nhãn ưu tiên. Xem phí, xác nhận rồi tạo lượt và số thứ tự theo phòng/ngày; tải phiếu khám dạng văn bản. Chặn lượt đang tiếp nhận trùng chuyên khoa.
- `/reception?tab=checkin`: có thêm khu vực **Lịch hẹn từ cổng bệnh nhân** để nhận mã/QR và đồng bộ trạng thái Đang diễn ra cùng hàng chờ sang cổng bệnh nhân. Bộ AP-1001 cũ vẫn nhận `MEDCONNECT:AP-1001` / `MEDCONNECT-CHECKIN-AP-1001`. Hỗ trợ máy quét dạng bàn phím, chặn check-in trùng, lịch đã hủy hoặc khác ngày. Xem [luồng thử hai tab](appointments-tracking.md).
- `/reception?tab=checkout`: tìm lượt khám, xem bảng kê, giảm trừ/tạm ứng, mô phỏng thu tiền mặt (kiểm tra số tiền và tính tiền trả lại) hoặc chuyển khoản (nhập tham chiếu). Xác nhận trước khi ghi nhận, chặn thu trùng và chặn ca chưa hoàn tất. Tải biên lai văn bản, ghi rõ không có giá trị thanh toán.

## Dữ liệu và cách thử

Đây là bản giao diện mô phỏng, chưa có API lễ tân, phiên nhân viên hoặc phân quyền backend. Chỉ dùng thông tin giả. Bộ tiếp đón AP-1001 cũ lưu riêng trong `medconnect.reception-demo.v1`. Khu vực tiếp nhận từ cổng bệnh nhân đọc lịch ở `medconnect.patient_appointments` và ghi trạng thái tiếp nhận/hàng chờ ở `medconnect.appointment-queue-demo.v1`; không đọc/ghi token, hồ sơ hoặc thanh toán. Dữ liệu được giữ khi tải lại, cập nhật giữa các tab trình duyệt cùng origin.

Ngày làm việc mẫu cố định là **03/11/2026**. Giá tiền và giảm trừ đều là số mẫu, không mô phỏng quy tắc chi trả BHYT hoặc quyết toán thật.

- Tra cứu `BN0001` hoặc `Nguyễn Văn An`, xác nhận, nhập lý do và đăng ký khám.
- Check-in `AP-1001`: lịch đúng ngày. `AP-1003`: khác ngày. `AP-1004`: đã check-in. `AP-1005`: đã hủy.
- Check-out `LK-2026-0302`: tổng 690.000 ₫, giảm 50.000 ₫, tạm ứng 100.000 ₫, còn thu 540.000 ₫. Nhập 600.000 ₫ để kiểm tra trả lại 60.000 ₫.
- Với lượt vừa tạo, chọn lượt ở check-out và dùng nút **Mô phỏng: bác sĩ đã hoàn tất khám** để thử tiếp phần thu tiền. Đây chỉ là điều khiển demo, không phải quyền hoàn tất ca khám của lễ tân.
- **Khôi phục dữ liệu mẫu** yêu cầu xác nhận, chỉ thay dữ liệu của cổng lễ tân bằng bộ mẫu ban đầu.

Hai tệp `design/le-tan-dang-ky-kham-1.html` và `design/le-tan-dang-ky-kham-2.html` được cung cấp ở trạng thái trống (0 byte). Bản giao diện dựa vào luồng đăng ký trực tiếp, check-in và thanh toán trong `docs/chi-tiet-luong.md` cùng giao diện hiện có của dự án; không có thiết kế HTML để đối chiếu chi tiết.

## Tích hợp sau giao diện

Khi có backend, thay service demo bằng proxy cùng origin. Backend phải xác thực nhân viên, ràng buộc cơ sở/ngày/phòng, kiểm tra hồ sơ trùng, cấp số thứ tự và ghi nhận giao dịch nguyên tử. Thanh toán chuyển khoản thật cần xác minh từ cổng thanh toán; không dùng thao tác xác nhận thủ công của bản demo để coi tiền đã về. Phiếu văn bản hiện tại không thay thế QR hoặc hóa đơn điện tử thực tế.

## Kết quả kiểm tra

- TypeScript, ESLint riêng module và build production: đạt.
- Chrome: đã thử tra cứu không dấu, che định danh, xác nhận đăng ký, chặn lượt trùng và cấp số đúng theo phòng.
- Đã thử lịch sai mã, khác ngày, đã check-in, đã hủy; check-in hợp lệ chỉ tạo một lượt khám.
- Đã thử ca chưa hoàn tất, tiền mặt thiếu, tiền trả lại, giảm trừ/tạm ứng, chuyển khoản mô phỏng và tải biên lai.
- Đã thử tạo hồ sơ mới, hồ sơ trùng CCCD, quay lại sửa không mất thông tin, đăng ký từ hồ sơ mới và giữ dữ liệu sau khi tải lại.
- Bốn màn hình không tràn ngang ở 320, 390, 768, 1024 và 1440 px; đã kiểm tra sidebar điện thoại và hộp thoại đóng bằng Escape.
- Đã thử phục hồi dữ liệu lỗi và khôi phục mẫu; không ảnh hưởng dữ liệu cổng bệnh nhân, không phát sinh request API hoặc lỗi JavaScript.
