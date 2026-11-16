# Bác sĩ thêm/xác minh dị ứng và tiền sử

Trong lượt khám đang diễn ra, mở Hồ sơ & tiền sử → Dị ứng & tiền sử bệnh.

- Thêm dị ứng thuốc, thực phẩm hoặc tác nhân khác; nhập biểu hiện. Với thuốc, có thể tra cứu hoạt chất để backend đối chiếu khi kê đơn.
- Thêm tiền sử: tên bệnh, năm phát hiện, trạng thái đã khỏi/đang theo dõi; có thể chọn mã ICD.
- Khai báo chưa xác minh có nút Kiểm tra / xác minh. Bác sĩ xem lại nội dung rồi bấm Lưu và xác minh. Bản ghi đã xác minh có nút Cập nhật.
- Endpoint save của backend tự đặt verified=true; nguồn khai báo cũ được backend giữ lại. Frontend không xác minh hàng loạt hoặc tự đánh dấu khi chỉ mở xem.
- Bản ghi đã gắn hoạt chất/ICD giữ nguyên liên kết khi xác minh, tên theo danh mục không được sửa thành tên tự do.
- Form nằm ngay tại mục tương ứng, giữ khi đổi tab trong cùng lượt khám. Lưu hoặc Hủy trước khi hoàn tất khám. Refresh/rời lượt khám không lưu bản nháp.
- Dị ứng đã lưu cập nhật ngay ở cảnh báo ghim phía trên. API save yêu cầu bác sĩ điều trị có quyền hồ sơ đang mở.

Proxy bổ sung patient-allergies/save, patient-conditions/save, ingredients/search. Các thao tác ghi chỉ có trên màn điều trị API, không có trên màn xem bệnh án cũ chỉ đọc. Backend và schema không thay đổi.

## Kiểm thử đã thực hiện

Chrome và backend local: thêm dị ứng thực phẩm QA ở bệnh nhân 12/lượt 3; đổi tab giữ bản nháp, lưu cập nhật cảnh báo, thêm tiền sử, tải lại còn dữ liệu. Thử bước xác minh bằng bản ghi thật nhưng mô phỏng cờ chưa xác minh trong phản hồi danh sách; thao tác lưu vẫn gọi backend thật. Bác sĩ thứ hai gọi save tiền sử cùng bệnh nhân bị trả 403. Build, TypeScript và ESLint đạt.

Dữ liệu kiểm thử ghi rõ QA, chỉ dùng trên hồ sơ thử. Các nhánh lỗi mạng, ngày phát hiện ngoài giới hạn và trạng thái sau đóng quyền vẫn cần kiểm tra khi môi trường thay đổi.
