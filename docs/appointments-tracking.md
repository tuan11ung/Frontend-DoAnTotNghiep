# Lịch hẹn, QR và theo dõi hàng chờ

## Giao diện bệnh nhân

`/patient/appointments` có bốn tab:

- **Lịch sắp tới:** `BOOKED`.
- **Đang diễn ra:** `CHECKED_IN` hoặc `IN_PROGRESS`.
- **Lịch sử khám:** `COMPLETED` hoặc `NO_SHOW`.
- **Lịch đã hủy:** `CANCELLED`.

Mỗi thẻ có **Xem chi tiết**. Modal hiển thị mã lịch, người khám, địa chỉ cơ sở, khoa/phòng/tòa/tầng, thời gian, bác sĩ, giá và chính sách hủy được gắn với lịch. Nếu thiếu thông tin tòa/tầng hoặc chính sách thì hiển thị chưa cập nhật, không suy diễn từ giá khám hoặc số phòng.

QR được tạo trực tiếp trong trình duyệt bằng [node-qrcode](https://github.com/soldair/node-qrcode#browser), có vùng trắng xung quanh và tải dưới dạng PNG. Nội dung là `MEDCONNECT:APPOINTMENT:<id>:<code>`, không chứa CCCD, số điện thoại hoặc tên bệnh nhân. Lễ tân tra cứu bằng mã lịch, nội dung QR mới hoặc `qrCodeData` cũ. Lịch đã hủy/kết thúc không hiển thị QR check-in. Đây là mã demo; backend thật cần phát hành và xác thực token check-in có thời hạn, không dùng mã đoán được thay quyền truy cập.

Các lịch đang diễn ra có số thứ tự và nút **Xem phòng & hàng chờ**. Modal hiển thị khoa, tòa, tầng, số phòng, bác sĩ, số của mình, số người phía trước, thời gian ước tính, danh sách đang khám/sắp đến lượt và nhãn ưu tiên. Tên người khác luôn được viết tắt. Lượt của mình mang nhãn **Bạn**.

## Thử check-in và cập nhật trực tiếp

1. Mở `/patient/appointments` và `/reception?tab=checkin` bằng hai tab cùng origin (cùng `localhost` và cổng).
2. Ở cổng bệnh nhân, mở chi tiết lịch `MED-2026-F415` và thử tải QR. Nếu lịch mẫu này đã bị hủy trong dữ liệu của bạn, dùng một lịch mới còn `BOOKED`; không tự khôi phục/ghi đè lịch đã hủy.
3. Ở lễ tân, dùng khu vực **Lịch hẹn từ cổng bệnh nhân**, nhập mã/QR hoặc chọn lịch. Đổi **Ngày check-in mô phỏng** thành đúng ngày trên lịch (`05/11/2026` đối với F415). Bộ lịch AP-1001 cũ vẫn sử dụng ngày làm việc mẫu riêng.
4. Đối chiếu lịch, đánh dấu xác nhận giấy tờ, chọn ưu tiên nếu phù hợp rồi **Check-in lịch bệnh nhân**. Lịch ở tab bệnh nhân chuyển sang Đang diễn ra mà không cần tải lại. Check-in sai ngày, lịch đã hủy hoặc trùng sẽ bị chặn.
5. Mở hàng chờ phía bệnh nhân. Ở lễ tân, dùng **Mô phỏng: chuyển lượt tiếp theo** để thay đổi hàng chờ. Số người phía trước và trạng thái cập nhật trực tiếp; khi lượt của người bệnh hoàn tất thì lịch chuyển sang Lịch sử khám.

Mỗi phòng mới có ba lượt minh họa chỉ gồm tên viết tắt để kiểm tra danh sách đang khám, đã gọi và đang chờ. Số thứ tự được cấp tăng dần theo phòng/ngày. Lượt ưu tiên được chèn theo điều phối trước các lượt chờ thường, không đổi lượt đang khám/đã gọi. Vì vậy số người phía trước được tính từ thứ tự trong danh sách, không lấy hiệu hai số thứ tự.

Giờ dự kiến chỉ là ước tính theo số người phía trước và thời gian trung bình 10 phút/lượt trong demo. Không phải cam kết giờ khám của cơ sở. Không tự động chuyển lượt theo timer trên giao diện bệnh nhân; chỉ cập nhật khi nguồn dữ liệu điều phối thay đổi.

## Nguồn dữ liệu và an toàn trạng thái

- Lịch gốc vẫn nằm ở `medconnect.patient_appointments`.
- Trạng thái tiếp nhận/hàng chờ liên kết được lưu riêng ở `medconnect.appointment-queue-demo.v1`. Một lần ghi cập nhật cả cấp số và trạng thái tiếp nhận, không cần ghi hai store cùng lúc.
- `effectiveAppointment` chiếu trạng thái lượt chờ thành `CHECKED_IN`, lượt đang khám thành `IN_PROGRESS`, lượt xong thành `COMPLETED`. Trạng thái đã hủy/kết thúc của lịch gốc được ưu tiên, không bị ghi đè bởi hàng chờ.
- `storage` event đồng bộ giữa các tab; custom event đồng bộ trong cùng tab; khi focus trở lại sẽ đọc snapshot mới. Đây là cập nhật trực tiếp trong bản demo cùng trình duyệt, chưa phải WebSocket/SSE từ backend hoặc đồng bộ nhiều thiết bị.
- Dữ liệu hàng chờ chỉ chứa tên viết tắt và mã tham chiếu mờ, không gồm CCCD/điện thoại/triệu chứng của người khác. Phòng được phân biệt bằng cơ sở, khoa, phòng và ngày; phải khớp mã lịch của người đang xem.
- Các mutation check-in/điều phối/hủy dùng chung Web Locks khi trình duyệt hỗ trợ để tránh cấp số trùng hoặc hủy đồng thời với check-in. Khi không có Web Locks, thao tác đồng bộ vẫn kiểm tra trùng trước khi ghi; backend thật phải bảo đảm tính nguyên tử ở máy chủ.
- Dữ liệu không hợp lệ được báo lỗi; không lấy phòng hoặc người bệnh khác để thay thế. Không ghi đè dữ liệu lỗi bằng bộ mẫu.
- Chính sách hủy của hai lịch mẫu có nhãn minh họa, dùng hạn 2 giờ để thử chặn theo thời gian. Không coi đây là chính sách thật của bệnh viện. Lịch chưa check-in mới được hủy; khi có cutoff thì kiểm tra cả phía thao tác lưu. Hủy lịch không tự ghi nhận đã hoàn tiền.
- Bộ `medconnect.reception-demo.v1` và chức năng khôi phục của lễ tân vẫn độc lập; khôi phục bộ AP-1001 cũ không xóa lịch bệnh nhân hoặc hàng chờ liên kết mới.

Khi nối backend, thay nguồn snapshot bằng proxy cùng origin và luồng SSE/WebSocket có reconnect, heartbeat, trạng thái mất kết nối và last-sync thực tế. Máy chủ xác thực quyền xem lịch/hàng chờ, phát hành DTO tên viết tắt, kiểm tra chính sách hủy và quyết định thứ tự/giờ dự kiến. Bộ điều khiển chuyển lượt mô phỏng phải được thay bằng nguồn điều phối được phân quyền.

## Kiểm tra

- 9 nhóm kiểm tra logic: đọc/migrate dữ liệu, ngày/trạng thái hợp lệ, check-in đồng thời không trùng, chặn hủy sau check-in, điều phối ưu tiên, phạm vi phòng/ngày, trạng thái hoàn tất, dữ liệu lỗi, cutoff hủy và quyền riêng tư payload.
- 11 nhóm kiểm tra trình duyệt: modal chi tiết, giải mã QR bằng bộ đọc độc lập, tải PNG thực, check-in từ lễ tân qua QR, cập nhật giữa hai tab không reload, giữ trạng thái khi mở lại trang, thứ tự/ưu tiên và tên viết tắt, tự chuyển lịch sử, ẩn QR lịch đã hủy/kết thúc, dữ liệu lỗi, hủy không giả hoàn tiền và bố cục 320–1440px.
- ESLint các file thay đổi, TypeScript và build production đạt. Lint toàn dự án còn 7 lỗi và 30 cảnh báo cũ ở các module khác; không có lỗi/cảnh báo trong `patient-appointments` và `appointment-tracking`.
