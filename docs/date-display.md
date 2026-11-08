# Định dạng ngày trên giao diện

Ngày đầy đủ dùng **DD/MM/YYYY**, ví dụ `08/11/2026`. Ngày kèm giờ dùng
`DD/MM/YYYY HH:mm`, hoặc `DD/MM/YYYY HH:mm:ss` khi cần hiển thị giây.
Thứ trong tuần có thể đứng trước ngày đầy đủ. Ô lịch tháng vẫn dùng số ngày
trong ngữ cảnh tháng/năm, với nhãn truy cập đầy đủ DD/MM/YYYY.

Dùng `formatDisplayDate` và `formatDisplayDateTime` trong
`src/shared/utils/date-format.ts`. Các formatter nghiệp vụ hiện có như
`appointmentDate`, `formatResultDate`, `paymentDate`, `receptionDate`,
`historyDate`, `recordAccessTime` và `scheduleDateLabel` gọi chung helper này.

- Chuỗi ngày ISO `YYYY-MM-DD` giữ nguyên ngày lịch, không lệch do múi giờ máy.
- Timestamp được hiển thị theo `Asia/Ho_Chi_Minh`. LocalDateTime không có offset
  được hiểu là giờ Việt Nam. Ngày giờ đã có offset được đổi đúng sang giờ Việt Nam.
- Hỗ trợ ngày DD/MM/YYYY hiện có và chuỗi bài viết mẫu `12 Th12, 2019`.
- Ngày sai hoặc thiếu hiển thị `—`, không tự suy ra ngày/năm hoặc làm tròn ngày sai.
- Giữ ISO trong payload, bộ lọc, khóa hàng chờ, so sánh, HTML `dateTime` và
  `input[type=date]`. Ô nhập ngày gốc do trình duyệt/hệ điều hành trình bày;
  không thay giá trị ISO bằng chuỗi DD/MM/YYYY trong ô nhập đó.
- Khi chỉ cần ngày, gọi `formatDisplayDate` trực tiếp; không tách chuỗi của
  formatter ngày giờ để tránh phụ thuộc thứ tự ngày/giờ.

Áp dụng cho lịch khám, hồ sơ gia đình/cá nhân, đặt khám và xác nhận/hủy lịch,
kết quả/phiếu khám, thanh toán và biên lai, thông báo, tiếp đón lễ tân,
hồ sơ bác sĩ/cấp cứu, lịch phân công, hàng chờ kỹ thuật viên/màn hình chờ,
ngày đăng bài viết và thời điểm trên màn quản trị.

Kiểm tra: `node scripts/check-date-format.mjs`. Bộ kiểm tra gồm ngày nhuận,
ngày sai/thiếu, số 0 đầu ngày/tháng, đủ bốn chữ số năm, chuyển năm theo múi giờ,
timestamp có/không offset và kết quả độc lập với múi giờ máy thực thi.
