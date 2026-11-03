This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Hướng dẫn chạy:
1. `npm install`
2. `npm run dev` hoặc `pnpm dev`
3. Mở `http://localhost:3000` để xem giao diện sau khi khởi chạy

## Mô phỏng giao diện khách / đã đăng nhập

Chạy `pnpm dev`, mở trang chủ và dùng thanh **Xem thử giao diện** phía trên banner:

- **Khách**: ẩn Lịch khám, Kết quả khám và Hồ sơ gia đình.
- **Đã đăng nhập**: nhấn biểu tượng **Tài khoản** ở góc phải để mở ba mục cá nhân và nút **Thoát**.
- **Thoát** trong menu trở về giao diện khách; **Thoát mô phỏng** trên thanh xem thử khôi phục trạng thái đăng nhập thực tế.

Lựa chọn được lưu trong trình duyệt và giữ khi tải lại hoặc chuyển trang. Mô phỏng không tạo token, không gọi API đăng nhập/đăng xuất/thông báo và không thay đổi phiên đăng nhập thật. Đăng nhập thật sẽ tự kết thúc mô phỏng.

Thanh xem thử mặc định chỉ xuất hiện khi chạy development. Để bật trong bản demo production, đặt `NEXT_PUBLIC_ENABLE_AUTH_PREVIEW=true` trong `.env.local` **trước khi build**, rồi chạy `pnpm build` và `pnpm start`. Bỏ biến này và build lại khi không cần mô phỏng. Đây là mô phỏng hiển thị menu, không phải cơ chế phân quyền truy cập dữ liệu.

Khi chọn **Khách**, mọi đường dẫn đến `/booking` đều yêu cầu đăng nhập và giữ lựa chọn đặt khám trong `next`. Đăng nhập thành công hoặc đăng ký → xác thực OTP → đăng nhập tự động sẽ tiếp tục đặt khám. Chọn **Đã đăng nhập** để mở form đặt khám trong bản mô phỏng không cần backend. Xem [luồng đăng nhập và tiếp tục đặt khám](docs/booking-auth-continuation.md).

## Cổng lễ tân

Mở `/reception` để sử dụng giao diện lễ tân độc lập với bốn chức năng: tra cứu bệnh nhân, đăng ký khám, check-in lịch hẹn và check-out/thanh toán. Bản này dùng dữ liệu mô phỏng được lưu riêng trong trình duyệt; xem [hướng dẫn và các mã thử](docs/reception.md).

## Tìm kiếm nhanh trên header

Bấm ô tìm kiếm/kính lúp trên header để tra cứu bài viết, bệnh, bệnh viện, bác sĩ và chính sách. Bài viết được ưu tiên hiển thị; truy vấn gửi sau 300 ms ngừng gõ, hỗ trợ tiếng Việt không dấu và điều khiển bằng bàn phím. Danh mục hiện lấy từ dữ liệu công khai có sẵn trong dự án, không cần backend. Xem [hướng dẫn tìm kiếm nhanh](docs/header-search.md).

## Kết quả khám bệnh

Mở `/patient/results` để chọn thành viên và xem thẻ ca khám. Mỗi ca có các tab Tổng quan, Dịch vụ, Đơn thuốc và Viện phí. Dịch vụ chia nhóm mở/thu gọn, có bộ lọc và màn xem phiếu. Dùng ca `demo-20261101` để xem đủ ba trạng thái cùng mẫu phiếu CBC/AST chưa có số liệu y khoa; xem [hướng dẫn và đường dẫn thử](docs/patient-results.md).

## Quy tắc phát triển
- [Quy tắc phát triển module frontend](docs/frontend-module-guidelines.md)

Phần dưới là README.md tự động tạo
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
