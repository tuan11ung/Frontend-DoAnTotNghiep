# Khám bệnh: Kết quả CLS (D5d)

## Dùng thử

Trong development mở `/doctor/queue` → **Gọi bệnh nhân tiếp theo → Đã vào phòng → Kết quả CLS**. Chỉ hiện dịch vụ thuộc các phiếu chỉ định của lượt khám đang diễn ra. Có bộ lọc trạng thái, yêu cầu chụp lại và tìm tên/mã dịch vụ/mã phiếu.

Mở **Thử với dữ liệu mô phỏng → Mô phỏng trả kết quả**:

- Chưa có chỉ định: tạo một phiếu mẫu gồm CBC, X-quang ngực, siêu âm ổ bụng và ECG.
- Nếu đã có phiếu D5c: dùng các dịch vụ hiện có, không tự thêm bộ mẫu.
- CBC, X-quang và các dịch vụ thông thường được gắn báo cáo mẫu; siêu âm ổ bụng giữ `PROCESSING`, ECG giữ `NOT_STARTED` để thử trạng thái/hủy. Không ghi đè kết quả cũ, yêu cầu chụp lại hoặc dịch vụ đã hủy.
- Ảnh là SVG minh họa, ghi rõ mô phỏng, không phải ảnh y khoa thực tế. Mô tả/kết luận chỉ là nội dung kiểm thử giao diện.

Production chỉ mở luồng mock khi `NEXT_PUBLIC_ENABLE_DOCTOR_DEMO=true`. Không gọi API, không dùng bệnh án thật, không gửi yêu cầu sang kỹ thuật viên hoặc hệ thống thanh toán.

## Xem kết quả và ảnh

- **Xem kết quả** mở mô tả, kết luận và thời điểm công bố ngay trong thẻ dịch vụ. Chỉ có khi dịch vụ hoàn tất và có báo cáo được công bố. Dịch vụ đang thực hiện/chưa thực hiện không có kết quả giả thay thế.
- Dịch vụ không có ảnh có trạng thái rõ ràng. Chọn ảnh đính kèm để mở dialog; phóng to 100–300%, thu nhỏ/về 100%, cuộn vùng ảnh và chuyển ảnh trước/tiếp.
- Đóng bằng nút hoặc Escape; focus và khóa cuộn theo dialog native. Lỗi tải tệp có thử lại.
- Khung dị ứng đỏ giữ ở đầu màn và xuất hiện trong cả dialog ảnh, dialog hủy/chụp lại. Lỗi/chưa tải hồ sơ không được diễn giải thành không dị ứng.

## Hủy và yêu cầu chụp lại

- Chỉ hủy dòng `NOT_STARTED`; lý do bắt buộc, bỏ khoảng trắng, tối đa 1.000 ký tự. Dòng thành `CANCELLED`, giữ lý do, bác sĩ, grant, thời điểm và requestId. Không hủy cả phiếu khi chỉ chọn một dịch vụ.
- Dòng đang thực hiện/đã có kết quả không có nút hủy; service vẫn kiểm tra lại trạng thái khi lưu để chặn popup cũ ở tab khác.
- **Yêu cầu chụp lại** chỉ cho dịch vụ hình ảnh đã hoàn tất và có ảnh. Ghi chú tùy chọn, tối đa 1.000 ký tự. Lưu yêu cầu `REQUESTED` riêng; không xóa ảnh, kết luận, báo cáo hay đổi trạng thái kết quả cũ.
- Một dòng chỉ có một yêu cầu chụp lại đang chờ. Retry cùng requestId/nội dung không tạo bản ghi thứ hai. Cạnh tranh giữa các tab được xử lý trong khóa dùng chung với kết thúc khám.
- Lỗi lưu giữ lý do/ghi chú trong dialog, không báo thành công. Danh sách kết quả và D5c tự đọc lại có audit khi ledger đổi; việc ghi audit không tự gây vòng lặp đọc lại.
- Dịch vụ đã hủy có thể được chỉ định lại ở D5c thành một dòng mới. Dòng hủy và lý do cũ được giữ nguyên.

## Quyền, dữ liệu và log

Tái sử dụng actor/assignment/encounter/grant: chỉ bác sĩ điều trị đúng cơ sở/ca và lượt `IN_PROGRESS` có quyền đọc/thao tác. Mỗi thao tác xác thực lại dưới Web Lock chung. Lượt khám kết thúc thì ẩn màn và đóng dialog ở tất cả tab; hành động đang chờ sau thao tác kết thúc bị từ chối.

`clsOrders` trong snapshot v2 bổ sung dữ liệu tùy chọn trên dòng: `result`, `cancellation`, `retakeRequests`. Snapshot D5c cũ vẫn đọc được. Validator kiểm tra trạng thái, nội dung, người/grant thao tác, requestId không trùng và whitelist đường dẫn ảnh SVG. Dữ liệu kết quả của bệnh nhân khác không được fallback vào danh sách hiện tại.

Đọc danh sách dùng `CLS_RESULTS` chỉ trả metadata; mở báo cáo dùng `CLS_RESULT_DETAIL`, mở/chuyển ảnh dùng `CLS_RESULT_IMAGE`. Hai resource sau bắt buộc targetId cụ thể. Tất cả ghi log trước khi trả dữ liệu; lỗi ghi log không trả báo cáo/ảnh mới, có thể thử lại. Zoom cùng ảnh không tạo log thừa; đóng/mở lại hoặc chuyển ảnh tạo lượt xem riêng. Không log nội dung sức khỏe, lý do hủy, token hoặc mật khẩu ra console.

Các kiểm tra quyền và audit ở localStorage chỉ phục vụ mock. Backend thực tế phải thực thi quyền và log phía server. Không có màn kỹ thuật viên. Kê đơn/hoàn tất hiện nằm ở [D5e](doctor-conclusion-prescription.md); nút hoàn tất ở hàng chờ dẫn tới D5e để kiểm tra và xác nhận, không đóng lượt khám trực tiếp.

## Kiểm tra

- Targeted ESLint, route typegen, TypeScript và production build đạt.
- 11 nhóm logic: scope, kết quả/ảnh có audit, hủy đúng trạng thái/lý do, idempotency, chụp lại, cạnh tranh tab, lỗi lưu, snapshot không hợp lệ và thu hồi quyền.
- 14 nhóm browser: vào từ hàng chờ, filter/search, mô tả/kết luận, dialog zoom/chuyển ảnh/Escape, audit lỗi và retry, hủy/lý do, cập nhật D5c, chụp lại hai tab, reload, scope/vai trò, thu hồi khi ảnh đang mở.
- Viewport 320–1920px; cảnh báo đỏ vẫn hiển thị; 0 API request và 0 runtime exception. Lint toàn repo còn 7 lỗi/30 cảnh báo có sẵn ngoài phạm vi.
