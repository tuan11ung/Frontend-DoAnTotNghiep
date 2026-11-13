# Cấu trúc màn đặt khám

Chỉ có một file trang trong feature: `src/features/booking/BookingPage.tsx`. Route `src/app/booking/page.tsx` tiếp tục dùng file này bên trong `BookingAuthGate` và `Suspense`.

```text
features/booking/
├── BookingPage.tsx
├── BookingScreen.tsx               # Re-export tương thích, không có luồng riêng
├── hooks/
│   ├── useBhytBooking.ts
│   └── useDemandBooking.ts
├── components/                    # Các bước và component dùng chung
├── workflow/                      # Modal và bộ chọn
└── utils/booking-dates.ts          # Ngày hiện tại theo Việt Nam, hạn đặt trước
```

`BhytBookingPage.tsx` đã được loại bỏ. `BookingPage` chọn phần giao diện theo `mode` trên URL: `bhyt` hoặc mặc định khám theo yêu cầu. Hai component nội bộ `BhytBookingFlow` và `DemandBookingFlow` chỉ dựng giao diện, không phải hai trang/route mới. Chỉ component đang hoạt động được mount để hook của chế độ kia không tải dữ liệu hoặc tạo lịch. Không gọi hook có điều kiện.

## Phân chia trách nhiệm

- `useBhytBooking`: tải hồ sơ/cơ sở/chuyên khoa/khung giờ qua `bookingApi`; quản lý các lựa chọn, phạm vi ngày, trạng thái tải/lỗi và gửi lịch BHYT. Giữ `AbortController`, khóa gửi trùng bằng ref và quay lại chọn khung giờ khi API báo hết chỗ. Chọn Không rõ gửi `specialtyId: null` để chờ phân chuyên khoa.
- `useDemandBooking`: khởi tạo và đồng bộ URL, chọn hồ sơ, cơ sở/chuyên khoa/trình độ, ngày giờ, lý do khám và lưu lịch mô phỏng. Tải hồ sơ qua API như trước; dữ liệu bác sĩ/cơ sở/lịch và thao tác lưu lịch vẫn là mock/localStorage.
- `BookingPage`: ghép component từng bước, hiển thị tải/lỗi/thành công và nối các callback từ hook. Các component `BookingStepper`, `BookingTargetSelector`, `BookingStep1Mode`, `BookingStep2` tiếp tục dùng chung.
- `booking-dates`: giữ nguyên phép tính ngày theo `Asia/Ho_Chi_Minh` và hạn đặt trước; không dùng chuỗi DD/MM/YYYY cho tham số ngày API.

Refactor giữ nguyên URL, bước mặc định, hành vi chuyển chế độ, đi tiếp/quay lại, dữ liệu request, xử lý kết quả và cách lưu của từng luồng. Không chuyển luồng khám theo yêu cầu sang API tạo lịch BHYT hoặc thay luồng API thật bằng lưu localStorage. Những dữ liệu mock/ngày mẫu đã có của luồng theo yêu cầu không được thay đổi trong tác vụ này.

## Xác nhận

- ESLint cho các file thay đổi, TypeScript và kiểm tra diff.
- Trình duyệt với API giả lập: BHYT chọn cơ sở/chuyên khoa/ngày/khung giờ, lý do khám, payload tạo lịch, lỗi hết chỗ và chọn lại, gửi trùng, thành công, đặt lịch khác, Không rõ chuyên khoa.
- Khám theo yêu cầu: deep link có cơ sở/chuyên khoa/trình độ, chọn lịch, xác nhận và lưu localStorage; không có request BHYT từ hook không hoạt động.
- Chuyển chế độ và hiển thị trên 320–768px. Kiểm tra dùng mock API, không tạo lịch thật trên backend.
