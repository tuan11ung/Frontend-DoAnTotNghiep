# Hồ sơ cá nhân

Đường dẫn: `/patient/profile`, qua mục **Hồ sơ cá nhân** trong dropdown **Tài khoản**.

## Thử không cần backend

1. Chạy `pnpm dev`, ở trang chủ chọn **Đã đăng nhập** trên thanh **Xem thử giao diện**.
2. Mở **Tài khoản → Hồ sơ cá nhân**.
3. Chọn **Chỉnh sửa** để sửa họ tên, ngày sinh, giới tính, số thẻ BHYT, địa chỉ. Lưu sẽ cập nhật thẻ thông tin bên trái; Hủy bỏ các thay đổi chưa lưu.
4. Thêm/sửa/xóa dị ứng thuốc, thực phẩm hoặc bệnh mạn tính. Có thể khai báo biểu hiện dị ứng, năm phát hiện bệnh và tình trạng đã khỏi. Mục chưa khai báo không đồng nghĩa với không có dị ứng/bệnh.
5. Bệnh tăng huyết áp mẫu là thông tin đã được bác sĩ xác minh: không thể sửa/xóa. Các mục tự khai báo chưa xác minh có thể sửa/xóa, có bước xác nhận trước khi xóa.
6. Mật khẩu mô phỏng ban đầu: `Demo@12345`. Nhập mật khẩu mới ít nhất 8 ký tự, có chữ và số, khác mật khẩu hiện tại và xác nhận khớp. Sau khi đổi có thể dùng mật khẩu mới trong lần mở trang này. Tải lại trang sẽ đặt lại mật khẩu mẫu.

Thông tin cá nhân/sức khỏe mẫu lưu trong `medconnect.patient-profile-demo.v1`, đồng bộ giữa các tab. Chỉ dùng dữ liệu thử. Mật khẩu không được lưu vào localStorage/sessionStorage, URL hoặc log; chỉ giữ giá trị băm trong bộ nhớ trang để kiểm tra thao tác mô phỏng. Lịch hẹn cũ và dữ liệu kết quả khám mẫu độc lập không bị sửa khi thay đổi hồ sơ mô phỏng.

## Tài khoản thật

Trang chỉ lấy hồ sơ có `relationship=SELF`; không chọn hồ sơ người thân để thay thế nếu thiếu SELF. Khách thấy lời mời đăng nhập. Khi đổi tài khoản/đăng xuất, trang gỡ thông tin tài khoản trước. Chế độ thật không dùng dữ liệu mô phỏng để thay thế lỗi API.

API POST cùng origin `/api/patient/account/<endpoint>` chuyển tới `${BACKEND_API_URL}/api/v1/patient/<endpoint>`, mặc định backend `http://localhost:8081`:

| Endpoint | Dữ liệu gửi |
| --- | --- |
| `profiles/list` | `{}` |
| `profiles/update` | `patientId, fullName, dob, gender, address, insuranceNo` |
| `allergies/list` | `patientId` |
| `allergies/save` | `patientId, id? , name, type, reaction` |
| `allergies/delete` | `patientId, id` |
| `conditions/list` | `patientId` |
| `conditions/save` | `patientId, id?, name, diagnosedYear, recovered` |
| `conditions/delete` | `patientId, id` |

Contract đã đối chiếu với `PatientProfilePatientController`, `PatientAllergyPatientController`, `PatientConditionPatientController` trong backend `Do_an`. Proxy yêu cầu Bearer token, giới hạn endpoint, timeout 15 giây và trả `Cache-Control: no-store`. Backend phải tiếp tục kiểm tra quyền sở hữu hồ sơ và khóa thông tin lâm sàng. Frontend không phải ranh giới phân quyền.

Số điện thoại/CCCD dùng giá trị che do backend trả về và chỉ đọc, vì API cập nhật hồ sơ hiện không hỗ trợ hai trường này. Người dùng được hướng dẫn liên hệ cơ sở y tế.

Backend hiện chưa có API đổi mật khẩu: ở tài khoản thật phần đổi mật khẩu hiển thị trạng thái chờ kích hoạt và không gửi yêu cầu giả định. Cần bổ sung contract đổi mật khẩu và chính sách phiên đăng nhập trước khi kích hoạt cho tài khoản thật.

## Kiểm tra

Đã kiểm tra thao tác trên trình duyệt với dữ liệu mô phỏng và API giả lập: lưu/hủy hồ sơ, lưu sau tải lại, đồng bộ tab, CRUD dị ứng/bệnh, khóa mục xác minh, kiểm tra mật khẩu và không lưu mật khẩu, thiếu SELF, dữ liệu sức khỏe sai patientId, đổi tài khoản, lỗi mạng và thử lại. Kiểm tra bố cục 320–1440px. Backend thật chưa chạy trong phiên kiểm tra, nên chưa xác nhận tích hợp trực tiếp.
