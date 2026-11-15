# Test D5a – Hồ sơ và lịch sử bệnh án

## Demo giao diện không cần backend

Chạy frontend bằng pnpm dev, mở /doctor/queue?demo=1 bằng cửa sổ chưa đăng nhập tài khoản khác vai trò.

1. Chọn ca/phòng mẫu, gọi bệnh nhân, chọn Đã vào phòng. Mở màn Khám bệnh từ bệnh nhân đang khám.
2. Tab Hồ sơ & lịch sử: kiểm tra CCCD, SĐT được che. Cuộn trang: khung dị ứng đỏ vẫn hiển thị.
3. Thử lần lượt cơ sở, chuyên khoa, từ ngày/đến ngày, ICD; áp dụng và đặt lại. Thử khoảng ngày đảo ngược, từ khóa không có kết quả. Mở phiên khám cũ rồi quay lại.
4. Dùng lượt dữ liệu mẫu có thể hoàn tất: lưu các phần bắt buộc và hoàn tất lượt khám. Hồ sơ phải đóng quyền. Dùng Back/tải lại URL cũ: không đọc được hồ sơ điều trị đã đóng.

Demo kiểm tra trải nghiệm và quyền mô phỏng, không chứng minh log trong database.

## Kiểm tra với API thật

Chuẩn bị một bác sĩ được phân công, một lễ tân và bệnh nhân có ít nhất hai phiên khám cũ với ngày/ICD khác nhau. Chỉ thấy các cơ sở backend cho phép xem. Cần khai báo dị ứng của bệnh nhân để thử khung đỏ có nội dung.

1. Lễ tân tạo lịch, check-in bệnh nhân. Bác sĩ đăng nhập, mở /doctor/queue và chọn đúng ca/phòng được phân công.
2. Gọi bệnh nhân → Đã vào phòng → mở Khám bệnh. Không dùng demo=1 trong URL.
3. Tab Hồ sơ & tiền sử: kiểm tra ngày DD/MM/YYYY, CCCD/SĐT che bớt, bệnh nền và dị ứng. Cuộn xuống và chuyển các tab: cảnh báo dị ứng vẫn ở đầu vùng xem.
4. Chờ tải hết bệnh sử rồi lọc cơ sở, chuyên khoa bác sĩ, ngày, ICD. Kết quả lọc phải tính trên toàn bộ lịch sử đã tải, không chỉ trang đầu. Thử kết hợp các điều kiện, không có kết quả và Đặt lại. Danh sách dài hơn 10 mục có phân trang.
5. Mở bệnh án cũ, kiểm tra đúng bệnh nhân và ngày, chẩn đoán, CLS, đơn thuốc. Bấm quay lại.
6. Trong cửa sổ riêng đăng nhập bác sĩ khác, mở cùng URL. API phải từ chối khi không có quyền điều trị. Thay patientId hoặc encounterId trong URL cũng phải bị từ chối.
7. Mở cùng ca trong hai tab. Hoàn tất ca ở một tab sau khi lưu chẩn đoán, đơn thuốc và hoàn tất CLS. Tab vừa hoàn tất đóng hồ sơ ngay; tab còn lại đóng khi lấy focus hoặc trong tối đa khoảng 15 giây. Back/tải lại không được mở bệnh sử đã đóng.
8. Thử thu hồi đồng ý truy cập bệnh sử từ phía bệnh nhân, sau đó mở lại bệnh sử bằng bác sĩ: API phải từ chối.
9. Kiểm tra log backend: yêu cầu đọc hồ sơ, danh sách lịch sử và chi tiết phải đi qua RecordAccessService và tạo recordAccessed trong SystemLogService. Đối chiếu bác sĩ, bệnh nhân, lượt khám và thời điểm; frontend không tự tạo log giả. Việc kiểm tra quyền định kỳ có thể tạo thêm log truy cập.

## Hồi quy trang bệnh án cũ

- Mở phiên khám cũ trong tab thứ hai: ngày hiển thị DD/MM/YYYY và dị ứng được ghim khi cuộn, cùng nội dung với màn điều trị.
- Hoàn tất ca hiện tại ở tab thứ nhất. Quay lại tab bệnh án cũ hoặc chờ tối đa khoảng 15 giây: thông tin bệnh án, CLS và đơn thuốc phải biến mất khi API báo đóng quyền.
- Thử thu hồi quyền bệnh sử khi ca còn diễn ra: kết quả tương tự. Nút Kiểm tra lại quyền truy cập phải gọi API lại, không phục hồi dữ liệu lưu cũ.
- Ngắt mạng khi kiểm tra quyền: nội dung cũ cũng bị ẩn; nối mạng và thử lại để tải thông tin có quyền.
- Điều hướng sang bệnh nhân/lượt khám khác: không hiển thị tạm dữ liệu của lượt trước. Chỉ render hồ sơ khi kiểm tra ca đang diễn ra, bệnh án cũ và dị ứng đều thành công.

## Giới hạn hợp đồng API

API lịch sử hiện chưa trả chuyên khoa của phiên khám. Giao diện tra cứu chuyên khoa từ hồ sơ bác sĩ hiện tại qua public directory. Nếu hồ sơ bác sĩ không còn công khai, hiển thị Chưa cập nhật. Đây không phải chuyên khoa lịch sử được lưu tại thời điểm khám. Muốn lọc chính xác chuyên khoa thời điểm khám cần backend bổ sung trường này.

API cấp quyền chỉ trả phạm vi bệnh sử được phép; frontend không mở rộng quyền sang cơ sở khác. Không có bệnh sử trong database thì giao diện hiển thị danh sách trống, không tự sinh ca giả.
