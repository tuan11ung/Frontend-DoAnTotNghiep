# Thông báo trên cổng bệnh nhân

Chuông nằm bên phải ô tìm kiếm, trước menu tài khoản. Chỉ hiển thị khi đăng nhập bệnh nhân hoặc chọn **Đã đăng nhập** trên thanh xem thử ở trang chủ. Khách không thấy chuông và cần đăng nhập để mở trang `/patient/notifications`.

## Giao diện và thao tác

- Badge đỏ đếm số chưa đọc, hiển thị `99+` khi vượt 99.
- Dropdown có Tất cả / Chưa đọc, Làm mới, Đọc tất cả, tối đa sáu thông báo mới trong phần có thể cuộn và đường dẫn Xem tất cả.
- Bấm thông báo vừa đánh dấu đã đọc, vừa mở màn liên quan; nếu đánh dấu lỗi, vẫn có thể xem nội dung và trạng thái chưa đọc được giữ.
- Trang `/patient/notifications` hiển thị danh sách đầy đủ, bộ lọc, phân trang Tải thêm và phần chi tiết khi có `?id=<notificationId>`.
- Escape đóng dropdown và trả focus về chuông; click ngoài hoặc rời focus cũng đóng. Trên điện thoại, chi tiết xuất hiện trước danh sách và cuộn tới phần đang xem.

| Loại | Màn mở khi bấm |
| --- | --- |
| Kết quả CLS | Phiếu của đúng dịch vụ/ca khám/hồ sơ nếu có liên kết; nếu không có mã dịch vụ thì danh sách chỉ định của ca khám |
| Mời quay lại phòng khám | Lịch khám → Đang diễn ra, nơi xem phòng và hàng chờ sau check-in |
| Nhắc tái khám | Lịch khám sắp tới |
| Mở / đóng quyền truy cập hồ sơ | Chi tiết thông báo ghi nhận sự kiện; đọc thông báo không làm thay đổi quyền |
| Yêu cầu thanh toán | Trang Thanh toán & hóa đơn của đúng hồ sơ/ca khám nếu có liên kết, hoặc chi tiết thông báo |
| Thông báo hệ thống | `actionUrl` nội bộ hợp lệ, hoặc chi tiết thông báo |

Không suy đoán hồ sơ bệnh nhân khi mở kết quả: liên kết chi tiết ca khám/phiếu cần có `profile`. Thiếu dữ liệu liên quan thì không mở thay một hồ sơ hoặc ca khám khác.

## Dùng thử khi chưa có backend

Chạy `pnpm dev`, mở trang chủ, chọn **Đã đăng nhập** trong thanh xem thử rồi bấm chuông. Có sáu thông báo mẫu: kết quả CBC, mời quay lại phòng, thanh toán, tái khám, mở quyền và đóng quyền. Ban đầu có năm thông báo chưa đọc.

Trạng thái đọc lưu riêng tại `medconnect.notifications-demo.v1` dưới dạng danh sách ID, đồng bộ giữa các tab và giữ khi tải lại. Xóa key này để khôi phục trạng thái ban đầu. Chế độ mô phỏng không gọi API thông báo hoặc WebSocket backend.

Phiếu CBC mẫu mở `/patient/results?profile=self&encounter=demo-20261101&service=demo-cbc-1101`. Tab Đang diễn ra chỉ có lịch sau khi check-in theo [hướng dẫn hàng chờ](appointments-tracking.md). Thông báo thanh toán mở `/patient/payments?profile=self&invoice=demo-invoice-1101`; xem [hướng dẫn hóa đơn](patient-payments.md). Mở thông báo không tự thanh toán và không cấp/thu hồi quyền truy cập thật.

## Tài khoản thật

Tái sử dụng bốn API POST có sẵn:

| API cùng origin | Contract |
| --- | --- |
| `/api/patient/notifications/search` | `{unreadOnly:false,pageable:{page,size:20,sortBy:'createdAt',sortDirection:'DESC'}}` → `PageResponse<NotificationResponse>` |
| `/api/patient/notifications/unread-count` | `{}` → `{unreadCount}` |
| `/api/patient/notifications/mark-read` | `{notificationId}` → notification có `readAt` |
| `/api/patient/notifications/mark-all-read` | `{}` → thành công với `data:null` |

Proxy giữ Bearer token, giới hạn đúng endpoint, `Cache-Control: no-store`, timeout 15 giây. Backend lấy tài khoản từ phiên và kiểm tra quyền sở hữu thông báo. Không tự gửi patientId/accountId để lấy danh sách của tài khoản khác.

Chuông và trang danh sách dùng chung một nguồn dữ liệu và một kết nối WebSocket cho phiên hiện tại. STOMP subscribe `/user/queue/notifications`; tự kết nối lại, kiểm tra DTO, loại trùng ID, không tăng badge do frame lặp. Đồng thời làm mới mỗi 30 giây khi tab đang hiển thị và khi quay lại tab. Tải thêm giữ các mục cũ sau khi làm mới. Đánh dấu đọc xử lý được trường hợp có thông báo mới trong lúc yêu cầu đang chờ.

Development mặc định dùng `ws://localhost:8081/api/v1/ws`. Production đặt `NEXT_PUBLIC_BACKEND_WS_URL` theo địa chỉ WebSocket triển khai (HTTPS dùng WSS); nếu chưa cấu hình, danh sách vẫn cập nhật qua polling. Backend HTTP dùng `BACKEND_API_URL`, mặc định `http://localhost:8081`.

Đổi tài khoản hoặc đăng xuất sẽ gỡ dữ liệu và kết nối cũ. Lỗi mạng/phiên đăng nhập hiện thông báo lỗi và nút thử lại; chế độ thật không thay bằng dữ liệu mẫu. `actionUrl` chỉ cho phép các route bệnh nhân/đặt khám đã có; chặn URL ngoài, JavaScript, đường dẫn quản trị và liên kết kết quả thiếu hồ sơ.

Contract đã đối chiếu source backend `Do_an`: `NotificationPatientController`, `NotificationResponse`, `NotificationServiceImpl`. Backend hiện có ba enum `CLS_RESULT_AVAILABLE`, `RETURN_TO_ORIGINAL_ROOM`, `SYSTEM_MESSAGE`; các loại tái khám/quyền truy cập/thanh toán có sẵn ở UI và dữ liệu demo, cần backend phát sự kiện tương ứng hoặc cung cấp `SYSTEM_MESSAGE` kèm `actionUrl`. Màn kết quả hiện dùng fixtures độc lập; ID backend chưa khớp dữ liệu màn này sẽ hiện không có dữ liệu thay vì chọn nhầm hồ sơ.

## Xác nhận

Kiểm tra trình duyệt ở 320–1440px: ẩn với khách, vị trí chuông, sáu loại, lọc/đánh dấu, giữ trạng thái sau tải lại, đồng bộ tab, điều hướng, chi tiết quyền truy cập, phân trang, WebSocket lặp, thông báo đến trong lúc đánh dấu tất cả, lỗi cập nhật, đổi tài khoản, lỗi mạng và whitelist proxy. Luồng tài khoản thật dùng API/WebSocket giả lập để kiểm tra contract; chưa chạy kiểm thử tích hợp với backend thật.
