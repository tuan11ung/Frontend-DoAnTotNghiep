# Luồng phân bệnh nhân vào phòng cận lâm sàng

Cập nhật ngày 22/11/2026 theo nghiệp vụ đã trao đổi. Tài liệu mô tả thiết kế mục tiêu; không đồng nghĩa toàn bộ chức năng đã được triển khai. Tiến độ hiện tại nằm ở mục 10.

## 1. Mục tiêu

Khi bác sĩ khám chính lưu chỉ định CLS, hệ thống tự chọn phòng thực hiện phù hợp và có tải thấp nhất. Bệnh nhân xem được danh sách chỉ định của mình, trạng thái từng dịch vụ, tên phòng và vị trí phòng để đến thực hiện.

Phân phòng không đồng nghĩa cấp số thứ tự (STT). Chỉ cấp STT khi bệnh nhân được xác nhận có mặt tại phòng CLS.

## 2. Nguyên tắc đã chốt

- Mọi phòng cùng loại đều thực hiện được toàn bộ dịch vụ thuộc loại đó.
- Dùng `service.room_type` đối chiếu `room.room_type` để xác định phòng phù hợp. Không dùng `room_service` trong thiết kế phân phòng mới.
- `service.room_type` là cấu hình loại phòng của dịch vụ, do admin thiết lập; hệ thống không tự suy đoán từ tên dịch vụ khi bác sĩ chỉ định.
- Phòng cụ thể được backend tự chọn khi bác sĩ lưu chỉ định; bác sĩ không phải nhập hoặc chọn phòng.
- Chỉ chọn phòng cùng cơ sở, đúng loại và đang hoạt động/đủ điều kiện tiếp nhận.
- Ưu tiên tải thấp nhất, không tính khoảng cách hoặc giảm di chuyển.
- Một lượt bệnh nhân tại một phòng có nhiều dịch vụ chỉ tính một đơn vị tải; các dịch vụ được tiếp nhận chung lượt dùng chung STT.
- Phòng xét nghiệm mặc định chính là nơi bệnh nhân đến nộp mẫu. Thông tin hiển thị thống nhất là tên phòng và vị trí phòng.
- Không có ưu tiên đặc biệt; thanh toán cuối lượt khám.
- Bỏ lượt tại CLS áp dụng tương tự cơ chế phòng khám hiện tại.

## 3. Phân biệt các dữ liệu

| Dữ liệu | Ý nghĩa | Người/hệ thống ghi |
|---|---|---|
| `service.room_type` | Loại phòng cần cho dịch vụ, ví dụ `XRAY` | Admin cấu hình khi thêm/sửa dịch vụ |
| `room.room_type` | Loại của một phòng cụ thể | Admin cấu hình phòng |
| Phòng được phân cho chỉ định | Phòng cụ thể bệnh nhân cần đến | Backend chọn và lưu khi tạo chỉ định |
| Lượt CLS tại phòng | Nhóm dịch vụ của một encounter được thực hiện chung một lượt tại phòng | Hệ thống quản lý để tính tải và dùng chung STT |
| STT | Số gọi của lượt tại phòng | Hệ thống cấp khi xác nhận có mặt |

Ví dụ: dịch vụ X-quang ngực có `room_type=XRAY`. Có hai phòng XRAY đang hoạt động. Hệ thống chọn X-quang 02, rồi lưu phòng đó cho chỉ định của bệnh nhân. Khi bệnh nhân xem danh sách, đọc lại phòng đã lưu, không tính chọn lại phòng.

Đề xuất lưu phòng vào `ordered_service.room_id`, FK đến `room.id`, giữ nguyên `service_id`. Nếu chọn thiết kế lưu phòng qua bảng lượt CLS thì phải bảo đảm truy xuất được phòng cụ thể từ chỉ định và không có dữ liệu mâu thuẫn. Cấu trúc bảng lượt CLS chưa được chốt cuối cùng.

## 4. Luồng chính từng bước

### Bước 1 — Cấu hình dịch vụ và phòng

1. Admin cấu hình loại cho từng phòng.
2. Admin cấu hình loại phòng thực hiện cho từng dịch vụ CLS.
3. Các giá trị CLS hiện BE hỗ trợ là `XRAY`, `ULTRASOUND`, `LAB`, `PROCEDURE`. MRI chưa có trong enum hiện tại; nếu bổ sung cần đồng bộ cấu hình phòng, dịch vụ và BE.
4. Dịch vụ hiện có nhưng chưa gán loại được coi là chưa cấu hình. Không tự động đoán hoặc gán hàng loạt theo tên dịch vụ.

### Bước 2 — Bác sĩ chọn và lưu chỉ định

1. Bác sĩ tìm dịch vụ trên màn hình khám bệnh, chọn dịch vụ và nhập ghi chú.
2. FE gửi `encounterId`, `serviceId`, `clinicalNote`; không gửi phòng muốn phân.
3. BE kiểm tra vai trò bác sĩ, đúng cơ sở, bác sĩ trùng `appointment.staff_id` thông qua `encounter.appointment_id`, encounter đang `IN_PROGRESS`, dịch vụ và danh mục còn hoạt động.
4. Không yêu cầu `in_room=true` khi tạo chỉ định. Việc bệnh nhân gặp bác sĩ là luồng nghiệp vụ, không bổ sung điều kiện này vào API.
5. Nếu dịch vụ chưa có loại phòng, trả lỗi có tên dịch vụ. Không tạo chỉ định thành công hoặc thay đổi trạng thái bệnh nhân ra khỏi phòng trong request thất bại.

### Bước 3 — Tìm các phòng phù hợp

Từ `service.room_type`, lấy các phòng thỏa mãn:

1. Thuộc cùng cơ sở với lượt khám và dịch vụ.
2. Có `room.room_type = service.room_type`.
3. Đang hoạt động.
4. Đáp ứng điều kiện nhận bệnh nếu có chức năng đóng/mở tiếp nhận CLS.

Hiện RoomEntity mới có `is_active`, chưa có trạng thái nhận bệnh CLS riêng. Đề xuất giai đoạn đầu dùng `is_active` để xác định phòng khả dụng; nếu cần nhận bệnh theo ca hoặc tạm ngừng nhận thì phải bổ sung thiết kế riêng.

Không có phòng phù hợp thì báo rõ: **“Dịch vụ [tên dịch vụ] chưa có phòng thực hiện phù hợp đang hoạt động tại cơ sở.”** Đây có thể là chưa có phòng đúng loại hoặc các phòng đều đã ngừng hoạt động; không phải thiếu cấu hình `room_service`.

### Bước 4 — Chọn phòng ít tải nhất

Tính tải cho từng phòng đủ điều kiện:

> Tải = số lượt đã phân nhưng chưa đến + số lượt đang chờ + số lượt đang thực hiện.

- Đếm theo lượt bệnh nhân tại phòng, không đếm số dòng chỉ định.
- Phòng chưa có lượt có tải bằng 0.
- Lượt đã hoàn tất phần thực hiện, chỉ còn chờ kết quả, không tính vào tải.
- Lượt đã hủy không tính vào tải. Bỏ lượt chưa hoàn tất vẫn cần được quản lý trong vòng đời lượt, không tự xóa chỉ định.
- Không loại lượt còn hiệu lực chỉ vì sang ngày mới nếu chưa có nghiệp vụ kết thúc lượt đó.
- Chọn tải thấp nhất. Khi bằng tải, đề xuất chọn `room_id` tăng dần; đây là chi tiết chưa được xác nhận riêng.
- Khi lưu nhiều dịch vụ liên tiếp, cập nhật tải/gộp lượt sau mỗi lần phân trước khi tính cho lần tiếp theo.

Ví dụ: Siêu âm 01 có tải 5, Siêu âm 02 có tải 3. Dịch vụ siêu âm tiếp theo được phân Siêu âm 02.

### Bước 5 — Lưu kết quả phân phòng

1. Ghi nhận lượt đã phân về phòng; có thể gộp các dịch vụ cùng encounter, cùng phòng trong một lượt chưa kết thúc theo quy tắc được chốt khi triển khai.
2. Lưu chỉ định gắn với phòng/lượt đó.
3. Trả thông tin chỉ định và phòng cho FE.
4. Chưa cấp STT.

Tìm phòng, tính tải, chọn phòng, ghi nhận lượt và lưu chỉ định phải có locking và nằm trong cùng transaction. Nếu một bước thất bại, rollback toàn bộ request để không tồn tại lượt hoặc chỉ định dở dang.

Ví dụ race condition: A có tải 2, B có tải 3. Nhiều request cùng đọc A=2 rồi cùng chọn A sẽ dồn bệnh nhân vào A. Phạm vi khóa phải điều phối được nhiều bệnh nhân và nhiều dịch vụ cùng sử dụng phòng; khóa theo encounter hiện tại không đủ. Đề xuất khóa transaction theo cơ sở ở giai đoạn đầu, đồng thời thống nhất thứ tự khóa và các luồng thay đổi tải/cấu hình để tránh deadlock hoặc quyết định theo dữ liệu cũ.

### Bước 6 — Bệnh nhân xem danh sách chỉ định

1. Bệnh nhân đăng nhập và chọn hồ sơ bản thân/người thân có quyền sử dụng.
2. API kiểm tra quyền hồ sơ và quyền đối với encounter nếu có lọc theo lượt khám.
3. Trả chỉ định của lượt khám đang diễn ra, không chỉ các dịch vụ đã hoàn thành.
4. Mỗi dịch vụ hiển thị tên, trạng thái thực hiện, tên phòng được phân và vị trí phòng.
5. Chỉ định cũ chưa có phòng hiển thị “Chưa phân phòng”; không tự suy đoán phòng lịch sử.
6. Nội dung kết quả chưa công bố vẫn được bảo vệ; quyền xem danh sách chỉ định không đồng nghĩa được đọc kết quả nháp.

Ví dụ response mục tiêu, chỉ mang tính minh họa:

```json
{
  "id": 123,
  "encounterId": 456,
  "serviceId": 20,
  "serviceName": "X-quang ngực",
  "status": "ORDERED",
  "statusLabel": "Chưa thực hiện",
  "roomId": 12,
  "roomName": "X-quang 02",
  "roomLocation": "Tầng 1, khu B"
}
```

### Bước 7 — Đến phòng, xác nhận có mặt và nhận STT

1. Bệnh nhân đến đúng phòng đã được phân.
2. Thực hiện xác nhận có mặt; chỉ lúc này mới cấp STT.
3. Các dịch vụ cùng phòng được tiếp nhận chung một lượt dùng chung một STT, hiển thị một dòng hàng chờ.
4. Xác nhận lặp phải trả lại lượt/STT hiện có, không cấp thêm số.

Phương án đang cân nhắc: bệnh nhân tự quét QR trước cửa phòng, đăng nhập/chọn hồ sơ, xác nhận có mặt. Các lựa chọn khác là nhân viên duyệt hoặc nhân viên quét QR bệnh nhân. Chưa chốt cuối cùng cách check-in. QR tĩnh nhận diện phòng nhưng có thể được chụp và chia sẻ, không tự chứng minh bệnh nhân có mặt.

### Bước 8 — Thực hiện, trả kết quả và quay lại bác sĩ

1. Nhân viên/kỹ thuật viên gọi và bắt đầu dịch vụ.
2. Theo dõi trạng thái riêng từng dịch vụ trong lượt.
3. Khi mọi dịch vụ của lượt đã thực hiện xong hoặc hủy, kết thúc phần thực hiện của lượt và giảm tải phòng, dù còn chờ kết quả.
4. Công bố kết quả để bệnh nhân và bác sĩ xem.
5. Bệnh nhân quay lại bác sĩ khám chính; nếu được chỉ định thêm sau khi lượt CLS cũ kết thúc, tạo đợt/lượt mới, phân phòng lại và cấp STT mới khi đến phòng.
6. Thanh toán cuối lượt khám.

## 5. Gộp dịch vụ trong một lượt

Ví dụ một bệnh nhân có ba chỉ định:

| Dịch vụ | Phòng được phân | Lượt tại phòng |
|---|---|---|
| Siêu âm bụng | Siêu âm 01 | Lượt A |
| Siêu âm tuyến giáp | Siêu âm 01 | Lượt A, nếu tiếp nhận chung |
| X-quang ngực | X-quang 02 | Lượt B |

Lượt A tính một đơn vị tải và dùng một STT. Lượt B tính một đơn vị tải tại phòng X-quang và có STT riêng sau khi check-in tại đó. Ví dụ minh họa việc gộp khi đã phân cùng phòng, không có nghĩa hệ thống ưu tiên gộp về một phòng thay cho quy tắc tải thấp nhất.

Bảng quản lý lượt được đề xuất để lưu vòng đời chung và liên kết nhiều chỉ định. Tên `paraclinical_visit`/`cls_room_visit` và cấu trúc vật lý còn cần chốt. Đây không phải bảng cấu hình khả năng thực hiện dịch vụ.

## 6. Trạng thái dịch vụ mục tiêu

| Nhãn | Ý nghĩa |
|---|---|
| Chưa thực hiện | Đã chỉ định/phân phòng, chưa tiếp nhận |
| Chờ thực hiện | Đã xác nhận có mặt và nhận STT |
| Đang thực hiện | Đang làm dịch vụ |
| Chờ kết quả | Đã hoàn tất phần thực hiện/nộp mẫu, đang xử lý kết quả |
| Đã có kết quả | Kết quả đã công bố |
| Đã hủy | Dịch vụ không tiếp tục thực hiện |

Trạng thái lượt/hàng chờ cần tách khỏi trạng thái từng dịch vụ. Ví dụ một dịch vụ đã chờ kết quả trong khi dịch vụ khác cùng lượt còn đang thực hiện thì lượt vẫn đang được phục vụ.

BE hiện chỉ có `ORDERED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`. Muốn tính tải chính xác đến lúc hoàn tất thực hiện thay vì đến lúc công bố kết quả, cần thêm dấu mốc hoặc trạng thái hoàn tất thực hiện; chưa có phần này.

## 7. Bỏ lượt và quay lại

- Gọi không thấy bệnh nhân: đánh dấu bỏ lượt, tiếp tục gọi người khác.
- Giữ STT cũ, thay đổi vị trí phục vụ.
- Khi bệnh nhân quay lại, cần xác nhận có mặt lại.
- Áp dụng quy tắc phòng khám hiện tại: thông thường hai lượt bình thường rồi xen một lượt bỏ lỡ đã quay lại, kèm điều kiện trì hoãn của lượt đó.
- Bộ đếm tăng khi bắt đầu phục vụ lượt bình thường, không tăng do tải lại màn hình.
- Không còn lượt thường sẵn sàng thì có thể gọi lượt quay lại ngay; nhiều lượt quay lại xét theo thời điểm xác nhận quay lại.
- Cách xác nhận quay lại bằng QR hay nhân viên thao tác phụ thuộc phương án check-in cuối cùng, không thay đổi nguyên tắc giữ số và xen lượt.

## 8. Sequence diagram — Phân phòng và xem chỉ định

```mermaid
sequenceDiagram
    autonumber
    actor BS as Bác sĩ khám chính
    participant FE as Giao diện bác sĩ
    participant BE as Backend
    participant DB as Cơ sở dữ liệu
    actor BN as Bệnh nhân

    BS->>FE: Chọn dịch vụ, lưu chỉ định
    FE->>BE: encounterId, serviceId, clinicalNote
    BE->>BE: Kiểm tra bác sĩ, cơ sở, encounter và dịch vụ
    alt Dịch vụ chưa cấu hình room_type
        BE-->>FE: Báo lỗi có tên dịch vụ
    else Có loại phòng hợp lệ
        BE->>DB: Lấy khóa phân phòng trong transaction
        BE->>DB: Tìm phòng cùng cơ sở, đúng loại, đang hoạt động
        alt Không có phòng phù hợp
            BE->>DB: Rollback transaction
            BE-->>FE: Báo không có phòng phù hợp đang hoạt động
        else Có phòng phù hợp
            BE->>DB: Tính tải theo lượt, chọn phòng tải thấp nhất
            BE->>DB: Ghi nhận hoặc gộp lượt và lưu chỉ định kèm phòng
            BE->>DB: Commit, giải phóng khóa
            BE-->>FE: Chỉ định và thông tin phòng được phân
        end
    end
    BN->>BE: Xem danh sách chỉ định theo hồ sơ/lượt khám
    BE->>BE: Kiểm tra quyền hồ sơ và lượt khám
    BE->>DB: Đọc chỉ định và phòng đã lưu
    DB-->>BE: Dịch vụ, trạng thái, tên phòng, vị trí
    BE-->>BN: Danh sách CLS kèm nơi thực hiện
    Note over BN,DB: Bệnh nhân đến phòng; xác nhận có mặt mới cấp STT
```

## 9. Các điểm còn cần chốt khi triển khai

1. Cấu trúc bảng quản lý lượt CLS và điều kiện gộp lượt trong từng giai đoạn tiếp nhận.
2. Quy tắc phá hòa khi tải bằng nhau: đề xuất `room_id` tăng dần.
3. Phòng nhận bệnh: chỉ dùng `is_active` ở giai đoạn đầu hay bổ sung trạng thái tiếp nhận riêng.
4. Phương án xác nhận có mặt: QR tĩnh, QR đổi theo thời gian hoặc có nhân viên xác nhận; cách xác nhận quay lại sau bỏ lượt.
5. Phạm vi STT: đề xuất tăng theo phòng/ngày; chưa chốt riêng.
6. Nếu bổ sung API lưu nhiều dịch vụ một lần: cần chốt rollback toàn bộ hay lưu từng dịch vụ hợp lệ khi một dịch vụ không có phòng. FE hiện gửi từng dịch vụ một request.
7. Cách chuyển phòng khi phòng đã phân ngừng hoạt động; không tự phân lại chỉ do bệnh nhân mở danh sách.

## 10. Tiến độ mã nguồn tại thời điểm lập tài liệu

| Hạng mục | Hiện trạng |
|---|---|
| Bác sĩ tìm và lưu chỉ định | Đã có |
| Entity, request, response, mapper cho `service.room_type` | Đã làm ở BE |
| Kiểm tra loại CLS hợp lệ khi thêm/sửa dịch vụ | Đã làm ở BE |
| Báo lỗi khi tạo chỉ định mà dịch vụ chưa có loại | Đã làm ở BE |
| Tìm phòng theo loại, tính tải, locking phân phòng | Chưa làm |
| Lưu phòng cụ thể trên chỉ định/lượt CLS | Chưa làm |
| API chỉ định trả tên và vị trí phòng | Chưa làm |
| API bệnh nhân xem các chỉ định chưa hoàn thành | Chưa làm; hiện chỉ trả `COMPLETED` |
| Truy cập ca khám đang diễn ra phía bệnh nhân | Luồng lịch sử hiện chỉ trả ca hoàn tất; cần bổ sung đường truy cập phù hợp |
| FE danh sách CLS và nhãn trạng thái | Đã có nền giao diện, chưa nối đủ dữ liệu |
| FE tên và vị trí phòng thực tế | Chưa làm; đang là hướng dẫn chung |
| Tách trạng thái chờ thực hiện/chờ kết quả | Chưa làm |

Các nội dung này là kiểm tra mã nguồn, không xác nhận dữ liệu cấu hình hoặc migration trên DB đang chạy. Người dùng đã chọn tự quản lý cột `service.room_type` trong DB, không sử dụng migration V42 đã đề xuất trước đó.
