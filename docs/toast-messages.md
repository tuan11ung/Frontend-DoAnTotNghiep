# Thông báo thao tác

ToastMessage dùng chung cho các phản hồi ngắn như lưu, công bố, cập nhật trạng thái, xác minh, sao chép và thao tác hàng chờ. Tự đóng sau 4 giây, fade out trong khoảng cuối, có nút đóng, hỗ trợ prefers-reduced-motion và không in ra giấy.

Thông báo được xếp ở góc dưới phải, co theo màn hình điện thoại. Trong native dialog, toast được portal vào dialog để không bị nằm sau backdrop. Không lưu nội dung vào localStorage.

Đã chuyển các banner phản hồi thao tác trong lịch làm việc, quản trị hệ thống/cơ sở, hàng chờ, khám bệnh/CLS, kỹ thuật viên, lễ tân, hồ sơ bệnh nhân và quyền bệnh sử sang component này. Lỗi nhập liệu, lỗi API có nút thử lại, cảnh báo an toàn, trạng thái hồ sơ và màn kết thúc quy trình vẫn hiển thị tại chỗ.

Kiểm thử Chrome độc lập với source component thật: fade out, tự gỡ sau 4 giây, hiển thị lại cùng nội dung, đóng thủ công, toast trong native modal và viewport 390px. TypeScript và lint toàn bộ file thay đổi được kiểm tra. Next build biên dịch và kiểm tra kiểu nhưng kết thúc với SecurityFatalError do cảnh báo bảo mật phiên bản Next.js hiện tại; next dev cũng bị chặn. Không thay dependency hay tắt kiểm tra bảo mật trong thay đổi này.
