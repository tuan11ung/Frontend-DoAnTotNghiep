# Thanh toán & hóa đơn

Trang `/patient/payments` có ba lối vào:

1. **Tài khoản → Thanh toán & hóa đơn**: xem tổng quan hóa đơn và lịch sử của thành viên đang chọn.
2. **Kết quả khám → Chọn ca khám → Viện phí → Xem hóa đơn & thanh toán**: truyền đúng `profile` và `encounter`.
3. Thông báo **Yêu cầu thanh toán**: truyền `profile` và `invoice` hoặc `encounter`.

Chưa đăng nhập chỉ thấy lời mời đăng nhập. Tham số hồ sơ/hóa đơn/ca khám không hợp lệ, không thuộc thành viên hoặc mâu thuẫn sẽ hiện không tìm thấy; không chuyển sang hóa đơn của hồ sơ khác. Đổi thành viên sẽ xóa lựa chọn hóa đơn cũ. Đổi tài khoản gỡ dữ liệu và cửa sổ của tài khoản trước.

## Giao diện

- Hóa đơn lượt khám: lọc Chưa trả/Đã trả, tìm mã hóa đơn/ca khám/cơ sở trên desktop; bộ chọn hóa đơn gọn trên điện thoại.
- Chi tiết chi phí theo Khám bệnh, Cận lâm sàng, Thuốc; số lượng, đơn giá, tổng chi phí, giảm trừ và số tiền phải trả.
- Thẻ phương thức VNPay, MoMo, Thẻ; bước xác nhận riêng trước khi cập nhật trạng thái mô phỏng.
- Lịch sử bao gồm Thành công, Đang chờ, Thất bại, Đã hủy; chỉ giao dịch thành công được xem biên lai/xác nhận.
- Biên lai mẫu có người khám, hóa đơn, ca khám, phương thức, mã giao dịch, thời điểm và số đã trả. Tải tài liệu HTML độc lập hoặc dùng In / Lưu PDF của trình duyệt. Biên lai có nhãn mô phỏng và không phải hóa đơn điện tử chính thức.

## Thử không cần backend

Chạy `pnpm dev`, ở trang chủ chọn **Đã đăng nhập** trên thanh xem thử rồi mở **Tài khoản → Thanh toán & hóa đơn**.

| Hồ sơ / Hóa đơn | Dữ liệu mẫu |
| --- | --- |
| Bản thân / `demo-invoice-1101` | Khám 200.000đ + CLS 550.000đ + thuốc mẫu 150.000đ = 900.000đ; giảm trừ 300.000đ; cần trả 600.000đ |
| Bản thân / `demo-invoice-1028` | Đã trả 500.000đ qua MoMo, có biên lai mẫu |
| Mẹ / `demo-invoice-mother` | Chưa trả 350.000đ |
| Con | Chưa có hóa đơn |

Danh tính/ca khám mẫu lấy từ fixtures của module Kết quả khám để liên kết đúng ca; không phải dữ liệu thanh toán thật của chủ tài khoản. Khoản BHYT/ưu đãi và giá dịch vụ chỉ là số liệu thử, không phải chính sách hoặc giá áp dụng của một bệnh viện.

1. Chọn VNPay, MoMo hoặc Thẻ, bấm Thanh toán. Chỉ tạo giao dịch `PENDING`, chưa đổi hóa đơn thành đã trả.
2. Trong modal, tích xác nhận đúng hóa đơn/số tiền. Bấm **Xác nhận mô phỏng** để thành công, **Mô phỏng thất bại** để thử lỗi hoặc **Hủy giao dịch** để hủy.
3. Đóng modal/Escape sẽ giữ trạng thái chờ. Bấm **Tiếp tục giao dịch đang chờ** để mở lại, không tạo giao dịch thứ hai.
4. Thành công đổi hóa đơn thành `PAID`, hiện biên lai và cập nhật lịch sử. Không thanh toán lại hóa đơn đã trả.
5. Mở hai tab cùng hóa đơn để thử đồng bộ: Web Locks bảo vệ cập nhật, một giao dịch chờ được dùng chung, thành công chỉ ghi nhận một lần. Nhánh fallback khi trình duyệt không có Web Locks chỉ dùng cho mô phỏng, không dùng bảo đảm giao dịch thật.

Trạng thái lưu riêng ở `medconnect.payments-demo.v1`, đồng bộ qua storage/custom event và giữ khi tải lại. Xóa key để khôi phục hóa đơn ban đầu. Dữ liệu sai cấu trúc hoặc sai quyền sở hữu hiện lỗi thay vì tự thay bằng mẫu khác. Không lưu số thẻ/CVV/OTP; lựa chọn Thẻ chỉ hiển thị thẻ mẫu `•••• 4242`.

Tham số URL như `status=SUCCESS`, `vnp_ResponseCode=00` không có quyền thay đổi trạng thái. Không gọi cổng thật hoặc API tạo thanh toán trong chế độ mô phỏng.

## Dữ liệu API thật và giới hạn hiện tại

Đã đối chiếu controller/DTO trong backend `Do_an`: `InvoicePatientController`, `InvoiceSummaryResponse`, `InvoiceDetailResponse`, `TransactionResponse`. Trang lấy danh sách hồ sơ qua API hồ sơ hiện có, mặc định chọn đúng một `SELF`, rồi gọi POST:

| Proxy cùng origin | Request |
| --- | --- |
| `/api/patient/invoices/search` | `{patientId,pageable:{page,size:20,sortBy:'createdAt',sortDirection:'DESC'}}` |
| `/api/patient/invoices/detail` | `{patientId,invoiceId}` |

Proxy dùng `BACKEND_API_URL` (mặc định `http://localhost:8081`), Bearer token, không cache và timeout 15 giây. Backend phải kiểm tra quan hệ sở hữu hồ sơ và hóa đơn. Trang tải lần lượt các trang tóm tắt, rồi tải chi tiết theo nhóm tối đa năm yêu cầu để có lịch sử giao dịch của hồ sơ; giới hạn bảo vệ 50 trang, không hiển thị một danh sách cắt cụt như thể đầy đủ.

API thật hiện chỉ có tổng phí khám, tổng CLS, tổng hóa đơn và giao dịch; không có dòng thuốc, giảm trừ, tên cơ sở hoặc endpoint phát hành biên lai chính thức. Giao diện hiển thị **Chưa cung cấp** cho phần thiếu, không tự tính phần thuốc/giảm trừ từ chênh lệch. Với giao dịch thật thành công, có thể xem xác nhận đã ghi nhận; không tạo biên lai thuế giả hoặc file mẫu như biên lai thật.

Backend có `create-payment` cho VNPAY/MOMO nhưng bản giao diện này **chưa kích hoạt thu tiền online thật**. Phương thức thẻ chưa có contract backend. Proxy chỉ mở `search/detail`, không mở endpoint ghi tiền. Cần hoàn thiện/cấu hình gateway, callback/webhook xác thực phía server và phát hành biên lai trước khi kích hoạt thanh toán thật. Không xác nhận trả tiền chỉ từ URL trả về phía trình duyệt.

Lỗi mạng hoặc phiên đăng nhập có nút Thử lại; tài khoản thật không dùng dữ liệu mẫu để thay thế lỗi API. Source backend chỉ được đọc để đối chiếu, không chỉnh sửa trong tác vụ UI này.

## Kiểm tra

Kiểm tra trình duyệt 320–1440px: ba lối vào, đủ thành phần hóa đơn, ba phương thức, bắt buộc xác nhận, thành công/thất bại/hủy/chờ, tiếp tục giao dịch, lưu sau tải lại, lịch sử, tải/in biên lai, hai tab, hồ sơ gia đình, URL sai/cross-profile, tham số cổng giả, dữ liệu lưu lỗi, đổi tài khoản, API lỗi và proxy chỉ đọc. Contract thật được kiểm tra bằng API giả lập; chưa kiểm thử với backend/cổng thanh toán thật.
