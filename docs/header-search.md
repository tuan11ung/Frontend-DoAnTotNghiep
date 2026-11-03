# Tìm kiếm nhanh trên header

- Bấm ô **Tìm kiếm** (biểu tượng kính lúp trên điện thoại) để mở ô nhập và danh sách xem trước. Dùng được ở mọi trang có `PublicHeader`.
- Nhập ít nhất 2 ký tự; gửi truy vấn sau **300 ms** ngừng gõ. Không truy vấn trong khi đang ghép chữ bằng bộ gõ. Xóa ô nhập, đóng tìm kiếm hoặc đổi từ khóa sẽ hủy timer/request cũ; phản hồi cũ không ghi đè kết quả mới.
- Tìm kiếm không phân biệt hoa/thường hoặc dấu tiếng Việt; các từ trong truy vấn được kết hợp để lọc.
- Thứ tự nhóm: **Bài viết → Bệnh → Bệnh viện → Bác sĩ → BHYT & chính sách**. Trong mỗi nhóm, ưu tiên tiêu đề khớp chính xác, bắt đầu bằng từ khóa, rồi tới mô tả. Tối đa 5 gợi ý bài viết và 4 gợi ý mỗi nhóm khác, kèm tổng số kết quả phù hợp.
- Có trạng thái đang tìm, không có kết quả, lỗi và thử lại. Phím ↑/↓ chọn gợi ý, Enter mở gợi ý đang chọn (mặc định gợi ý đầu), Esc đóng và trả focus về nút mở. Có thể đóng bằng nút Đóng hoặc bấm ra ngoài.
- Bài viết và bệnh trên trang Tin tức mở trực tiếp qua `/news?article=<id>` hoặc `/news?dictionary=<id>`; các kết quả khác mở trang chi tiết hoặc nguồn bên ngoài. Nguồn bên ngoài có ký hiệu ↗ và mở tab mới.

`GET /api/search/suggestions?q=...` hiện tìm trên danh mục nội dung công khai có sẵn trong frontend (bài viết, từ điển bệnh, cơ sở, bác sĩ và chính sách), không cần backend. Không bao gồm hồ sơ hay kết quả khám cá nhân. Thay service `searchPublicCatalog` khi có API tìm kiếm thật; client gọi cùng origin và không phụ thuộc dữ liệu danh mục trong bundle header.
