# Chi tiết phiên khám D6/P12

## Component và dữ liệu

- Bản demo, bệnh nhân dùng API và bác sĩ dùng API đều hiển thị bằng EncounterDetail. Bác sĩ truyền mode="doctor", không có tab viện phí hay thao tác chỉnh sửa.
- Tab Tổng quan có cơ sở, bác sĩ, ngày vào/ra, lý do khám, khám lâm sàng, chẩn đoán ICD, lời dặn và tái khám. Tab Dịch vụ chứa các chỉ định của phiên; tab Đơn thuốc chứa đơn đã lưu.
- resultEncounter, resultRecord, resultPrescription chuyển dữ liệu API về model chung. resultService chuyển CLS sang cùng trình xem phiếu và ảnh. Không biến ID chẩn đoán trong DB thành mã ICD khi API thiếu mã.
- Adapter bác sĩ kiểm tra bệnh nhân/phiên của từng chỉ định, bỏ chỉ định đã hủy, chỉ mở phiếu của dịch vụ hoàn tất. Đơn thuốc 404 hiển thị chưa có; 403 không được biến thành danh sách trống.
- Màn bác sĩ kiểm tra ca đang diễn ra và quyền bệnh sử khi mở, lấy focus, trở lại tab, pageshow và mỗi 15 giây. Mất quyền hoặc không xác nhận được quyền sẽ xóa cả bản chi tiết, phiếu và đơn thuốc đang hiển thị.
- Dị ứng ghim phía trên là dị ứng hiện tại của bệnh nhân từ API; không gán thành dị ứng đã ghi nhận tại phiên cũ.

## Giới hạn backend hiện tại

EncounterDetailResponse chưa trả specialtyName, roomName, lời dặn và lịch hẹn tái khám. Giao diện chung có chỗ hiển thị nhưng dùng thông báo chưa được cung cấp; không suy diễn chuyên khoa hiện tại thành chuyên khoa phiên cũ. Ngày vào dùng checkedInDate, ngày ra dùng checkedOutDate. Nếu chỉ có ngày, không tự hiển thị giờ 00:00.

Backend chưa có endpoint hỏi trợ lý AI. Nút Hỏi trợ lý AI về kết quả này mở hộp thoại chuẩn bị câu hỏi với chẩn đoán/kết luận của đúng phiên; có thể sao chép, không gửi dữ liệu hoặc hiển thị câu trả lời giả.

## Kiểm thử

1. Bác sĩ: hàng chờ → tiếp nhận → Hồ sơ & tiền sử → mở phiên khám cũ. Kiểm tra ba tab Tổng quan/Dịch vụ/Đơn thuốc và không có Viện phí.
2. Mở nhóm CLS, phiếu kết quả, ảnh phóng to nếu cơ sở đã cung cấp. URL service không thuộc phiên phải báo lỗi. Đổi tab và quay lại phải giữ đúng phiên đang xem.
3. Bệnh nhân: Kết quả khám → Xem kết quả. Cùng component, có thêm viện phí. Phiếu công bố sử dụng ServiceResultViewer ở chế độ patient.
4. Mở popup AI: kiểm tra đúng kết luận/chẩn đoán, thông báo chưa kết nối và nút sao chép; không có request tới AI.
5. Hoàn tất ca/thu hồi quyền trong tab khác rồi quay lại tab D6: mọi thông tin phiên cũ và popup phải biến mất khi kiểm tra quyền bị từ chối.
6. node scripts/check-shared-encounter.mjs kiểm tra chuyển đổi dữ liệu, định danh che số, phạm vi CLS, loại bỏ chỉ định hủy và phân biệt đơn thuốc 404/403.

Đã thử Chrome với API mô phỏng có CLS và đơn thuốc: hai chế độ dùng chung component, chuyển tab, mở phiếu, đóng quyền, popup câu hỏi và viewport 390px. Đã thử backend thật bằng lượt QA 3 đang điều trị và lượt QA 1 đã hoàn tất: tải được tổng quan, trạng thái chưa có đơn thuốc và chưa có CLS. Lượt QA 3 được giữ để kiểm thử tiếp.
