# Khám bệnh: Kết luận & kê đơn (D5e)

## Dùng thử

Trong development mở `/doctor/queue` → **Gọi bệnh nhân tiếp theo → Đã vào phòng → Kết luận & kê đơn**. Nút **Hoàn tất lượt khám** ở hàng chờ dẫn tới cùng tab bằng `tab=conclusion`; không thay đổi trạng thái ngay tại hàng chờ.

1. Tìm mã/tên trong danh mục ICD mẫu, thêm chẩn đoán xác định. Có thể có chẩn đoán chính và kèm theo; chọn radio để đổi chẩn đoán chính. Không chọn trùng mã.
2. Tìm và thêm thuốc mẫu của cơ sở. Nhập liều mỗi lần, số lần/thời điểm dùng, số ngày, số lượng, ghi chú cách dùng. Không tự điền hoặc gợi ý liều. Thuốc tạm ngưng/của cơ sở khác không được kê.
3. Đơn trống khi hoàn tất phải chọn rõ **Không kê thuốc trong lượt khám này**. Không cho cùng lúc có thuốc và lựa chọn không kê thuốc.
4. Nhập lời dặn, tùy chọn hẹn tái khám với ngày dự kiến không trước ngày hiện tại theo múi giờ Việt Nam, ghi chú tối đa 1.000 ký tự. Đây là kế hoạch được lưu trong kết luận, chưa tạo lịch hẹn thật.
5. Có thể **Lưu nháp kết luận** khi chưa hoàn thiện. Reload trang đọc lại đúng bản nháp của lượt này. **Nạp lại bản đã lưu (bỏ thay đổi)** là thao tác bỏ nội dung chưa lưu rõ ràng.
6. Chọn **Hoàn tất lượt khám**, kiểm tra dialog tóm tắt và xác nhận khóa. Chẩn đoán bắt buộc; các dòng thuốc phải điền đủ. Nếu D5b/D5c còn nội dung chưa lưu/xác nhận trong cùng màn, phải lưu/xác nhận hoặc bỏ thay đổi trước.

## Cảnh báo dị ứng và mock data

Toàn bộ danh mục, thuốc, hồ sơ, quyền, audit và đơn là mock, không gọi API và không phát hành đơn thuốc thật. ICD mẫu giới hạn các mã đã dùng trong fixture; danh mục thuốc dùng tên Thuốc mẫu A/B/C/D, không có công thức/liều khuyến cáo.

- Cảnh báo dị ứng đỏ luôn ở đầu màn và có trong dialog hoàn tất.
- Đối chiếu chính xác tên khai báo dị ứng thuốc với khóa trong catalog mẫu. Ví dụ người bệnh đầu có Penicillin, người bệnh tiếp theo có Aspirin; cảnh báo phải đổi theo hồ sơ.
- Thuốc trùng khai báo có cảnh báo đỏ tại catalog và dòng đơn; chặn cả lưu nháp và hoàn tất. Service tự đối chiếu lại dưới khóa, không tin trạng thái nút từ UI.
- Không tự diễn giải dị ứng thực phẩm thành dị ứng thuốc; khai báo trống không có nghĩa xác nhận không dị ứng. Banner vẫn hiển thị trạng thái chưa khai báo.
- Đối chiếu mock không thay thế cơ chế kiểm tra chuyên môn/thuốc thực tế và không có kiểm tra tương tác hay phác đồ điều trị.

## Lưu và hoàn tất

`conclusions` là trường tùy chọn trong snapshot `medconnect.doctor-queue-demo.v2`, theo patient/encounter hiện có. Record gồm values, revision, updatedAt/updatedBy, grantId, completedAt và completionRequestId khi đã hoàn tất. Phiên cũ chưa có trường này vẫn hợp lệ.

Lưu/hoàn tất chỉ cho bác sĩ điều trị đúng assignment, cơ sở, encounter và grant còn mở, trạng thái `IN_PROGRESS`. Mở URL không tạo quyền. Mọi thao tác kiểm tra lại dưới Web Lock dùng chung với D5b–D5d. So sánh revision để ngăn ghi đè bản nháp ở tab khác; lỗi giữ nguyên nội dung, có nạp lại rõ ràng.

Hoàn tất là **một lần ghi snapshot** bao gồm:

- Kết luận và toàn bộ đơn/lời dặn/tái khám hiện tại.
- `completedAt` bằng `updatedAt` của record và thời điểm đóng grant.
- Trạng thái lượt khám `COMPLETED`.
- Thu hồi các grant mở của lượt và ghi audit `REVOKED` đúng một lần cho mỗi grant.

Validation, dị ứng, revision hoặc storage lỗi thì không thay đổi lượt/grant/record một phần. Hoàn tất đồng thời chỉ một thao tác thành công; request sau không thể sửa hồ sơ đã khóa. Mọi ghi D5b, chỉ định D5c, hủy/chụp lại D5d và ghi D5e đều bị từ chối sau khi đóng lượt.

UI ở các tab đồng bộ ngay qua snapshot: dialog đóng, nội dung sức khỏe ẩn, chỉ còn thông báo chung **Lượt khám đã hoàn tất**, thời điểm khóa và đường về hàng chờ. Thông báo này không hiện tên, thuốc, chẩn đoán hoặc nội dung bệnh án. Không mở lại quyền xem/sửa nhờ truy cập URL cũ. Người bệnh tiếp theo không nhận bản nháp của người trước.

Đọc D5e ghi audit `CONCLUSION` trước khi trả danh mục/hồ sơ/bản nháp. Lỗi ghi audit không hiện editor mới. Không log nội dung sức khỏe, liều, lời dặn, mật khẩu hoặc token ra console. Snapshot validator kiểm tra kiểu dữ liệu, phạm vi thuốc, revision và tính nhất quán giữa record đã hoàn tất với grant/lượt đã đóng. Ngày tái khám cũ không làm snapshot hỏng khi ngày hiện tại thay đổi; ngày mới được kiểm tra lúc ghi.

Các thay đổi chưa lưu ở một tab trình duyệt khác không được truyền thành dữ liệu chung. Dialog xác nhận nêu rõ khóa áp dụng cho mọi tab; chỉ dữ liệu đã lưu và nội dung D5e đang xác nhận được ghi vào record cuối. Không có tự động lưu bản nhập ở tab khác.

Đây là mô phỏng frontend; backend thực tế phải thực thi khóa bệnh án, phân quyền và audit phía server. Helper mô phỏng trạng thái bên ngoài vẫn dùng được trong kiểm thử thu hồi; UI hàng chờ không còn dùng nó để bỏ qua D5e.

## Kiểm tra

- Targeted ESLint, route typegen, TypeScript và production build đạt.
- 12 nhóm logic: quyền, audit, bản nháp một phần, ICD/thuốc/ngày/số lượng, dị ứng, revision, storage, hoàn tất nguyên tử, khóa D5b–D5e, snapshot lỗi, tách người bệnh và cạnh tranh hoàn tất/lưu.
- 15 nhóm browser: điều hướng hàng chờ, ICD/chẩn đoán chính, dị ứng, kê đơn, ngày tái khám, nội dung chưa lưu D5b/D5c, reload, revision, lỗi audit/lưu, dialog hoàn tất, receipt không chứa sức khỏe, đổi vai trò/người bệnh và không kê thuốc.
- Viewport 320–1920px; banner đỏ sticky; 0 API request và 0 runtime exception. Lint toàn repo còn 7 lỗi/30 cảnh báo ngoài phạm vi.
