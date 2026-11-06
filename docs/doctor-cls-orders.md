# Khám bệnh: Chỉ định CLS (D5c)

## Dùng thử

Chạy development, mở `/doctor/queue`, gọi bệnh nhân rồi chọn **Đã vào phòng → Chỉ định CLS**. Nếu đang khám, dùng **Vào màn Khám bệnh** từ hàng chờ. Trong production chỉ bật mock khi `NEXT_PUBLIC_ENABLE_DOCTOR_DEMO=true`.

1. Mở nhóm/chuyên mục và chọn dịch vụ trong cây danh mục của cơ sở đang khám. Tìm theo tên, mã hoặc nhóm, hỗ trợ tiếng Việt không dấu. Tìm kiếm không làm mất dịch vụ đã chọn.
2. Kiểm tra danh sách đã chọn; có thể bỏ từng dịch vụ. Dịch vụ tạm ngưng không được chọn. Dịch vụ trong phiếu chưa thực hiện/đang thực hiện của cùng lượt được đánh dấu **Đã chỉ định**.
3. Nhập **Chẩn đoán sơ bộ / Lý do chỉ định** (bắt buộc, tối đa 2.000 ký tự).
4. Đánh dấu cờ an toàn tương ứng: dị ứng thuốc cản quang, mang thai/nghi ngờ mang thai, tiền sử bệnh thận, đang dùng thuốc chống đông. Không tự suy ra dị ứng thuốc cản quang từ một dị ứng thuốc khác. Chưa đánh dấu cờ không đồng nghĩa đã xác minh không có nguy cơ.
5. Chọn **Xác nhận chỉ định**. Thành công hiển thị mã phiếu, danh sách dịch vụ **Chưa thực hiện**, lý do và các cờ đã đánh dấu. Phiếu lưu trên trình duyệt và xem lại được sau khi tải lại trang.

Cảnh báo dị ứng đỏ vẫn ở đầu vùng khám và sticky khi cuộn. Đổi tab trong màn khám giữ nội dung chưa xác nhận. Tải lại/đóng trang khi đang nhập có cảnh báo trình duyệt; nội dung chưa xác nhận không được tự lưu thành phiếu.

## Phạm vi mock và quyền

- Không gọi API, không gửi chỉ định thật, không tạo chi phí/thanh toán hoặc tự diễn giải cờ thành quyết định chuyên môn. Danh mục cố định dùng dữ liệu mẫu của từng cơ sở; không phải danh mục hiện hành của bệnh viện thật.
- Reuse cùng actor/assignment/encounter/grant với D5a/D5b. Chỉ bác sĩ điều trị trong ca được phân công với lượt `IN_PROGRESS` và grant còn mở mới đọc hoặc xác nhận.
- Catalog và phiếu đi qua thao tác đọc có audit `CLS_ORDERS`, ghi log trước khi trả dữ liệu. Ghi log thất bại: không hiện danh sách phiếu mới, form bị khóa và có nút cập nhật/thử lại.
- Xác nhận kiểm tra lại quyền, cơ sở của mọi dịch vụ, trạng thái khả dụng và dịch vụ trùng ngay trong Web Lock dùng chung với kết thúc khám.
- Kết thúc khám thu hồi quyền và ẩn toàn bộ màn khám ở mọi tab. Xác nhận đang đợi khóa phải bị từ chối nếu thao tác kết thúc đã được ghi trước.
- Phiếu gắn patientId, assignmentId, doctorId, hospitalId, grantId, createdAt và requestId. Mỗi dòng lưu serviceId và trạng thái. Không trộn phiếu giữa người bệnh hoặc cơ sở.
- Snapshot hiện tại `medconnect.doctor-queue-demo.v2` bổ sung trường tùy chọn `clsOrders`; dữ liệu D5a/D5b cũ vẫn đọc được. Validator kiểm tra phạm vi và cấu trúc phiếu khi nạp snapshot.
- requestId cho cùng nội dung giúp retry không sinh phiếu trùng. Nội dung khác không được dùng lại requestId. Hai tab cùng chọn một dịch vụ đang chưa hoàn tất chỉ một bên thành công; bên còn lại giữ nội dung, báo lỗi và có **Cập nhật phiếu**.
- Lỗi lưu không xóa dịch vụ/lý do/cờ đang nhập và không báo xác nhận thành công. Chỉ reset form sau khi lưu thành công.

D5d [Kết quả CLS](doctor-cls-results.md) có xem báo cáo/ảnh, hủy và yêu cầu chụp lại; D5e [Kết luận & kê đơn](doctor-conclusion-prescription.md) có lưu/hoàn tất và khóa bệnh án. Danh sách phiếu D5c đồng bộ từ cùng ledger khi D5d đổi trạng thái. Nội dung D5c chưa xác nhận sẽ chặn hoàn tất ở D5e cho tới khi được xác nhận hoặc bỏ thay đổi.

## Cấu trúc và tích hợp Git

UI, catalog, types, validation và service mới nằm trong `src/features/doctor-consultation/cls-orders/`. Màn khám chỉ import panel, mở tab thứ ba và giữ panel sau lần mở đầu. Không đổi giao diện hàng chờ, route hoặc package dependencies trong commit D5c.

Nhánh `feat/doctor-cls-orders` bắt đầu trực tiếp từ `origin/main` (`15a0dbc` ở lúc bắt đầu). Commit nền mang kết quả D5a/D5b sang dưới dạng diff cuối cùng, không replay các commit hàng chờ cũ từng gây add/add conflict; commit D5c tiếp theo tách riêng chức năng mới. Trước khi giao kiểm tra merge và rebase trên worktree tạm với main được fetch lại. Kết quả chỉ xác nhận cho main tại thời điểm kiểm tra; thay đổi cùng vùng code trong main về sau vẫn có thể cần giải quyết conflict.

## Kiểm tra

- Targeted ESLint, route typegen, TypeScript và production build đạt.
- 11 nhóm logic: phạm vi truy cập/danh mục, audit/idempotency, validation, ghi phiếu, trùng dịch vụ, cạnh tranh hai tab, lỗi lưu, snapshot lỗi và thu hồi quyền.
- 14 nhóm browser: luồng hàng chờ → D5c, cây/tìm kiếm, dịch vụ tạm ngưng, chọn/bỏ chọn, lý do/cờ, chuyển tab cùng D5b, lưu/tải lại, trùng giữa tab, lỗi storage/audit và khôi phục, thu hồi, đổi bệnh nhân/vai trò.
- Viewport 320–1920px không tràn ngang; cảnh báo dị ứng đỏ sticky. Luồng browser dùng 0 API request và có 0 runtime exception.
