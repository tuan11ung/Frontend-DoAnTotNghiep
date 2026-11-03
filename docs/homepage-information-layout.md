# Bố trí thông tin trên trang chủ

## Quyết định UI/UX

Giữ hai tab Đặt khám Bác sĩ và Đặt khám Bệnh viện cho cùng một tác vụ: đặt khám. Không thêm tab Thông tin chung vì sẽ trộn nội dung khám phá với thao tác đặt lịch và khiến người mới phải đổi tab mới nhận ra mạng lưới cơ sở.

Thứ tự trang chủ: banner/tìm kiếm → hai tab và nội dung đặt khám → giới thiệu bệnh viện trong hệ thống → thông tin hữu ích (bài viết + chính sách) → phần giới thiệu giá trị hiện có.

Section mạng lưới luôn hiển thị ở cả hai tab, lấy tên/địa chỉ từ danh mục tìm kiếm hiện có. Có ảnh lớn, chuyển cơ sở bằng nút trước/sau hoặc thumbnail; không tự xoay. Nút Xem thêm dẫn đúng tới `/search?type=hospital`. Ảnh là minh họa, không được trình bày như ảnh đã xác minh của từng bệnh viện. Danh mục vẫn là dữ liệu prototype, chưa có API xác định khả dụng thực tế.

Các minh họa SVG được lưu trong `public/images/home/` để không phụ thuộc máy chủ ảnh bên ngoài. Đây là hình minh họa giao diện, không phải ảnh thực tế của các bệnh viện được liệt kê.

Thanh hai tab có thêm liên kết nhảy nhanh Hệ thống bệnh viện và Cẩm nang & BHYT. Hai liên kết này cuộn tới section tương ứng, không tạo thêm trạng thái tab hoặc giấu phần đặt khám.

## Bài viết và chính sách

Gộp trong khu vực Thông tin hữu ích nhưng giữ hai nhóm nhận diện riêng:

- Cột chính: bài viết với bộ lọc Tất cả / Sức khỏe / Về MedConnect.
- Cột bên: BHYT & chính sách, luôn hiển thị khi đổi bộ lọc bài viết. Trên điện thoại, có liên kết nhảy thẳng đến nhóm chính sách.

Đây là bố cục phục vụ hai nhu cầu khác nhau: đọc nội dung khám phá và tra cứu thủ tục. Không đặt văn bản quy định lẫn với card tin sức khỏe hoặc giấu toàn bộ chính sách trong một tab nội dung.

Hai hướng dẫn nội bộ có trang đọc riêng: `/guides/bat-dau-dat-kham` và `/guides/theo-doi-ket-qua`. Bài sức khỏe mở nguồn gốc, nêu rõ nguồn/ngôn ngữ. Liên kết ngoài mở tab mới, liên kết nội bộ giữ luồng điều hướng của ứng dụng.

## Nguồn tham khảo trong giao diện

Liên kết được kiểm tra ngày 03/11/2026. Không tự tạo nội dung quy định hoặc tỷ lệ chi trả BHYT; người dùng mở văn bản gốc:

- [Hướng dẫn thủ tục BHYT trên cổng BHXH Việt Nam](https://baohiemxahoi.gov.vn/tintuc/Pages/linh-vuc-bao-hiem-y-te.aspx?CateID=169&ItemID=25292&OtItem=date).
- [Văn bản 51/2024/QH15 trên cổng văn bản Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=212479).
- [Bài viết sức khỏe/môi trường từ WHO Việt Nam](https://www.who.int/vietnam/vi/news/detail/12-10-2022-10-simple-actions-you-can-take-for-both-your-health-and-for-a-more-environmentally-friendly-future%21).
- [Tài liệu dinh dưỡng từ WHO](https://www.who.int/news-room/fact-sheets/detail/healthy-diet).

Chính sách đặt/hủy lịch phụ thuộc cơ sở, nên liên kết dẫn đến danh mục bệnh viện để người dùng chọn nơi khám thay vì công bố một chính sách chung chưa được xác nhận.

## Kiểm tra

Đã kiểm tra gallery chuyển trước/sau và thumbnail, nút Xem thêm đúng URL, giữ nguyên hai tab đặt khám, bộ lọc bài viết, nhóm chính sách luôn hiển thị, hai trang hướng dẫn và trang không tìm thấy. Giao diện không tràn ngang ở 320, 390, 768, 1024 và 1440 px. Toàn bộ minh họa mới tải được từ dự án, không có lỗi JavaScript.
