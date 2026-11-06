# Màn Khám bệnh: D5a–D5e

## Phạm vi và code nền

Đã lấy `origin/main` tại `15a0dbc` trước khi phát triển. Giữ hàng chờ, sidebar và popup tiếp nhận của nhóm trên main. Gỡ các giao diện do lượt trước thêm ngoài khung D5a–D5e: đăng nhập bác sĩ riêng, hàng chờ/popup trùng, popup hồ sơ, bảng quyền và điều khiển mô phỏng ngoài màn khám. Không gỡ các giao diện bệnh nhân/lễ tân hoặc hàng chờ của nhóm.

Màn Khám bệnh chỉ có năm mục:

| Mục | Trạng thái |
| --- | --- |
| D5a Hồ sơ & lịch sử | Thông tin đã che, dị ứng, bệnh mạn tính, lịch sử và bộ lọc |
| D5b Khám lâm sàng | Nhập triệu chứng, ghi nhận khám, sinh hiệu và lưu bản nháp |
| D5c Chỉ định CLS | Danh mục cây theo cơ sở, lý do, cờ an toàn và xác nhận; [chi tiết](doctor-cls-orders.md) |
| D5d Kết quả CLS | Báo cáo, ảnh phóng to, hủy chưa thực hiện và yêu cầu chụp lại; [chi tiết](doctor-cls-results.md) |
| D5e Kết luận & kê đơn | ICD, kê đơn có cảnh báo dị ứng, lời dặn, tái khám và hoàn tất/khóa; [chi tiết](doctor-conclusion-prescription.md) |

## Cách thử

1. Chạy `pnpm dev`, mở `/doctor/queue` khi chưa đăng nhập tài khoản khác hoặc đang dùng vai trò DOCTOR.
2. Chọn **Gọi bệnh nhân tiếp theo → Đã vào phòng**. Bước này mở quyền mock và chuyển tới `/doctor/encounters/bn-006?demo=1&assignment=room-101-morning`.
3. Chọn tab **Khám lâm sàng**, nhập triệu chứng và các chỉ số đã đo, chọn **Lưu bản nháp**.
4. Đổi qua Hồ sơ & lịch sử rồi quay lại, hoặc tải lại trang để kiểm tra nội dung.
5. Mở hai tab cùng lượt để thử xung đột bản nháp. Bản cũ không được ghi đè bản mới; nút **Nạp lại bản đã lưu (bỏ thay đổi)** tải dữ liệu mới nhất.
6. Về hàng chờ, chọn **Hoàn tất lượt khám** để mở tab Kết luận & kê đơn; nhập dữ liệu hợp lệ rồi xác nhận hoàn tất. Hồ sơ/biểu mẫu ở mọi tab sẽ ẩn; đọc và lưu tiếp bị từ chối. Chỉ còn thông báo chung đã hoàn tất và khóa chỉnh sửa.

Ở production, mock chỉ mở khi `NEXT_PUBLIC_ENABLE_DOCTOR_DEMO=true`. Không tích hợp API hoặc dữ liệu bệnh án thật.

## Hồ sơ và cảnh báo

- Danh tính, mã CCCD đã che và ca trực lấy từ cùng fixture `queue-mock-data.ts` trên main; không dùng bản bệnh nhân khác có tên gần giống.
- Chỉ có giá trị CCCD/điện thoại/BHYT đã che trong DTO, không giữ số đầy đủ để che bằng CSS.
- Cảnh báo dị ứng màu đỏ luôn ở đầu vùng khám và sticky khi cuộn, kể cả khi chuyển tab. Thiếu khai báo không được hiển thị thành không dị ứng; lỗi tải/ghi log vẫn có cảnh báo đỏ.
- Lịch sử chỉ của người bệnh đang khám, có bộ lọc cơ sở, chuyên khoa, khoảng ngày bao gồm hai đầu và tiền tố mã ICD. Khoảng ngày sai không thực hiện lượt xem mới. Không có kết quả thì hiển thị danh sách rỗng.
- Xem tóm tắt ngay trong danh sách; **Xem chi tiết** mở [D6 dùng chung khung P12](doctor-past-encounter.md), quay lại giữ bộ lọc đã áp dụng. D6 chỉ đọc và áp dụng quyền hồ sơ còn mở, kể cả khi lượt hiện tại đang chờ CLS; các thao tác Khám bệnh D5 vẫn yêu cầu `IN_PROGRESS`.

## Phiếu khám lâm sàng

- Triệu chứng bắt buộc, tối đa 4.000 ký tự; ghi nhận qua thăm khám tùy chọn, tối đa 4.000 ký tự.
- Nhiệt độ, mạch, huyết áp tâm thu/tâm trương, nhịp thở, SpO₂, cân nặng, chiều cao. Mỗi ô có đơn vị, để trống khi chưa đo. Không tự điền số giả vào phiếu trống.
- Kiểm tra kiểu số, phạm vi nhập, số nguyên ở chỉ số tương ứng và tương quan hai số huyết áp. Đây là kiểm tra dữ liệu nhập, không đánh giá/chẩn đoán lâm sàng.
- BMI chỉ tính từ chiều cao và cân nặng hợp lệ, không phân loại hoặc đưa khuyến cáo.
- Lưu thủ công; hiển thị thay đổi chưa lưu, thời điểm lưu, phiên bản và thông báo thành công/lỗi. Lỗi lưu giữ nguyên nội dung đã nhập. Chuyển tab trong màn khám giữ dữ liệu đang nhập; đóng/tải lại khi chưa lưu có cảnh báo trình duyệt.
- Bản nháp gắn đúng encounter và bác sĩ. Kiểm tra revision dưới cùng Web Lock với thao tác lưu; không ghi đè im lặng khi hai tab chỉnh sửa.

## Quyền, nhật ký và lưu trữ mock

Chỉ đọc/ghi khi đồng thời có vai trò bác sĩ trong mô phỏng, đúng bác sĩ/cơ sở/ca được phân công, đúng bệnh nhân/lượt, grant chưa bị rút và trạng thái `IN_PROGRESS`. Mở URL không tạo quyền. Vai trò khác bị chặn ở màn khám. Lưu luôn kiểm tra lại trạng thái dưới Web Lock, kể cả khi biểu mẫu đã mở từ trước.

Snapshot `medconnect.doctor-queue-demo.v2` dùng danh tính của main, tách dữ liệu demo cũ. `clinicalNotes` lưu bản nháp theo encounter, gồm revision, người lưu, thời điểm và grantId. Không trộn bản nháp giữa người bệnh. Kết thúc khám đóng grant trong cùng thao tác cập nhật trạng thái; `storage` và sự kiện trong tab đồng bộ việc ẩn dữ liệu.

Mỗi lượt đọc được ghi log trước khi trả dữ liệu: `PERSONAL_PROFILE`, `HISTORY_LIST`, `PAST_ENCOUNTER`, `CLINICAL_EXAM`, `CLS_ORDERS`, `CLS_RESULTS`, `CLS_RESULT_DETAIL`, `CLS_RESULT_IMAGE`. Resource và quy tắc targetId dùng chung trong doctor-queue.types. Log chỉ có phạm vi, resource, mã lượt xem và thời điểm, không ghi nội dung triệu chứng/sinh hiệu/lý do chỉ định/báo cáo. `viewId` tránh ghi trùng khi React StrictMode chạy lại effect. Ghi log thất bại thì không trả dữ liệu mới; lỗi ghi bản nháp/phiếu không báo lưu thành công.

Toàn bộ quyền, log và dữ liệu dùng localStorage chỉ để mô phỏng giao diện. Backend thực tế phải xác thực và thực thi quyền, đồng thời lưu audit phía server. Luồng hiện tại không gọi API và không đổi dữ liệu hệ thống thật.

## Kiểm tra

- ESLint phần doctor-consultation/doctor-queue/routes và TypeScript đạt; production build đạt sau khi tạo lại cache build.
- 10 nhóm logic: đồng nhất fixture main, quyền theo lượt, audit, lưu sinh hiệu, validation, xung đột phiên bản, lỗi storage, thu hồi và tách dữ liệu từng người bệnh.
- 12 nhóm browser: luồng hàng chờ mới, dữ liệu đã che, lưu/tải lại/giữ nội dung khi chuyển tab, validation, xung đột hai tab, lỗi lưu/thử lại, thu hồi đồng bộ, đổi bệnh nhân/vai trò; viewport 320–1920px, cảnh báo đỏ sticky, 0 request API và 0 runtime exception.
- Lint toàn repo còn 7 lỗi và 30 cảnh báo có sẵn ngoài phạm vi phần bác sĩ này.
