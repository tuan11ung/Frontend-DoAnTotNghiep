**ĐỊNH HƯỚNG HỆ THỐNG QUẢN LÝ HỒ SƠ KHÁM CHỮA BỆNH**

# **1\. Phân tích mục đích chính của hệ thống**

**Vấn đề thực tế:** khi bệnh nhân khám ở nhiều cơ sở y tế hoặc bệnh tái phát, người bệnh/người nhà có thể phải mang theo nhiều giấy tờ, kết quả xét nghiệm, hình ảnh, đơn thuốc và thông tin điều trị. Đồng thời, bác sĩ ở cơ sở khác cũng có thể thiếu thông tin về bệnh sử, thuốc đã dùng hoặc tiền sử dị ứng. 

**Giải pháp:** Để quá trình khám bệnh được thuận tiện hơn và tránh rủi ro trong việc sử dụng thuốc không phù hợp, hệ thống được phát triển dưới dạng một website, nhằm mục đích chính là xây dựng một nền tảng hồ sơ khám chữa bệnh điện tử tập trung.

**Hệ thống sẽ phục vụ các công tác sau**:

- Cho phép bệnh nhân đăng ký khám, truy cập hồ sơ sức khỏe điện tử (trong đó có lịch sử các đợt khám tại các cơ sở y tế khác nhau).  
- Cho phép bác sĩ trong cơ sở y tế được phép truy cập hồ sơ sức khỏe điện tử của bệnh nhân để hỗ trợ quá trình khám và điều trị.

# **2\. Phạm vi sử dụng**

**Phạm vi sử dụng của hệ thống:** 

- **Phạm vi triển khai:** Hệ thống được thiết kế để triển khai trong nhiều bệnh viện công lập do Bộ Y tế Việt Nam quản lý.   
- **Cơ sở dữ liệu:** Hệ thống sử dụng CSDL tập trung (tức chỉ sử dụng một CSDL duy nhất) để chia sẻ dữ liệu bệnh án giữa nhiều bệnh viện khác nhau.   
- **Nền tảng thiết bị sẽ sử dụng:**   
  - Trong bệnh viện: trên máy tính của bệnh viện, đặt tại quầy lễ tân và trong các phòng khám, sử dụng bởi nhân viện bệnh viện (bao gồm: lễ tân, bác sĩ, lãnh đạo bệnh viện)  
  - Người dùng: trên máy tính hoặc điện thoại, vì vậy giao diện cần thiết kế responsive để tối ưu trên điện thoại. 

Lưu ý rằng dù sử dụng chung cơ sở dữ liệu, dữ liệu và quyền truy cập của mỗi cơ sở phải được phân tách. Đây là mô hình multi-tenant. 

Bản prototype chỉ mô phỏng một số bệnh viện/cơ sở

# **3\. Các nhóm người dùng và quyền truy cập**

Những người được vào hệ thống và chức năng mỗi người được thực hiện khi vào hệ thống này được quy định như sau: 

- Khách (Guest):  
  - Đăng nhập  
  - Đăng ký (có xác thực email bằng OTP, sẽ implement khi đã xong phần bệnh viện của hệ thống)  
  - Truy cập trang chủ (tại đây có thể tìm kiếm các bài đăng về bệnh giống như VinMec, có thể đặt lịch khám, xem chính sách đặt/hủy lịch khám)  
  - Hỏi đáp chatbot (về triệu chứng bệnh)  
- Người dùng đã xác thực (Auth-ed User):  
  - Quản lý hồ sơ cá nhân (profile)  
  - Đăng xuất  
- Bệnh nhân:  
  - Quản lý gia đình  
  - Xem danh sách lịch khám  
  - Đặt lịch khám online (cho bản thân hoặc cho người nhà)  
  - Hủy lịch khám online  
  - Xem hàng chờ bệnh nhân của phòng (sau khi bệnh nhân được lễ tân checkin)  
  - Đánh giá hiệu quả của quá trình điều trị (sau khi kết thúc phiên khám và sau khi sử dụng hết đơn thuốc)  
  - Hỏi đáp chatbot (phân tích kết quả sau khi khám hoặc phân tích về thuốc, dựa theo dữ liệu các kết quả CLS và kết quả chẩn đoán cuối cùng của bác sĩ điều trị)  
- Lễ tân:  
  - Checkin cho bệnh nhân (cả offline và online)  
  - Checkout cho bệnh nhân (có thanh toán)  
- Bác sĩ:  
  - Xem hàng chờ bệnh nhân của phòng khám  
  - Xem hồ sơ cá nhân của bệnh nhân và lịch sử bệnh án (lịch sử bệnh án là một danh sách các phiên khám trong quá khứ)  
  - Xem chi tiết một phiên khám   
  - Tiếp nhận bệnh nhân vào phòng khám (đánh dấu bệnh nhân đã vào phòng khám, hoặc đánh dấu bệnh nhân “vắng mặt” nếu họ vắng)  
- Bác sĩ điều trị (Clinical Doctor):  
  - Khám lâm sàng cho bệnh nhân, chỉ định dịch vụ CLS cho bệnh nhân  
  - Xem kết quả CLS  
  - Hoàn tất lượt khám (đưa ra kết luận cuối, gồm chẩn đoán cuối cùng, kê thuốc cho bệnh nhân, chỉ định tái khám)  
  - Đánh dấu phiên khám đáng chú ý  
- Kỹ thuật viên CLS (Clinical Service Staff):  
  - Khám CLS  
  - Hoàn tất chỉ định CLS (đưa kết luận cho dịch vụ CLS. Sau đó, HT tự động gửi kết quả của dịch vụ CLS về bác sĩ khám sàng lọc, và gửi thông báo đã có kết quả của dịch vụ CLS cho bệnh nhân qua)  
- Lãnh đạo bệnh viện:  
  - Xem danh sách các phiên khám đáng chú ý (Chỉ xem được bệnh án do chính **bệnh viện mình** tạo ra, không xem được hồ sơ từ viện khác)  
  - Xem chi tiết một phiên khám đáng chú ý  
- Dịch vụ Notification của hệ thống  
  - Gửi thông báo “Đã có kết quả CLS” cho bệnh nhân (sau khi có kết quả một dịch vụ CLS cụ thể)  
  - Gửi thông báo “Chở về phòng khám ban đầu” cho bệnh nhân (sau khi đã có đủ kết quả CLS)  
- Dịch vụ SMS/Email:  
  - Gửi thông báo khi hồ sơ bệnh án được bác sĩ truy cập và khi bị đóng lại  
- Admin cơ sở y tế:  
  - Quản lý thông tin cơ sở y tế (hotline, địa chỉ, giấy phép, giới thiệu, giờ làm việc, chính sách đặt/hủy lịch khám)  
  - Quản lý khoa   
  - Quản lý chuyên khoa  
  - Quản lý phòng  
  - Gắn trưởng khoa, bác sĩ phụ trách cho khoa/chuyên khoa/phòng  
  - Quản lý tài khoản nhân viên (trưởng khoa, bác sĩ, dược sỹ, lễ tân)  
  - Quản lý Dịch vụ khám và Bảng giá  
  - Phân công lịch làm việc cho nhân viên   
- Admin toàn quyền (Super Admin):  
  - Quản lý cơ sở y tế (tạo mới cơ sở y tế, xem danh sách, tạm dừng hoạt động)  
  - Quản lý tài khoản Admin cơ sở y tế   
  - Cấu hình hệ thống (sửa thời gian hiệu lực mặc định khi bệnh nhân chia sẻ hồ sơ)  
  - Nhật ký hệ thống (Read-only): (chỉ log các hành động: khi hồ sơ bệnh án được HT mở quyền truy cập và khi bị đóng lại, khi bác sĩ điều trị đánh dấu ca bệnh đáng chú ý, khi trưởng khoa xem chi tiết ca bệnh đáng chú ý)  
    - *Note: Tra cứu lịch sử truy cập hồ sơ y tế (ai truy cập, thời gian nào (ngày tháng năm, giờ phút giây), thuộc cơ sở nào, truy cập vào bệnh sử của bệnh nhân nào).*

# 

# **Luồng xác thực:**

1. Đăng ký (Register)  
- Bệnh nhân phải đăng ký tài khoản để khám bệnh tại các cơ sở y tế mà hệ thống quản lý. Khi đăng ký phải nhập các thông tin:  
  - Họ tên  
  - DOB  
  - SĐT (dùng để định danh duy nhất bệnh nhân trong toàn hệ thống)  
  - Email (để xác thực OTP sau khi submit thông tin đăng ký)  
- Sau khi gửi thông tin đăng ký, hệ thống tạo tài khoản mới trong CSDL, với status PENDING; đồng thời SMS Service sẽ gửi về email bệnh nhân một mã OTP. Cùng lúc, HT hiển thị GD Xác thực OTP.  
- Bệnh nhân phải nhập đúng mã OTP hệ thống gửi cho qua dịch vụ mail.   
  - Nếu đúng mã OTP, HT hiển thị thêm 2 input box “Nhập mật khẩu” và “Xác nhận mật khẩu”  
- Sau khi nhập đúng mã OTP, hệ thống chuyển status PENDING \-\> ACTIVE


2. Đăng nhập:  
- Tiền điều kiện: bệnh nhân/nhân viên đã có tài khoản tương ứng với vai trò của mình trong hệ thống  
  1. Đăng nhập (bệnh nhân):  
- Bệnh nhân nhập sđt và mật khẩu.   
- Hệ thống hash sđt và mật khẩu theo chuẩn đã định trong project, rồi so khớp với bảng patient trong CSDL (UNIQUE constraint CCCD), nếu đúng thì HT hiển thị toast message “Đăng nhập thành công” và chuyển sang GD Trang chủ   
  2. Đăng nhập (nhân viên CSYT):  
- Nhân viên nhập email và mật khẩu đã được admin CSYT cấp cho trước đó (nhân viên không được đăng ký tài khoản công vụ, chỉ có admin CSYT mới được tạo tài khoản công vụ cho nhân viên).   
- Hệ thống hash mật khẩu theo chuẩn đã định trong project, rồi so khớp với bảng staff trong CSDL (UNIQUE constraint email), nếu đúng thì HT hiển thị toast message “Đăng nhập thành công” và chuyển sang GD … 


## **Hồ sơ bệnh nhân**

* Hồ sơ cá nhân (chứa thông tin user cơ bản như cccd, bhyt, họ tên, dob, giới tính, địa chỉ, có phải đối tượng dc nhà nc hỗ trợ k? , chứa các thông tin quan trọng về sức khoẻ như: dị ứng (thực phẩm, thuốc), bệnh mãn tính. Thực phẩm dị ứng có thể là bơ, lạc, tôm…; thuốc dị ứng có thể là 1 chủng kháng sinh nào đó; bệnh mãn tính có thể là tiểu đường, viêm gan….  
* Thông tin liên hệ và người liên hệ khẩn cấp (nh thân gia đình như: cha mẹ, con cái, anh chị em…)  
* Tiền sử bệnh, dị ứng thuốc và các thông tin y tế quan trọng.

## **Thông tin một phiên khám cụ thể (làm theo VNeID)**

* Timeline các lần khám.  
* Thông tin cơ sở y tế và bác sĩ.  
* Kết quả khám, chẩn đoán, kết luận.  
* Đơn thuốc và thuốc đã sử dụng.  
* Kết quả xét nghiệm.  
* Hình ảnh/tài liệu y tế.  
* Thông tin dị ứng và cảnh báo y khoa quan trọng.

các thông tin cần bảo mật: 

\- bảo vệ bằng hash hoặc encrypt, masking: CCCD, sđt

\- bảo vệ bằng phân quyền truy cập: hồ sơ bệnh án 

# **7\. Kiến trúc phạm vi nên chốt cho đồ án**

MVP nên tập trung vào: Patient Portal \+ Doctor Portal \+ Hospital Portal \+ Medical Record \+ Appointment \+ Payment \+ Consent/Sharing \+ Audit Log. Hệ thống mô phỏng 2–3 cơ sở y tế để chứng minh việc chia sẻ hồ sơ liên bệnh viện.

Các tính năng như tích hợp trực tiếp với VNeID, kết nối hệ thống bệnh viện thật, bảo hiểm y tế, PACS/DICOM quy mô lớn hoặc AI chẩn đoán nên để ở phần hướng phát triển nếu nhóm chưa có điều kiện triển khai.

