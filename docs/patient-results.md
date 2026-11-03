# Kết quả khám bệnh — giao diện bệnh nhân

## Phạm vi

Trang `/patient/results` hiển thị các ca khám của hồ sơ đang được chọn. Giao diện dùng nền xám sáng, thẻ trắng viền xám và màu nhấn xanh dương. Trong thẻ, tên người khám là tiêu đề lớn, tiếp đến CCCD, tên bệnh viện và mã ca khám. Bên trái giữ ô ngày/tháng/năm; phần dưới là lưới ngày sinh/giới tính, diện điều trị, chuyên khoa, bác sĩ và hàng tiến độ/nút thao tác như bố cục trước. CCCD lấy từ `nationalId` của đúng thành viên; thiếu dữ liệu hiển thị “Chưa cập nhật”. Các số CCCD trong bản xem trước là giá trị tổng hợp minh họa, không phải giấy tờ thật. Giữ các chức năng tab tổng quan/dịch vụ/đơn thuốc/viện phí, nhóm dịch vụ, bộ lọc, xem phiếu và Mã ca khám / Chia sẻ / Hỗ trợ. Màu xanh lá chỉ phục vụ trạng thái có kết quả/hoàn thành.

Chọn Kết quả để vào **Thông tin đợt khám**, gồm các tab:

- **Tổng quan:** thông tin ca khám, thanh tiến độ, số chỉ định theo ba trạng thái và chi tiết theo nhóm. Chọn một nhóm hoặc trạng thái sẽ mở tab Dịch vụ với bộ lọc tương ứng.
- **Dịch vụ:** hai bộ lọc loại dịch vụ và trạng thái; accordion cho Xét nghiệm, Siêu âm, Thăm dò chức năng và Chẩn đoán hình ảnh. Chỉ xuất hiện nhóm có chỉ định trong ca đang xem; không thêm nhóm Khám bệnh/Thủ thuật khi chưa có dữ liệu. Mặc định thu gọn, có mở/thu tất cả. Chỉ dịch vụ đã có kết quả mới có nút xem phiếu.
- **Đơn thuốc / Viện phí:** trạng thái chưa có dữ liệu; không tạo đơn thuốc hoặc số tiền minh họa để thay thế dữ liệu chưa được cung cấp.

Phiếu kết quả có khung giấy, thông tin người bệnh, bảng chỉ số và điều khiển phóng to/thu nhỏ/vừa khung. Hai dịch vụ CBC và AST trong ca `demo-20261101` có mẫu bố cục phiếu. Các ô số liệu và khoảng tham chiếu để “—”, có nhãn minh họa; không tạo kết quả y khoa hoặc chữ ký. Trạng thái đã có kết quả và việc có tệp phiếu là hai dữ liệu riêng: nếu thiếu tệp, hiển thị “Chưa có tệp phiếu kết quả”. Dịch vụ chưa hoàn tất không được hiển thị mẫu phiếu dù mở URL trực tiếp.

Màn hình chỉ đọc, không có thao tác thêm, sửa hoặc hủy chỉ định. Mã ca khám mở hộp đối chiếu/copy mã; Chia sẻ mở hộp copy đường dẫn, không gửi thông tin cho bên ngoài. Chưa tạo mã vạch có thể quét vì chưa có mã do cơ sở y tế cung cấp. Hỗ trợ hướng dẫn liên hệ cơ sở của ca đang xem; không tự tạo số điện thoại.

Ba trạng thái hiển thị:

| Giá trị giao diện | Nhãn |
| --- | --- |
| `NOT_STARTED` | Chưa khám |
| `AWAITING_RESULT` | Đang chờ kết quả |
| `RESULT_READY` | Đã có kết quả |

Không tự tạo số liệu xét nghiệm, chẩn đoán, đơn thuốc, viện phí hoặc kết luận y khoa.

## Đường dẫn xem trước

- `/patient/results`: danh sách ca khám của hồ sơ bản thân.
- `/patient/results?profile=self&encounter=demo-20261101`: tổng quan ca khám có đủ ba trạng thái, gồm đúng năm chỉ định.
- `/patient/results?profile=self&encounter=demo-20261101&tab=services`: ba nhóm chỉ định (3 xét nghiệm, 1 siêu âm, 1 chẩn đoán hình ảnh).
- `/patient/results?profile=self&encounter=demo-20261101&tab=services&group=LAB&status=RESULT_READY`: hai xét nghiệm đã có kết quả.
- `/patient/results?profile=self&encounter=demo-20261101&tab=services&service=demo-cbc-1101`: phiếu bố cục xét nghiệm CBC minh họa, chưa có số liệu.
- `/patient/results?profile=self&encounter=demo-20261028`: ca khám đã hoàn tất.
- `/patient/results?profile=mother&encounter=demo-mother-20261020`: ca khám của hồ sơ mẹ.
- `/patient/results?profile=child`: hồ sơ chưa có ca khám, dùng kiểm tra trạng thái trống.

`encounter` phải khớp một ca khám thuộc `profile` đang chọn. `service` phải thuộc đúng ca khám đó. Mã ca/dịch vụ không tồn tại hoặc không thuộc hồ sơ phải hiển thị trạng thái chưa có dữ liệu; không tự thay thế bằng ca khám/dịch vụ khác. Liên kết từ lịch khám chưa có dữ liệu kết quả tương ứng cũng áp dụng quy tắc này. Tham số `encounter`/`service` rỗng được xử lý là không hợp lệ, không rơi về bản ghi mặc định.

Hồ sơ mặc định là `self` khi không có tham số `profile`. Hồ sơ không tồn tại được thông báo riêng; không thay bằng hồ sơ khác.

## Nguồn dữ liệu

`PATIENT_RESULTS_DEMO` trong `src/features/patient-results/data/patient-results-demo.ts` là dữ liệu tổng hợp dành cho bản xem trước giao diện, độc lập với local storage, API và dữ liệu bệnh nhân thực tế. Hồ sơ, ngày sinh, giới tính, ca khám, thời điểm cập nhật và cấu trúc phiếu đều là dữ liệu mẫu; không có giá trị hoặc diễn giải kết quả y khoa. Giao diện hiển thị nhãn dữ liệu minh họa.

Bản này chưa tích hợp backend hoặc cơ chế xác thực/phân quyền kết quả khám. Khi kết nối dữ liệu thật, backend phải xác thực phiên đăng nhập và quyền truy cập hồ sơ, giới hạn ca khám theo bệnh nhân được phép xem, rồi chỉ trả các chỉ định của ca đó. Tham số URL và bộ lọc phía trình duyệt không thay thế phân quyền backend. Màn hình cần bổ sung xử lý tải dữ liệu, lỗi HTTP/mạng và cập nhật trạng thái theo API thực tế khi có contract.

## Kiểm tra giao diện

- TypeScript, build production và ESLint các file mới/thay đổi: đạt.
- Lint toàn dự án gần nhất còn 8 lỗi và 36 cảnh báo ở các module có sẵn; không có lỗi/cảnh báo ở module kết quả khám.
- Chrome: 12 nhóm kiểm tra tương tác, không có lỗi JavaScript. Mở ca khám từ danh sách; kiểm tra đúng 5 chỉ định, số lượng theo ba trạng thái (2 chưa khám, 1 đang chờ, 2 đã có kết quả), tiến độ 2/5; điều hướng từ tổng quan sang nhóm/trạng thái.
- Kiểm tra accordion, mở/thu tất cả, kết hợp bộ lọc loại/trạng thái, trạng thái không khớp, mở phiếu, phóng to và quay lại giữ bộ lọc. Kiểm tra các hộp mã ca/copy đường dẫn/hỗ trợ, đóng bằng Esc và nút đóng.
- Kiểm tra tìm kiếm tiếng Việt không dấu, xóa bộ lọc, chọn hồ sơ, hồ sơ chưa có ca khám, trạng thái không có dịch vụ tương ứng.
- Kiểm tra 9 đường dẫn lỗi/thiếu dữ liệu: hồ sơ không tồn tại/rỗng, ca khám không tồn tại hoặc không thuộc hồ sơ, phiếu của ca khác, dịch vụ không tồn tại, thiếu mã ca, dịch vụ đang chờ và dịch vụ đã có kết quả nhưng chưa có tệp.
- Kiểm tra danh sách, tổng quan, dịch vụ và phiếu ở 320, 390, 768, 1024, 1440 px; không tràn ngang. Màn hình rộng có cột thông tin phụ; trên điện thoại dùng bố cục một cột.
