# Chi tiết phiên khám cũ (D6) — dùng chung P12

## Đường dẫn và thao tác

Chạy development, mở `/doctor/queue` → gọi bệnh nhân → **Đã vào phòng → Hồ sơ & lịch sử → Xem chi tiết** tại một phiên cũ. Route:

`/doctor/encounters/<currentEncounterId>/history/<historyId>?demo=1&assignment=<assignmentId>`

Ví dụ sau khi tiếp nhận Nguyễn Thị Mai: `/doctor/encounters/bn-006/history/history-12-1?demo=1&assignment=room-101-morning`.

`currentEncounterId` là lượt đang mở quyền điều trị, không phải phiên cũ. `historyId` phải thuộc đúng người bệnh của lượt này. URL sai/mất assignment, phiên của người khác, service/ảnh không thuộc phiên không được fallback về dữ liệu khác.

## Bố cục theo nội dung tham khảo VNeID

- **Tổng quan:** người bệnh đã masking, cơ sở, khoa/chuyên khoa, bác sĩ, ngày vào/ra và lý do khám; triệu chứng, ghi nhận thăm khám, sinh hiệu; bệnh chính/kèm theo có ICD, kết luận; lời dặn/tái khám; dị ứng của phiên; timeline và đánh giá nếu có dữ liệu của cơ sở mình.
- **Dịch vụ:** dùng accordion, lọc nhóm/trạng thái như P12. Mở phiếu để xem mô tả, kết luận, bảng số liệu nếu được cung cấp và ảnh đính kèm. Ảnh có phóng to 100–300%, cuộn, chuyển ảnh, đóng bằng nút/Escape.
- **Đơn thuốc:** tên, hàm lượng, liều, cách dùng, số ngày/số lượng do nguồn dữ liệu cung cấp. Chỉ đọc, không tạo lại đơn mới.
- **Quay lại:** khi lượt đang khám, quay về Hồ sơ & lịch sử và giữ bộ lọc cơ sở/chuyên khoa/từ-đến ngày/ICD đã áp dụng. Khi quyền còn mở nhưng đang chờ CLS, đường quay lại dẫn về hàng chờ vì D5 không cho sửa ở trạng thái này.

Không có thêm/sửa/xóa bệnh án, kê đơn, hủy chỉ định, yêu cầu chụp lại, chia sẻ, hỗ trợ hoặc thanh toán trong chế độ bác sĩ D6. Query `tab=billing` không mở viện phí; chỉ trở về Tổng quan trong phạm vi doctor.

## Component dùng chung thực sự

- Doctor và `PatientResultsScreen` đều render **cùng `EncounterDetail`**, cùng `EncounterRecordSections`, `EncounterPrescription`, `EncounterOverview`, `ClinicalServiceList`.
- Doctor và patient dùng cùng **`ServiceResultViewer`** và **`EncounterImageDialog`**. Callback tải ảnh ở doctor đi qua guard/audit; không có một bản markup D6 riêng sao chép từ P12.
- `mode='doctor'` bắt buộc navigation riêng theo kiểu props; mặc định là patient. Mode không do tham số URL quyết định.
- P12 giữ bốn tab, chia sẻ/hỗ trợ và đường viện phí cũ. Theo yêu cầu giản lược giao diện, P12 bỏ thông tin cá nhân lặp lại và mã ca khám; mode doctor vẫn giữ thông tin đã masking. Các dữ liệu mới là optional để P12 đang thiếu dữ liệu vẫn hiện thông báo rõ ràng. Không thay đổi fixture P12 hoặc gọi API mới.

## Quyền và audit mock

D6 cần bác sĩ điều trị đúng cơ sở/assignment/current encounter, grant đã mở và chưa đóng. Khác các màn nhập D5, D6 không bắt buộc `IN_PROGRESS`: khi lượt chuyển chờ CLS hoặc quay lại hàng chờ, grant chưa bị rút thì vẫn xem được. Không mở thêm grant chỉ vì truy cập URL.

`readMockOpenRecord` chỉ chấp nhận ba resource D6 và dùng chung guard/khóa/audit với helper đọc hiện có. `readMockClinicalData` của D5 vẫn yêu cầu `IN_PROGRESS`; helper D6 không được dùng để bỏ qua quy tắc đọc kết luận hoặc thao tác hiện tại.

- `PAST_ENCOUNTER_DETAIL`: target phiên cũ, trả DTO người bệnh đã che và dữ liệu của đúng phiên.
- `PAST_ENCOUNTER_REPORT`: target phiên + service, chỉ mở kết quả thuộc phiên.
- `PAST_ENCOUNTER_IMAGE`: target phiên + service + ảnh, kiểm tra trước khi viewer hiển thị ảnh mới.

Mỗi view ghi log trước khi trả dữ liệu; cùng intent không ghi trùng khi StrictMode render lại. Ghi storage/audit lỗi thì không hiện dữ liệu mới và có thử lại riêng. Abort hoặc sai scope không tạo view thành công. Chuyển tab trong cùng detail không ghi lặp toàn bộ phiên; mở lại phiếu/ảnh hoặc tải lại trang có view mới tương ứng.

Khi D5e hoàn tất, grant đóng làm màn D6 và dialog ảnh ở các tab đang mở chuyển sang trạng thái không thể xem. Đổi tài khoản/vai trò cũng gỡ nội dung. Không sửa dữ liệu hiện tại qua thao tác xem phiên cũ.

## Mock data và giới hạn

Toàn bộ dùng mock, không gọi API hoặc dùng dữ liệu VNeID thật. Mô hình chỉ tham khảo các nhóm nội dung được mô tả trong tài liệu dự án, không tích hợp VNeID.

Dữ liệu D6 lấy từ chính `CLINICAL_HISTORY` đang dùng ở D5a và identity của đúng bệnh nhân trong hàng chờ main, không dùng hồ sơ mặc định của P12. CCCD ở doctor chỉ có giá trị đã che. Dị ứng đỏ ở đầu là khai báo hiện có của người bệnh; mục dị ứng trong phiên cũ riêng biệt, thiếu dữ liệu thì hiện chưa khai báo, không suy ra không dị ứng.

Phiên có hậu tố `-1` có nội dung mô phỏng phong phú để kiểm tra các phần và ảnh; các phiên còn lại có trạng thái thiếu dữ liệu tương ứng, không sao chép thuốc/ảnh của phiên khác. Không tạo số liệu xét nghiệm, sinh hiệu hoặc liều điều trị thực tế. Ảnh SVG dùng lại các asset minh họa có ghi rõ không phải ảnh y khoa. Đánh giá mẫu chỉ hiện cho fixture phiên do cơ sở An Khang tạo.

Quyền/audit localStorage chỉ phục vụ giao diện mock. Backend thực tế phải thực thi quyền mở hồ sơ, phạm vi phiên, audit và thu hồi phía server. Cơ chế xác thực patient P12 hiện có không được thay đổi trong tác vụ này.

## Kiểm tra

- Typegen, TypeScript, targeted ESLint doctor/patient-results và production build đạt. Lint toàn repo còn 7 lỗi/30 cảnh báo ngoài phạm vi.
- 11 nhóm logic: scope/identity, audit/idempotency, dữ liệu thiếu, người bệnh/phiên/service/ảnh sai, quyền mở lúc chờ CLS nhưng không nới D5, lỗi storage, abort, điều hướng/bộ lọc và thu hồi.
- 14 nhóm browser: dùng chung P12 và giữ hành vi patient, mở từ lịch sử, masking/readonly, nội dung theo nhóm VNeID, đơn thuốc/phiếu/ảnh, bộ lọc quay lại, URL sai/billing, dữ liệu thiếu, lỗi audit/thử lại, chờ CLS, viewport, hoàn tất/đổi vai trò/người bệnh.
- Doctor 320–1920px và P12 320/390/1440px không tràn ngang; dialog ảnh có banner dị ứng. Các luồng doctor và hồi quy P12 trên fixture guest có 0 API request, 0 runtime exception.
