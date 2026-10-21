# Quy tắc phát triển module frontend

Tài liệu này áp dụng cho các module mới và mọi thay đổi lớn trong `Frontend-DoAnTotNghiep`. Mục tiêu là giữ mỗi module dễ tìm, dễ kiểm thử, dùng lại được và không tạo thêm bản sao của logic hoặc giao diện đã có.

## 1. Nguyên tắc chung

- Ưu tiên sửa hoặc mở rộng abstraction hiện có trước khi tạo abstraction mới.
- Chỉ dùng chung component hoặc helper khi có ít nhất hai nơi sử dụng thực sự giống nhau; không tạo framework tổng quát cho một trường hợp đơn lẻ.
- Mỗi component có một trách nhiệm rõ ràng. Tách component khi phần UI có hành vi, trạng thái hoặc khả năng tái sử dụng riêng.
- Không đưa thay đổi ngoài phạm vi module vào cùng một PR nếu không cần thiết.
- Giữ API component và kiểu dữ liệu rõ ràng; tránh `any`, ép kiểu không có căn cứ và dữ liệu giả trong luồng production.

## 2. Cấu trúc thư mục

Route Next.js chỉ đảm nhiệm ghép trang và metadata. UI, logic và API theo nghiệp vụ đặt trong feature tương ứng.

```text
src/
  app/
    patient/
      login/
        page.tsx                 # Route, metadata, ghép layout và feature
    api/
      auth/
        login/
          route.ts               # Proxy API server-side nếu cần
  features/
    auth/
      login/
        LoginScreen.tsx          # Bố cục của màn hình
        LoginForm.tsx            # Form và tương tác riêng
        login.types.ts           # Kiểu dữ liệu chỉ dùng trong feature
      auth-storage.ts            # Tiện ích auth dùng chung trong feature
    home/
      components/
  layouts/                       # Header, footer và khung trang dùng chung
  styles/
    globals.css                 # Theme và quy tắc toàn cục
  types/                         # Kiểu dùng chung giữa nhiều feature
```

- `app/`: cấu hình route, metadata và composition; không đặt toàn bộ nghiệp vụ vào `page.tsx`.
- `features/<module>/`: components, hooks, API và types thuộc một nghiệp vụ.
- `layouts/`: cấu trúc dùng chung nhiều route; không chứa logic nghiệp vụ riêng của một màn hình.
- `types/`: chỉ dành cho kiểu thực sự dùng chung. Kiểu riêng của module đặt trong module đó.
- `styles/`: token và style toàn cục; style riêng của component ưu tiên Tailwind theo convention hiện tại.
- Tên component/file React dùng PascalCase. Hook bắt đầu bằng `use`. File helper, API và type không phải component dùng kebab-case hoặc tên hiện có trong thư mục đó.

## 3. Component và ranh giới client/server

- Dùng Server Component mặc định. Chỉ thêm `'use client'` tại component cần state, event handler, browser API hoặc custom hook.
- Giữ vùng Client Component nhỏ, thường là form, menu hoặc control tương tác; không đánh dấu cả page/layout là client nếu không cần.
- Component nhận dữ liệu phụ thuộc bên ngoài qua props hoặc service rõ ràng; không tự đọc dữ liệu global trong nhiều nơi.
- Trạng thái form thuộc form. Trạng thái menu thuộc menu. Chỉ nâng state lên component cha khi nhiều thành phần cần phối hợp.
- Không truyền prop chỉ để chuyển tiếp qua nhiều tầng nếu có thể đặt component tại đúng ranh giới sở hữu dữ liệu.
- Tránh component quá lớn chứa đồng thời markup, gọi API, chuẩn hóa dữ liệu và nhiều luồng trạng thái. Tách theo trách nhiệm, không tách mỗi vài dòng JSX thành component riêng.

## 4. API và dữ liệu

- Khai báo request/response types gần feature sử dụng; dùng kiểu shared khi nhiều feature cùng tiêu thụ cùng contract.
- Tách gọi API khỏi JSX. Dùng service của feature cho request; component chỉ quản lý trạng thái hiển thị và gọi service.
- Dùng Next.js Route Handler `/api/...` làm proxy cùng origin tới backend theo convention hiện tại. URL backend lấy từ `BACKEND_API_URL`; không hard-code URL backend trong component.
- Không gọi backend trực tiếp từ component bằng URL `localhost`, không đặt secret hoặc credential trong biến `NEXT_PUBLIC_*`.
- Mọi request phải xử lý loading, thành công, lỗi HTTP, lỗi mạng và response không đúng định dạng. Không mặc định mọi response lỗi đều có JSON hợp lệ.
- Không ghi token, mật khẩu, số điện thoại hoặc dữ liệu sức khỏe ra console/log phía client.
- Dùng helper auth hiện có để đọc/ghi/xóa phiên và token; không khai báo lại storage key hoặc tự parse token ở từng feature.
- Không nhân bản các quy tắc xác thực hoặc chuẩn hóa dữ liệu backend ở nhiều component. Nếu cần chuẩn hóa, đặt tại service/helper có chủ sở hữu rõ ràng.

## 5. Trạng thái và biểu mẫu

- Màn hình có dữ liệu bất đồng bộ cần trạng thái loading, empty, error và success phù hợp.
- Dùng label gắn với input qua `htmlFor`/`id`; khai báo `name`, `autoComplete`, `required` và input mode phù hợp.
- Nút submit phải có `type="submit"`; nút thao tác khác trong form phải có `type="button"`.
- Khi submit, ngăn gửi lặp, khóa nút phù hợp và thông báo lỗi gắn với trường hoặc form.
- Lỗi đăng nhập không làm mất các trường không liên quan tới lỗi; không hiển thị thông tin kỹ thuật hoặc thông tin nhạy cảm từ backend.
- Tương tác quan trọng phải dùng được bằng bàn phím và có trạng thái focus dễ nhận biết.

## 6. UI và styling

- Tái sử dụng `PublicHeader`, `PublicFooter`, `PublicLayout`, icons từ `lucide-react` và pattern của feature hiện có khi phù hợp.
- Dùng Tailwind và token trong `globals.css`; không nạp Tailwind CDN, thêm inline style tùy tiện hoặc tạo lại theme riêng cho từng module.
- Tất cả thẻ `<button>` tuân theo radius 8px đã định nghĩa toàn cục. CTA dạng link dùng radius tương ứng; không đổi radius của card, input, avatar hoặc thành phần trang trí theo quy tắc button.
- Giữ typography, màu sắc và trạng thái hover/focus đồng nhất; không tạo các biến thể gần giống chỉ vì một màn hình.
- Thiết kế phải hoạt động ở mobile và desktop. Kiểm tra không tràn ngang, đè chữ, hoặc làm thay đổi kích thước control khi hover/focus/loading.
- Dùng semantic HTML và accessible name cho icon button; không dùng icon không có nhãn truy cập.

## 7. Đặt tên và import

- Đặt tên theo nghiệp vụ, không dùng tên chung chung như `Data`, `Manager`, `Common` nếu vai trò không rõ.
- Export named components theo convention hiện tại; page route dùng default export theo Next.js.
- Dùng alias import `@/src/...` theo cấu hình dự án. Import tương đối chỉ dùng cho các file gần nhau trong cùng module khi giúp dependency rõ hơn.
- Không tạo barrel `index.ts` chỉ để rút ngắn import nếu nó làm dependency khó theo dõi hoặc tạo vòng import.

## 8. Checklist trước khi merge

- Route chỉ ghép page/layout; nghiệp vụ nằm trong feature sở hữu nó.
- Không có component, API call, type hoặc helper bị nhân bản khi đã có abstraction phù hợp.
- Loading, empty, success, lỗi mạng và lỗi backend đã được xem xét.
- Form và controls có label, semantic type, keyboard/focus behavior.
- Giao diện đã được kiểm tra ở ít nhất một viewport mobile và desktop.
- Không đưa secret hoặc dữ liệu nhạy cảm vào client bundle, console hay screenshot test.
- Chạy `npm run lint` và `npx tsc --noEmit`; kiểm tra luồng UI liên quan bằng test hoặc browser khi có thể.
- Nếu thay đổi contract API, cập nhật types và tài liệu/API mock liên quan cùng PR.

## 9. Hướng dẫn Next.js

Next.js trong dự án có thể khác tài liệu hoặc ví dụ cũ. Trước khi dùng API, file convention hoặc cấu hình mới, đọc tài liệu tương ứng trong `node_modules/next/dist/docs/` theo yêu cầu trong `AGENTS.md`.