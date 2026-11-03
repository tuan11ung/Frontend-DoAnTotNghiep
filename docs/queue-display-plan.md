# Màn hình hàng chờ trước cửa phòng khám

## Phạm vi

Theo `main.md`, hàng chờ thuộc từng phòng của từng cơ sở, người bệnh được đưa vào hàng sau check-in. Luồng 9.2 trong `chi-tiet-luong.md` mô tả hiển thị số thứ tự và tên viết tắt lên màn hình trước cửa phòng khi bác sĩ gọi.

Trang `/queue` là màn hình công cộng, chỉ đọc. Trang dùng bố cục riêng, không có header/footer, phiên đăng nhập hoặc chức năng quản lý của cổng bệnh nhân.

## Kế hoạch và bản giao diện đã triển khai

1. Tách route và feature `queue-display`, khai báo DTO chỉ chứa thông tin được phép hiển thị công khai.
2. Hiển thị cơ sở, phòng, vị trí và bác sĩ phụ trách. Số đang gọi là vùng nổi bật; các vùng khác gồm đang khám, chờ khám và chưa có mặt.
3. Hiển thị thứ tự do nguồn dữ liệu cung cấp, giữ nhãn ưu tiên và quay lại sau CLS. Không tính lại thuật toán xếp hàng ở màn hình.
4. Thêm chọn cơ sở/phòng theo URL, đồng hồ giờ Việt Nam, toàn màn hình, phân trang 6 lượt/trang, tự chuyển mỗi 12 giây và điều khiển bằng bàn phím.
5. Bổ sung dữ liệu minh họa cho trạng thái đang gọi, chưa gọi lượt tiếp theo, tạm dừng và hàng chờ trống. Hiển thị rõ nhãn dữ liệu minh họa.
6. Kiểm tra lint, TypeScript và trình duyệt ở desktop/mobile.

## Mở trang

- `/queue`: phòng Nội 201, BV Đa khoa An Khang.
- `/queue?facility=an-khang&room=tim-mach-202`: đang khám, chưa gọi lượt tiếp theo.
- `/queue?facility=an-khang&room=nhi-203`: phòng tạm dừng.
- `/queue?facility=binh-an&room=noi-101`: cơ sở khác, danh sách trống.

## Phần tích hợp dữ liệu sau giao diện

Bản này sử dụng dữ liệu tổng hợp trong `data/queue-display-demo.ts`. Đồng hồ và tự chuyển trang hoạt động thật; các vé hàng chờ chưa được đồng bộ với backend. Không có chức năng gọi số hoặc sửa lượt khám trên màn hình công cộng.

Khi backend có contract, thay nguồn dữ liệu bằng proxy cùng origin theo convention của dự án và cập nhật qua polling/SSE/WebSocket. API công cộng cần ràng buộc cơ sở, phòng và ngày, chỉ trả tên viết tắt, số thứ tự, trạng thái và mức ưu tiên. Không tái sử dụng API hồ sơ bệnh nhân hoặc token truy cập hàng chờ cá nhân. Bổ sung trạng thái đang tải, lỗi kết nối và thời điểm đồng bộ thành công khi tích hợp; giữ thứ tự từ backend.

## Kết quả kiểm tra

- `pnpm exec tsc --noEmit`: đạt.
- `pnpm build`: đạt, có route `/queue` trong bản production.
- ESLint riêng `src/app/queue` và `src/features/queue-display` với `--max-warnings 0`: đạt.
- `pnpm lint` toàn dự án: còn 10 lỗi và 44 cảnh báo ở các module có sẵn, không thuộc thay đổi này.
- Chrome: đã kiểm tra giao diện tại 320, 390, 1440 và 1920 px, không tràn ngang hoặc có lỗi runtime. Bảng chính vừa màn hình 1440×900; hỗ trợ màn hình TV 1920×1080.
- Đã kiểm tra đổi cơ sở/phòng, URL trực tiếp và fallback URL không hợp lệ, phân trang thủ công, tự chuyển trang 12 giây, trạng thái tạm dừng/trống, vào và thoát toàn màn hình.
