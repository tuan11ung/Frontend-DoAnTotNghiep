# Từ điển dữ liệu — Hệ thống quản lý hồ sơ khám chữa bệnh liên thông

## Ánh xạ luồng → bảng

| Luồng | Bảng |
|---|---|
| I. Đăng ký khám trực tiếp | patient, encounter, queue_ticket, service, service_price, notification |
| II. Đặt lịch online · 8.2 Đặt cho người nhà | appointment, time_slot, work_schedule, patient_guardian, service_price |
| III. Lễ tân tiếp nhận (check-in QR) | appointment, encounter, queue_ticket, notification |
| IV. Khám lâm sàng – CLS | clinical_exam, service_order, service_order_item, lab_result_value, medical_attachment, encounter_diagnosis, prescription, prescription_item, clinical_alert |
| V. Thanh toán | invoice, invoice_item, payment_transaction, patient_policy, policy_category |
| 5.1–5.4 Lập lịch làm việc | schedule_template, work_schedule, time_slot, staff_leave, hospital_holiday, schedule_change_log |
| 7.1–7.2 Đăng ký, đăng nhập, quên mật khẩu | account, account_role, verification_token, patient |
| 7.3 Trang chủ · 7.4 / 8.6 Chatbot | article, chat_session, chat_message |
| 7.5 Hồ sơ cá nhân | patient, patient_allergy, patient_condition, emergency_contact, patient_policy |
| 8.1 / 8.3 Danh sách & hủy lịch | appointment, time_slot, payment_transaction (REFUND) |
| 8.4 / 9.1 / 9.2 Hàng chờ, gọi, vắng mặt | queue_ticket, room.door_qr_token, notification |
| 8.5 Đánh giá hiệu quả điều trị | encounter_feedback, patient_allergy (source = FEEDBACK) |
| 9.3 / 9.4 / 12.1 Xem hồ sơ, mở / đóng quyền | record_access_grant, record_view_log, system_log, notification, system_config |
| 9.5 / 10.1 / 10.2 Phiên đáng chú ý | notable_case, system_log |
| 11.1 / 11.2 Quản lý & phát thuốc | hospital_medicine, medicine_batch, stock_receipt, stock_receipt_item, dispense, dispense_item, medicine, medicine_allergen |
| 13.1–13.5 Admin cơ sở | hospital, hospital_holiday, department, specialty, room, staff, account_role, service, service_price |
| 14.1–14.4 Super Admin | hospital, account, account_role, system_config, system_log |

Tổng cộng **60 bảng**. Phạm vi: GLOBAL = dùng chung toàn hệ thống; TENANT = thuộc 1 cơ sở y tế; PATIENT = thuộc bệnh nhân, dùng chung liên viện.

## M1 – Cơ sở y tế, tài khoản & nhân sự

### `hospital` — Cơ sở y tế (tenant)  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| code | VARCHAR(20) | NOT NULL; UNIQUE | Mã cơ sở, không sửa sau khi tạo (14.1) |
| name | VARCHAR(200) | NOT NULL | Tên cơ sở |
| level | VARCHAR(20) | NOT NULL; ∈ {CENTRAL, PROVINCIAL, DISTRICT, PRIVATE} | Tuyến: trung ương / tỉnh / huyện / tư nhân (14.1) |
| province | VARCHAR(100) |  | Tỉnh / thành (14.1) |
| address | VARCHAR(300) |  | Địa chỉ |
| hotline | VARCHAR(20) |  | Hotline |
| email | VARCHAR(100) |  | Email |
| license_no | VARCHAR(50) | UNIQUE | Số giấy phép, không trùng (14.1) |
| logo_url | VARCHAR(500) |  | Logo, tối đa 2MB (13.1) |
| introduction | TEXT |  | Bài giới thiệu (13.1) |
| morning_start | TIME | NOT NULL; DEFAULT '07:00' | Buổi sáng từ (13.1, dùng cho lịch 5.x) |
| morning_end | TIME | NOT NULL; DEFAULT '11:30' | Buổi sáng đến |
| afternoon_start | TIME | NOT NULL; DEFAULT '13:30' | Buổi chiều từ |
| afternoon_end | TIME | NOT NULL; DEFAULT '17:00' | Buổi chiều đến |
| working_days | VARCHAR(20) | NOT NULL; DEFAULT '1,2,3,4,5,6' | Ngày làm việc trong tuần (1 = Thứ 2 … 7 = Chủ nhật) |
| slot_minutes | INT | NOT NULL; DEFAULT 30 | Thời lượng 1 khung giờ mặc định khi phòng không khai riêng |
| booking_weeks_ahead | INT | NOT NULL; DEFAULT 4 | Số tuần mở đặt lịch (13.1, 5.2) |
| cancel_before_hours | INT | NOT NULL; DEFAULT 24 | Hủy trước tối thiểu N giờ (13.1, 8.3) |
| refund_percent | NUMERIC(5,2) | NOT NULL; DEFAULT 100 | Tỷ lệ hoàn tiền khi hủy đúng hạn (13.1) |
| policy_text | TEXT |  | Văn bản chính sách đặt / hủy lịch hiển thị cho BN (7.3) |
| status | VARCHAR(20) | NOT NULL; DEFAULT 'ACTIVE'; ∈ {ACTIVE, SUSPENDED} | Đang hoạt động / tạm dừng (14.1) |
| suspend_reason | VARCHAR(300) |  | Lý do tạm dừng (14.1 LP1) |
| joined_at | DATE | NOT NULL; DEFAULT CURRENT_DATE | Ngày tham gia nền tảng |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |
| updated_at | TIMESTAMPTZ |  | Thời điểm cập nhật gần nhất |

CHECK: `morning_end > morning_start AND afternoon_start >= morning_end AND afternoon_end > afternoon_start`; `booking_weeks_ahead BETWEEN 1 AND 12`

### `hospital_holiday` — Ngày nghỉ lễ của cơ sở  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| hospital_id | BIGINT | FK → hospital.id; NOT NULL | Cơ sở |
| holiday_date | DATE | NOT NULL | Ngày nghỉ (13.1; 5.2 bỏ qua ngày này) |
| name | VARCHAR(100) |  | Tên ngày nghỉ (Quốc khánh…) |

UNIQUE ghép: (hospital_id, holiday_date)

### `department` — Khoa  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| hospital_id | BIGINT | FK → hospital.id; NOT NULL | Cơ sở |
| code | VARCHAR(20) | NOT NULL | Mã khoa, duy nhất trong cơ sở (13.2) |
| name | VARCHAR(150) | NOT NULL | Tên khoa |
| type | VARCHAR(20) | NOT NULL; ∈ {CLINICAL, PARACLINICAL, EMERGENCY, ADMINISTRATIVE} | Lâm sàng / cận lâm sàng / cấp cứu / hành chính |
| description | TEXT |  | Mô tả |
| head_staff_id | BIGINT | FK → staff.id | Trưởng khoa (13.3) |
| is_active | BOOLEAN | NOT NULL; DEFAULT true | Hoạt động / ngừng (13.2 LP2) |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |
| updated_at | TIMESTAMPTZ |  | Thời điểm cập nhật gần nhất |

UNIQUE ghép: (hospital_id, code)

### `specialty` — Chuyên khoa  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| hospital_id | BIGINT | FK → hospital.id; NOT NULL | Cơ sở |
| department_id | BIGINT | FK → department.id; NOT NULL | Thuộc khoa (Khoa → Chuyên khoa → Phòng) |
| code | VARCHAR(20) | NOT NULL | Mã chuyên khoa |
| name | VARCHAR(150) | NOT NULL | Tên (Tim mạch thuộc Khoa Nội…) |
| description | TEXT |  | Mô tả |
| responsible_staff_id | BIGINT | FK → staff.id | Bác sĩ phụ trách (13.3) |
| is_active | BOOLEAN | NOT NULL; DEFAULT true | Hoạt động / ngừng |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |
| updated_at | TIMESTAMPTZ |  | Thời điểm cập nhật gần nhất |

UNIQUE ghép: (hospital_id, code)

### `room` — Phòng  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| hospital_id | BIGINT | FK → hospital.id; NOT NULL | Cơ sở |
| department_id | BIGINT | FK → department.id; NOT NULL | Khoa |
| specialty_id | BIGINT | FK → specialty.id | Chuyên khoa |
| code | VARCHAR(20) | NOT NULL | Mã / số phòng |
| name | VARCHAR(150) | NOT NULL | Tên phòng |
| room_type | VARCHAR(20) | NOT NULL; ∈ {EXAM, XRAY, ULTRASOUND, LAB, PROCEDURE, RECEPTION, CASHIER, PHARMACY} | Loại phòng (13.2) |
| building | VARCHAR(50) |  | Tòa |
| floor | VARCHAR(10) |  | Tầng |
| max_patients_per_slot | INT | NOT NULL; DEFAULT 5 | Số BN tối đa / khung giờ (13.2; 5.2 sinh khung giờ) |
| slot_minutes | INT |  | Thời lượng 1 khung giờ; NULL = lấy mặc định của cơ sở (13.2 LP1) |
| responsible_staff_id | BIGINT | FK → staff.id | Bác sĩ phụ trách phòng (13.3) |
| door_qr_token | VARCHAR(100) | UNIQUE | Mã QR dán ở cửa phòng để BN báo có mặt (8.4, 9.2 LP2) |
| is_active | BOOLEAN | NOT NULL; DEFAULT true | Hoạt động / ngừng |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |
| updated_at | TIMESTAMPTZ |  | Thời điểm cập nhật gần nhất |

UNIQUE ghép: (hospital_id, code)

### `account` — Tài khoản đăng nhập  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| email | VARCHAR(100) | UNIQUE | Email đăng nhập (7.2) |
| phone | VARCHAR(20) | UNIQUE | SĐT đăng nhập (7.2: đăng nhập bằng email/sđt) |
| password_hash | VARCHAR(255) |  | Mật khẩu đã băm; NULL khi nhân viên chưa kích hoạt (13.4) |
| status | VARCHAR(20) | NOT NULL; DEFAULT 'PENDING'; ∈ {PENDING, ACTIVE, LOCKED, DISABLED} | Chờ xác thực / hoạt động / khóa / vô hiệu hóa |
| avatar_url | VARCHAR(500) |  | Ảnh đại diện (7.5) |
| email_verified_at | TIMESTAMPTZ |  | Xác thực email bằng OTP (7.1) |
| failed_login_count | INT | NOT NULL; DEFAULT 0 | Số lần sai mật khẩu liên tiếp (7.2 LP1, tùy chọn) |
| locked_until | TIMESTAMPTZ |  | Khóa tạm đến (7.2 LP1) |
| last_login_at | TIMESTAMPTZ |  | Lần đăng nhập cuối (14.2) |
| token_version | INT | NOT NULL; DEFAULT 0 | Tăng lên để đăng xuất mọi phiên cũ (7.2 LP3, 14.2) |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |
| updated_at | TIMESTAMPTZ |  | Thời điểm cập nhật gần nhất |

CHECK: `email IS NOT NULL OR phone IS NOT NULL`

### `role` — Vai trò  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| code | VARCHAR(30) | NOT NULL; UNIQUE | PATIENT, RECEPTIONIST, DOCTOR, CLS_TECHNICIAN, PHARMACIST, HOSPITAL_LEADER, DEPARTMENT_HEAD, HOSPITAL_ADMIN, SUPER_ADMIN |
| name | VARCHAR(100) | NOT NULL | Tên hiển thị |

### `account_role` — Vai trò của tài khoản theo phạm vi  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| account_id | BIGINT | FK → account.id; NOT NULL | Tài khoản |
| role_id | BIGINT | FK → role.id; NOT NULL | Vai trò |
| hospital_id | BIGINT | FK → hospital.id | Phạm vi cơ sở (NULL với bệnh nhân, Super Admin) |
| department_id | BIGINT | FK → department.id | Phạm vi khoa (với trưởng khoa, 13.3) |
| granted_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm cấp |
| revoked_at | TIMESTAMPTZ |  | Thời điểm thu hồi (13.3, 14.2 LP1) |

### `verification_token` — Mã OTP / link xác thực  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| account_id | BIGINT | FK → account.id; NOT NULL | Tài khoản |
| purpose | VARCHAR(20) | NOT NULL; ∈ {VERIFY_EMAIL, RESET_PASSWORD, ACTIVATE_STAFF} | OTP đăng ký (7.1) / quên mật khẩu (7.2 LP3) / link kích hoạt nhân viên 24 giờ (13.4) |
| code_hash | VARCHAR(255) | NOT NULL | Mã đã băm |
| expires_at | TIMESTAMPTZ | NOT NULL | Hết hạn (OTP 5 phút, link 24 giờ) |
| attempt_count | INT | NOT NULL; DEFAULT 0 | Số lần nhập sai (tối đa 5) |
| used_at | TIMESTAMPTZ |  | Đã dùng lúc |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

### `qualification_level` — Danh mục trình độ bác sĩ  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| code | VARCHAR(20) | NOT NULL; UNIQUE | BS, THS, CKI, CKII, PGS, GS |
| name | VARCHAR(100) | NOT NULL | Tên trình độ |
| rank_order | INT | NOT NULL | Thứ bậc: người thay ca phải có rank ≥ (5.3, 5.4) |

### `staff` — Nhân viên  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| account_id | BIGINT | FK → account.id; NOT NULL | Tài khoản (1 người làm 2 cơ sở → 2 bản ghi, 13.4 LP1) |
| hospital_id | BIGINT | FK → hospital.id; NOT NULL | Cơ sở |
| department_id | BIGINT | FK → department.id | Khoa |
| specialty_id | BIGINT | FK → specialty.id | Chuyên khoa |
| staff_code | VARCHAR(20) | NOT NULL | Mã nhân viên, duy nhất trong cơ sở |
| full_name | VARCHAR(100) | NOT NULL | Họ tên |
| dob | DATE |  | Ngày sinh |
| gender | VARCHAR(10) | ∈ {MALE, FEMALE, OTHER} | Giới tính |
| phone | VARCHAR(20) |  | SĐT |
| staff_type | VARCHAR(20) | NOT NULL; ∈ {DOCTOR, CLS_TECHNICIAN, RECEPTIONIST, PHARMACIST, LEADER} | Vai trò nghiệp vụ (13.4) |
| qualification_level_id | BIGINT | FK → qualification_level.id | Trình độ (chỉ bác sĩ) |
| license_no | VARCHAR(50) |  | Số chứng chỉ hành nghề |
| status | VARCHAR(20) | NOT NULL; DEFAULT 'ACTIVE'; ∈ {ACTIVE, LOCKED, DEACTIVATED} | Hoạt động / khóa tạm / vô hiệu hóa (13.4 LP5, LP6) |
| deactivated_on | DATE |  | Ngày nghỉ việc (13.4 LP6) |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |
| updated_at | TIMESTAMPTZ |  | Thời điểm cập nhật gần nhất |

UNIQUE ghép: (hospital_id, staff_code); (hospital_id, account_id)

### `system_config` — Cấu hình hệ thống  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| config_key | VARCHAR(100) | PK | Khóa cấu hình, vd ACCESS_GRANT_MAX_HOURS |
| config_value | VARCHAR(500) | NOT NULL | Giá trị (14.3: 1–72 giờ, đề xuất 24) |
| description | VARCHAR(300) |  | Giải thích |
| updated_by | BIGINT | FK → account.id | Người sửa cuối (14.3) |
| updated_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Lúc sửa |

## M2 – Bệnh nhân & hồ sơ sức khỏe

### `patient` — Hồ sơ bệnh nhân (dùng chung liên viện)  _(phạm vi: PATIENT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| account_id | BIGINT | FK → account.id; UNIQUE | Tài khoản; NULL nếu chỉ khám tại quầy hoặc là người nhà được đặt hộ (I, 8.2) |
| patient_code | VARCHAR(20) | NOT NULL; UNIQUE | Mã bệnh nhân (I, LP1) |
| full_name | VARCHAR(100) | NOT NULL | Họ tên |
| dob | DATE | NOT NULL | Ngày sinh |
| gender | VARCHAR(10) | NOT NULL; ∈ {MALE, FEMALE, OTHER} | Giới tính |
| ethnicity | VARCHAR(50) |  | Dân tộc (7.5) |
| occupation | VARCHAR(100) |  | Nghề nghiệp (7.5) |
| national_id_hash | VARCHAR(64) | UNIQUE | SHA-256 của CCCD / mã định danh → tra cứu (I bước 8, 7.1, 8.2) |
| national_id_enc | VARCHAR(255) |  | CCCD mã hóa → hiển thị che 3 số đầu, 3 số cuối |
| phone_enc | VARCHAR(255) |  | SĐT mã hóa → hiển thị 3 số cuối; dùng gửi SMS |
| phone_hash | VARCHAR(64) |  | Băm SĐT để kiểm tra trùng hồ sơ (I LP1 bước 13) |
| health_insurance_no | VARCHAR(20) |  | Mã BHYT |
| address | VARCHAR(300) |  | Địa chỉ |
| photo_url | VARCHAR(500) |  | Ảnh (hiển thị ở hàng chờ 9.1) |
| identity_verified_at | TIMESTAMPTZ |  | Lễ tân đã đối chiếu giấy tờ |
| created_by_staff_id | BIGINT | FK → staff.id | Lễ tân tạo hồ sơ (I LP1) |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |
| updated_at | TIMESTAMPTZ |  | Thời điểm cập nhật gần nhất |

### `patient_guardian` — Người nhà quản lý hồ sơ  _(phạm vi: PATIENT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| manager_account_id | BIGINT | FK → account.id; NOT NULL | Tài khoản người đặt hộ (8.2) |
| patient_id | BIGINT | FK → patient.id; NOT NULL | Hồ sơ người nhà |
| relationship | VARCHAR(20) | NOT NULL; ∈ {FATHER, MOTHER, CHILD, WIFE, HUSBAND, SIBLING, OTHER} | Quan hệ (8.2) |
| permission | VARCHAR(10) | NOT NULL; DEFAULT 'BOOK'; ∈ {BOOK, FOLLOW} | Đặt hộ / Theo dõi (8.2, 8.6, 12.1) |
| contact_phone_enc | VARCHAR(255) |  | SĐT người nhà để gửi SMS lịch hẹn (8.2 bước 7) |
| revoked_at | TIMESTAMPTZ |  | Người nhà gỡ quyền |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

UNIQUE ghép: (manager_account_id, patient_id)

### `emergency_contact` — Người liên hệ khẩn cấp  _(phạm vi: PATIENT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| patient_id | BIGINT | FK → patient.id; NOT NULL | Bệnh nhân |
| full_name | VARCHAR(100) | NOT NULL | Họ tên |
| relationship | VARCHAR(30) | NOT NULL | Quan hệ |
| phone | VARCHAR(20) | NOT NULL | SĐT |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

### `allergen` — Danh mục tác nhân dị ứng  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| code | VARCHAR(30) | NOT NULL; UNIQUE | Mã |
| name | VARCHAR(150) | NOT NULL | Penicillin, nhóm Beta-lactam, tôm, lạc… |
| allergen_type | VARCHAR(10) | NOT NULL; ∈ {DRUG, FOOD, OTHER} | Thuốc / thực phẩm / khác |

### `patient_allergy` — Dị ứng của bệnh nhân  _(phạm vi: PATIENT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| patient_id | BIGINT | FK → patient.id; NOT NULL | Bệnh nhân |
| allergen_id | BIGINT | FK → allergen.id | Tác nhân trong danh mục |
| allergen_text | VARCHAR(150) |  | Tác nhân nhập tự do |
| reaction | VARCHAR(300) |  | Biểu hiện |
| severity | VARCHAR(10) | NOT NULL; DEFAULT 'UNKNOWN'; ∈ {MILD, MODERATE, SEVERE, UNKNOWN} | Mức độ |
| source | VARCHAR(10) | NOT NULL; ∈ {PATIENT, DOCTOR, FEEDBACK} | BN tự khai (7.5) / bác sĩ / từ đánh giá sau điều trị (8.5 LP1) |
| status | VARCHAR(20) | NOT NULL; DEFAULT 'CONFIRMED'; ∈ {PENDING_CONFIRM, CONFIRMED, INACTIVE} | “BN tự khai – chờ bác sĩ xác nhận” (8.5 LP1) |
| confirmed_by | BIGINT | FK → staff.id | Bác sĩ xác nhận |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |
| updated_at | TIMESTAMPTZ |  | Thời điểm cập nhật gần nhất |

CHECK: `allergen_id IS NOT NULL OR allergen_text IS NOT NULL`

### `icd10` — Danh mục bệnh ICD-10  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| code | VARCHAR(10) | PK | Mã ICD |
| name_vi | VARCHAR(300) | NOT NULL | Tên bệnh |
| is_chronic | BOOLEAN | NOT NULL; DEFAULT false | Bệnh mạn tính |

### `patient_condition` — Bệnh mạn tính / tiền sử bệnh  _(phạm vi: PATIENT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| patient_id | BIGINT | FK → patient.id; NOT NULL | Bệnh nhân |
| icd_code | VARCHAR(10) | FK → icd10.code | Mã bệnh |
| condition_text | VARCHAR(200) |  | Mô tả nếu chưa có mã |
| diagnosed_date | DATE |  | Ngày phát hiện |
| is_active | BOOLEAN | NOT NULL; DEFAULT true | Đang mắc |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

### `policy_category` — Danh mục đối tượng chính sách  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| code | VARCHAR(20) | NOT NULL; UNIQUE | Mã |
| name | VARCHAR(150) | NOT NULL | Cựu chiến binh, người có công, trẻ em… |
| discount_percent | NUMERIC(5,2) | NOT NULL; DEFAULT 0 | Mức miễn giảm (V bước 5) |

### `patient_policy` — Đối tượng chính sách của bệnh nhân  _(phạm vi: PATIENT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| patient_id | BIGINT | FK → patient.id; NOT NULL | Bệnh nhân |
| policy_category_id | BIGINT | FK → policy_category.id; NOT NULL | Loại đối tượng |
| certificate_no | VARCHAR(50) |  | Số giấy chứng nhận |
| status | VARCHAR(10) | NOT NULL; DEFAULT 'PENDING'; ∈ {PENDING, VERIFIED, REJECTED} | Trạng thái xác minh (7.5) |
| verified_by | BIGINT | FK → staff.id | Lễ tân xác minh |
| valid_to | DATE |  | Hiệu lực đến |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

## M3 – Lịch làm việc, dịch vụ & đặt lịch

### `service` — Dịch vụ khám (mức khám) / dịch vụ CLS  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| hospital_id | BIGINT | FK → hospital.id; NOT NULL | Cơ sở |
| service_type | VARCHAR(20) | NOT NULL; ∈ {CONSULTATION, XRAY, ULTRASOUND, LAB, PROCEDURE} | Khám / X-quang / siêu âm / xét nghiệm / thủ thuật (13.5) |
| code | VARCHAR(20) | NOT NULL | Mã dịch vụ |
| name | VARCHAR(200) | NOT NULL | “Khám Tim mạch – BS CKII”, “Chụp X-quang ngực thẳng” |
| department_id | BIGINT | FK → department.id | Khoa |
| specialty_id | BIGINT | FK → specialty.id | Chuyên khoa (dịch vụ khám) |
| qualification_level_id | BIGINT | FK → qualification_level.id | Trình độ áp dụng = mức khám (13.5) |
| default_room_id | BIGINT | FK → room.id | Phòng thực hiện mặc định (dịch vụ CLS) |
| is_active | BOOLEAN | NOT NULL; DEFAULT true | Áp dụng / ngừng (13.5 LP2) |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |
| updated_at | TIMESTAMPTZ |  | Thời điểm cập nhật gần nhất |

UNIQUE ghép: (hospital_id, code)

### `service_price` — Bảng giá theo thời gian  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| service_id | BIGINT | FK → service.id; NOT NULL | Dịch vụ |
| price | NUMERIC(12,0) | NOT NULL | Giá (VNĐ) |
| effective_from | DATE | NOT NULL | Áp dụng từ (13.5 LP1) |
| effective_to | DATE |  | Kết thúc; NULL = giá hiện hành |
| created_by | BIGINT | FK → staff.id | Người đổi giá |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

### `schedule_template` — Lịch tuần mẫu (ô phòng × buổi)  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| hospital_id | BIGINT | FK → hospital.id; NOT NULL | Cơ sở |
| room_id | BIGINT | FK → room.id; NOT NULL | Phòng (dòng của bảng 5.1) |
| weekday | SMALLINT | NOT NULL; ∈ {1, 2, 3, 4, 5, 6, 7} | Thứ (cột của bảng) |
| session | VARCHAR(10) | NOT NULL; ∈ {MORNING, AFTERNOON} | Buổi |
| staff_id | BIGINT | FK → staff.id; NOT NULL | Người trực |
| effective_from | DATE | NOT NULL | Áp dụng từ ngày (5.1 bước 9) |
| effective_to | DATE |  | NULL = đang áp dụng; đóng lại khi lưu mẫu mới (5.1 LP2) |
| updated_by | BIGINT | FK → staff.id | Admin lưu |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

### `staff_leave` — Báo nghỉ nhân viên  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| staff_id | BIGINT | FK → staff.id; NOT NULL | Nhân viên (5.4) |
| from_date | DATE | NOT NULL | Từ ngày |
| to_date | DATE | NOT NULL | Đến ngày |
| session | VARCHAR(10) | NOT NULL; DEFAULT 'FULL_DAY'; ∈ {FULL_DAY, MORNING, AFTERNOON} | Cả ngày / sáng / chiều |
| reason | VARCHAR(300) |  | Lý do |
| created_by | BIGINT | FK → staff.id | Admin báo nghỉ |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

CHECK: `to_date >= from_date`

### `work_schedule` — Ca làm việc đã phát hành  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| hospital_id | BIGINT | FK → hospital.id; NOT NULL | Cơ sở |
| room_id | BIGINT | FK → room.id; NOT NULL | Phòng |
| staff_id | BIGINT | FK → staff.id; NOT NULL | Người trực (đổi được ở 5.3) |
| work_date | DATE | NOT NULL | Ngày |
| session | VARCHAR(10) | NOT NULL; ∈ {MORNING, AFTERNOON} | Buổi |
| start_time | TIME | NOT NULL | Giờ bắt đầu (lấy từ giờ làm việc cơ sở) |
| end_time | TIME | NOT NULL | Giờ kết thúc |
| template_id | BIGINT | FK → schedule_template.id | Sinh từ ô lịch mẫu nào (5.2); NULL nếu tạo tay ở 5.3 LP1 |
| status | VARCHAR(10) | NOT NULL; DEFAULT 'ACTIVE'; ∈ {ACTIVE, CANCELLED} | Hoạt động / đã hủy (5.3 LP2) |
| cancel_reason | VARCHAR(300) |  | Lý do hủy ca |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |
| updated_at | TIMESTAMPTZ |  | Thời điểm cập nhật gần nhất |

UNIQUE ghép: (room_id, work_date, session); (staff_id, work_date, session)

CHECK: `status <> 'CANCELLED' OR cancel_reason IS NOT NULL`

### `time_slot` — Khung giờ khám trong ca  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| work_schedule_id | BIGINT | FK → work_schedule.id; NOT NULL | Ca |
| start_time | TIME | NOT NULL | Bắt đầu |
| end_time | TIME | NOT NULL | Kết thúc |
| max_patients | INT | NOT NULL | Số BN tối đa (sửa được ở 5.3, không nhỏ hơn số đã đặt) |
| booked_count | INT | NOT NULL; DEFAULT 0 | Số đã đặt |
| is_closed | BOOLEAN | NOT NULL; DEFAULT false | Toggle Mở / Đóng (5.3, 5.3 LP3) |
| version | INT | NOT NULL; DEFAULT 0 | Khóa lạc quan chống đặt trùng |

CHECK: `booked_count <= max_patients`; `end_time > start_time`

### `schedule_change_log` — Nhật ký sửa ca làm việc  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| work_schedule_id | BIGINT | FK → work_schedule.id; NOT NULL | Ca bị sửa (5.3 bước 8) |
| changed_by | BIGINT | FK → staff.id; NOT NULL | Ai sửa |
| change_type | VARCHAR(20) | NOT NULL; ∈ {CHANGE_STAFF, CHANGE_CAPACITY, CLOSE_SLOT, CANCEL, CREATE, LEAVE_REPLACE} | Sửa gì |
| old_staff_id | BIGINT | FK → staff.id | Người trực cũ |
| new_staff_id | BIGINT | FK → staff.id | Người trực mới |
| detail | JSONB |  | Chi tiết khác (khung giờ, số tối đa cũ / mới) |
| affected_patients | INT | NOT NULL; DEFAULT 0 | Số BN được thông báo |
| changed_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Lúc nào |

### `appointment` — Lịch hẹn khám online  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| appointment_code | VARCHAR(20) | NOT NULL; UNIQUE | Mã lịch hẹn (II bước 12) |
| patient_id | BIGINT | FK → patient.id; NOT NULL | Người được khám |
| booked_by_account_id | BIGINT | FK → account.id; NOT NULL | Người đặt (bản thân hoặc đặt hộ, 8.2) |
| hospital_id | BIGINT | FK → hospital.id; NOT NULL | Cơ sở |
| department_id | BIGINT | FK → department.id; NOT NULL | Khoa |
| specialty_id | BIGINT | FK → specialty.id | Chuyên khoa |
| service_id | BIGINT | FK → service.id; NOT NULL | Mức khám |
| doctor_id | BIGINT | FK → staff.id | Bác sĩ chọn |
| time_slot_id | BIGINT | FK → time_slot.id; NOT NULL | Khung giờ |
| appointment_date | DATE | NOT NULL | Ngày khám |
| start_time | TIME | NOT NULL | Giờ khám |
| price | NUMERIC(12,0) | NOT NULL | Giá khám chụp lại lúc đặt (giữ nguyên khi đổi bác sĩ hoặc đổi giá) |
| reason | VARCHAR(500) |  | Lý do khám |
| qr_token | VARCHAR(100) | NOT NULL; UNIQUE | Nội dung mã QR (II, III) |
| status | VARCHAR(20) | NOT NULL; DEFAULT 'BOOKED'; ∈ {BOOKED, CHECKED_IN, CANCELLED, NO_SHOW} | Đã đặt / đã check-in / đã hủy / không đến (8.1) |
| cancel_reason | VARCHAR(20) | ∈ {BUSY, RECOVERED, RESCHEDULE, HOSPITAL_CANCELLED, OTHER} | Lý do hủy (8.3; cơ sở hủy ca 5.3 LP2) |
| cancelled_at | TIMESTAMPTZ |  | Lúc hủy |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |
| updated_at | TIMESTAMPTZ |  | Thời điểm cập nhật gần nhất |

## M4 – Lượt khám & cận lâm sàng

### `encounter` — Lượt khám  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| encounter_code | VARCHAR(20) | NOT NULL; UNIQUE | Mã lượt khám (I bước 16) |
| hospital_id | BIGINT | FK → hospital.id; NOT NULL | Cơ sở |
| patient_id | BIGINT | FK → patient.id; NOT NULL | Bệnh nhân |
| appointment_id | BIGINT | FK → appointment.id; UNIQUE | Lịch hẹn (III); NULL = khám trực tiếp (I) |
| department_id | BIGINT | FK → department.id; NOT NULL | Khoa |
| room_id | BIGINT | FK → room.id; NOT NULL | Phòng khám ban đầu |
| work_schedule_id | BIGINT | FK → work_schedule.id | Ca khám |
| doctor_id | BIGINT | FK → staff.id | Bác sĩ điều trị |
| service_id | BIGINT | FK → service.id; NOT NULL | Mức khám |
| consultation_price | NUMERIC(12,0) | NOT NULL | Giá công khám chụp lại |
| visit_reason | VARCHAR(500) |  | Lý do thăm khám |
| status | VARCHAR(20) | NOT NULL; DEFAULT 'WAITING'; ∈ {WAITING, IN_EXAM, WAITING_CLS, CLS_DONE, COMPLETED, NO_SHOW, CANCELLED} | Vòng đời (IV, 9.2) |
| checked_in_by | BIGINT | FK → staff.id; NOT NULL | Lễ tân |
| checked_in_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Lúc check-in |
| started_at | TIMESTAMPTZ |  | “Đã vào phòng” (9.2) |
| completed_at | TIMESTAMPTZ |  | Hoàn tất, khóa bệnh án (IV bước 23) |
| conclusion | TEXT |  | Kết luận |
| doctor_advice | TEXT |  | Lời dặn |
| follow_up_date | DATE |  | Hẹn tái khám |
| treatment_result | VARCHAR(20) | ∈ {CURED, IMPROVED, UNCHANGED, WORSE, DECEASED} | Kết quả điều trị (lọc ở 10.1) |
| summary_file_url | VARCHAR(500) |  | File tổng hợp hồ sơ khám (IV bước 23) |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |
| updated_at | TIMESTAMPTZ |  | Thời điểm cập nhật gần nhất |

### `queue_ticket` — Số thứ tự hàng chờ  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| room_id | BIGINT | FK → room.id; NOT NULL | Phòng (khám hoặc CLS) |
| encounter_id | BIGINT | FK → encounter.id; NOT NULL | Lượt khám |
| service_order_item_id | BIGINT | FK → service_order_item.id | Chỉ định CLS (NULL = hàng chờ khám lâm sàng) |
| queue_date | DATE | NOT NULL | Ngày |
| queue_number | INT | NOT NULL | STT |
| priority | VARCHAR(20) | NOT NULL; DEFAULT 'NORMAL'; ∈ {NORMAL, PRIORITY, RETURN_FROM_CLS} | Ưu tiên / quay lại sau CLS (9.1) |
| sort_key | NUMERIC(14,4) | NOT NULL | Khóa sắp xếp: giờ hẹn hoặc giờ check-in; chỉnh khi xếp lại sau vắng (9.2 LP2) |
| status | VARCHAR(10) | NOT NULL; DEFAULT 'WAITING'; ∈ {WAITING, CALLED, SERVING, MISSED, DONE, NO_SHOW} | Trạng thái (9.2) |
| missed_count | SMALLINT | NOT NULL; DEFAULT 0 | Số lần vắng |
| called_at | TIMESTAMPTZ |  | Lúc gọi |
| access_token | VARCHAR(100) | NOT NULL; UNIQUE | Mã trong link SMS xem hàng chờ không cần đăng nhập (8.4) |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

UNIQUE ghép: (room_id, queue_date, queue_number)

### `clinical_exam` — Khám lâm sàng  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| encounter_id | BIGINT | FK → encounter.id; NOT NULL | Lượt khám |
| doctor_id | BIGINT | FK → staff.id; NOT NULL | Bác sĩ |
| symptoms | TEXT |  | Triệu chứng, bệnh sử (IV bước 5) |
| pulse | INT |  | Mạch |
| temperature | NUMERIC(4,1) |  | Nhiệt độ |
| blood_pressure | VARCHAR(10) |  | Huyết áp |
| weight_kg | NUMERIC(5,1) |  | Cân nặng |
| preliminary_diagnosis | VARCHAR(500) |  | Chẩn đoán sơ bộ |
| examined_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Lúc khám |

### `encounter_diagnosis` — Chẩn đoán xác định  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| encounter_id | BIGINT | FK → encounter.id; NOT NULL | Lượt khám |
| icd_code | VARCHAR(10) | FK → icd10.code; NOT NULL | Mã ICD (IV bước 21) |
| diagnosis_type | VARCHAR(10) | NOT NULL; ∈ {PRIMARY, SECONDARY} | Bệnh chính / kèm theo |
| diagnosed_by | BIGINT | FK → staff.id; NOT NULL | Bác sĩ |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

UNIQUE ghép: (encounter_id, icd_code)

### `service_order` — Phiếu chỉ định CLS  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| order_code | VARCHAR(20) | NOT NULL; UNIQUE | Mã phiếu / mã vạch (IV bước 11) |
| encounter_id | BIGINT | FK → encounter.id; NOT NULL | Lượt khám |
| ordering_doctor_id | BIGINT | FK → staff.id; NOT NULL | Bác sĩ chỉ định |
| clinical_notes | VARCHAR(500) |  | Chẩn đoán sơ bộ / lý do chỉ định (IV bước 8) |
| ordered_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Lúc chỉ định |

### `service_order_item` — Dịch vụ CLS được chỉ định và kết quả  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| service_order_id | BIGINT | FK → service_order.id; NOT NULL | Phiếu |
| service_id | BIGINT | FK → service.id; NOT NULL | Dịch vụ |
| room_id | BIGINT | FK → room.id; NOT NULL | Phòng thực hiện |
| performer_id | BIGINT | FK → staff.id | KTV/BS thực hiện = người có ca trực tại phòng lúc đó (IV bước 14) |
| unit_price | NUMERIC(12,0) | NOT NULL | Giá chụp lại |
| status | VARCHAR(20) | NOT NULL; DEFAULT 'PENDING'; ∈ {PENDING, IN_PROGRESS, COMPLETED, CANCELLED} | Chờ / đang thực hiện / hoàn thành (IV bước 12, 16) |
| findings | TEXT |  | Mô tả chi tiết |
| conclusion | TEXT |  | Kết luận chuyên môn |
| received_at | TIMESTAMPTZ |  | “Tiếp nhận thực hiện” |
| completed_at | TIMESTAMPTZ |  | “Hoàn tất kết quả” |

### `lab_result_value` — Chỉ số xét nghiệm  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| service_order_item_id | BIGINT | FK → service_order_item.id; NOT NULL | Dịch vụ xét nghiệm |
| indicator_name | VARCHAR(150) | NOT NULL | Tên chỉ số |
| value | VARCHAR(50) | NOT NULL | Giá trị |
| unit | VARCHAR(20) |  | Đơn vị |
| reference_range | VARCHAR(50) |  | Khoảng tham chiếu |
| is_abnormal | BOOLEAN | NOT NULL; DEFAULT false | Bất thường (8.6 “chỉ số nào bất thường”) |

### `medical_attachment` — Hình ảnh / tệp kết quả  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| service_order_item_id | BIGINT | FK → service_order_item.id; NOT NULL | Kết quả CLS |
| file_url | VARCHAR(500) | NOT NULL | Đường dẫn tệp (ảnh X-quang, clip siêu âm) |
| file_type | VARCHAR(10) | NOT NULL; ∈ {IMAGE, VIDEO, PDF, DICOM} | Loại tệp |
| uploaded_by | BIGINT | FK → staff.id; NOT NULL | Người tải lên |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

### `notable_case` — Phiên khám đáng chú ý  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| encounter_id | BIGINT | FK → encounter.id; NOT NULL; UNIQUE | Phiên khám (9.5) |
| hospital_id | BIGINT | FK → hospital.id; NOT NULL | Cơ sở (lãnh đạo chỉ thấy của cơ sở mình, 10.1) |
| reason | VARCHAR(20) | NOT NULL; ∈ {RARE_OR_NEW, SEVERE, EFFECTIVE_PROTOCOL, COMPLICATION_OR_DEATH, OTHER} | Lý do |
| professional_note | TEXT | NOT NULL | Ghi chú chuyên môn, tối thiểu 20 ký tự |
| marked_by | BIGINT | FK → staff.id; NOT NULL | Bác sĩ đánh dấu |
| notify_department_head | BOOLEAN | NOT NULL; DEFAULT true | Thông báo trưởng khoa |
| marked_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Lúc đánh dấu |
| unmarked_by | BIGINT | FK → staff.id | Người bỏ đánh dấu (9.5 LP) |
| unmarked_at | TIMESTAMPTZ |  | Lúc bỏ |
| unmark_reason | VARCHAR(300) |  | Lý do bỏ |

CHECK: `char_length(professional_note) >= 20`; `unmarked_at IS NULL OR unmark_reason IS NOT NULL`

## M5 – Đơn thuốc & nhà thuốc

### `medicine` — Danh mục thuốc dùng chung  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| code | VARCHAR(30) | NOT NULL; UNIQUE | Mã thuốc |
| name | VARCHAR(200) | NOT NULL | Tên |
| active_ingredient | VARCHAR(200) | NOT NULL | Hoạt chất (bắt buộc để cảnh báo dị ứng, 11.1 LP4) |
| strength | VARCHAR(50) |  | Hàm lượng |
| dosage_form | VARCHAR(50) |  | Dạng bào chế |
| route | VARCHAR(30) |  | Đường dùng |
| base_unit | VARCHAR(20) | NOT NULL | Đơn vị tính |
| is_custom | BOOLEAN | NOT NULL; DEFAULT false | “Ngoài danh mục” do dược sĩ nhập thủ công (11.1 LP4) |
| created_by_hospital_id | BIGINT | FK → hospital.id | Cơ sở tạo thuốc ngoài danh mục |

### `medicine_allergen` — Thuốc ↔ tác nhân dị ứng  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| medicine_id | BIGINT | FK → medicine.id; NOT NULL | Thuốc |
| allergen_id | BIGINT | FK → allergen.id; NOT NULL | Nhóm dị ứng liên quan (11.1 LP4) |

UNIQUE ghép: (medicine_id, allergen_id)

### `hospital_medicine` — Thuốc bán tại nhà thuốc cơ sở  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| hospital_id | BIGINT | FK → hospital.id; NOT NULL | Cơ sở |
| medicine_id | BIGINT | FK → medicine.id; NOT NULL | Thuốc trong danh mục (11.1 bước 4) |
| sale_unit | VARCHAR(20) | NOT NULL | Đơn vị bán |
| sale_price | NUMERIC(12,0) | NOT NULL | Giá bán (> 0) |
| low_stock_threshold | INT | NOT NULL; DEFAULT 0 | Ngưỡng cảnh báo sắp hết hàng |
| is_selling | BOOLEAN | NOT NULL; DEFAULT true | Đang bán / ngừng bán (11.1 LP3) |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |
| updated_at | TIMESTAMPTZ |  | Thời điểm cập nhật gần nhất |

UNIQUE ghép: (hospital_id, medicine_id)

CHECK: `sale_price > 0`

### `medicine_batch` — Lô thuốc trong kho  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| hospital_medicine_id | BIGINT | FK → hospital_medicine.id; NOT NULL | Thuốc của cơ sở |
| batch_no | VARCHAR(50) | NOT NULL | Số lô |
| expiry_date | DATE | NOT NULL | Hạn dùng (phát lô hết hạn sớm nhất trước, 11.2) |
| quantity_on_hand | NUMERIC(12,2) | NOT NULL; DEFAULT 0 | Tồn hiện tại |
| import_price | NUMERIC(12,0) |  | Giá nhập |

UNIQUE ghép: (hospital_medicine_id, batch_no)

CHECK: `quantity_on_hand >= 0`

### `stock_receipt` — Phiếu nhập kho  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| hospital_id | BIGINT | FK → hospital.id; NOT NULL | Cơ sở |
| supplier | VARCHAR(200) |  | Nhà cung cấp (11.1 LP1) |
| receipt_date | DATE | NOT NULL; DEFAULT CURRENT_DATE | Ngày nhập |
| created_by | BIGINT | FK → staff.id; NOT NULL | Dược sĩ |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

### `stock_receipt_item` — Dòng phiếu nhập kho  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| stock_receipt_id | BIGINT | FK → stock_receipt.id; NOT NULL | Phiếu |
| medicine_batch_id | BIGINT | FK → medicine_batch.id; NOT NULL | Lô được cộng tồn |
| quantity | NUMERIC(12,2) | NOT NULL | Số lượng (> 0) |
| import_price | NUMERIC(12,0) |  | Giá nhập |

CHECK: `quantity > 0`

### `prescription` — Đơn thuốc  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| encounter_id | BIGINT | FK → encounter.id; NOT NULL; UNIQUE | Lượt khám (mỗi lượt một đơn) |
| doctor_id | BIGINT | FK → staff.id; NOT NULL | Bác sĩ kê |
| status | VARCHAR(20) | NOT NULL; DEFAULT 'ISSUED'; ∈ {ISSUED, DISPENSED, PARTIAL, NOT_DISPENSED} | Trạng thái phát (11.2) |
| issued_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Ngày kê |

### `prescription_item` — Thuốc trong đơn  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| prescription_id | BIGINT | FK → prescription.id; NOT NULL | Đơn |
| medicine_id | BIGINT | FK → medicine.id; NOT NULL | Thuốc |
| quantity | NUMERIC(10,2) | NOT NULL | Số lượng kê |
| dosage | VARCHAR(100) | NOT NULL | Liều |
| usage_instruction | VARCHAR(300) |  | Cách dùng |
| duration_days | INT |  | Số ngày dùng (8.5: tính ngày hết thuốc) |
| unit_price | NUMERIC(12,0) |  | Giá bán tại nhà thuốc lúc kê (V bước 4c) |

### `clinical_alert` — Cảnh báo dị ứng khi kê đơn  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| prescription_id | BIGINT | FK → prescription.id; NOT NULL | Đơn |
| medicine_id | BIGINT | FK → medicine.id; NOT NULL | Thuốc bị cảnh báo |
| patient_allergy_id | BIGINT | FK → patient_allergy.id; NOT NULL | Dị ứng trùng |
| doctor_action | VARCHAR(10) | ∈ {CHANGED, OVERRIDDEN} | Bác sĩ đổi thuốc / vẫn kê |
| override_reason | VARCHAR(300) |  | Lý do vẫn kê |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

CHECK: `doctor_action <> 'OVERRIDDEN' OR override_reason IS NOT NULL`

### `dispense` — Lần phát thuốc  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| prescription_id | BIGINT | FK → prescription.id; NOT NULL; UNIQUE | Đơn (không phát lại, 11.2 LP3) |
| pharmacist_id | BIGINT | FK → staff.id; NOT NULL | Dược sĩ phát |
| is_partial | BOOLEAN | NOT NULL; DEFAULT false | Phát một phần (11.2 LP2) |
| dispensed_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Ngày phát = ngày bắt đầu dùng thuốc (8.5) |

### `dispense_item` — Thuốc đã phát theo lô  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| dispense_id | BIGINT | FK → dispense.id; NOT NULL | Lần phát |
| prescription_item_id | BIGINT | FK → prescription_item.id; NOT NULL | Dòng đơn |
| medicine_batch_id | BIGINT | FK → medicine_batch.id; NOT NULL | Lô xuất (trừ tồn) |
| quantity | NUMERIC(12,2) | NOT NULL | Số lượng phát thực tế |

CHECK: `quantity > 0`

## M6 – Thanh toán

### `invoice` — Hóa đơn viện phí  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| invoice_no | VARCHAR(20) | NOT NULL; UNIQUE | Số hóa đơn / mã giao dịch |
| hospital_id | BIGINT | FK → hospital.id; NOT NULL | Cơ sở |
| patient_id | BIGINT | FK → patient.id; NOT NULL | Bệnh nhân |
| encounter_id | BIGINT | FK → encounter.id; UNIQUE | Lượt khám (V) |
| subtotal | NUMERIC(14,0) | NOT NULL; DEFAULT 0 | Tổng chi phí (V bước 5) |
| policy_category_id | BIGINT | FK → policy_category.id | Chính sách miễn giảm áp dụng |
| discount_amount | NUMERIC(14,0) | NOT NULL; DEFAULT 0 | Giảm trừ |
| total_amount | NUMERIC(14,0) | NOT NULL; DEFAULT 0 | Thực trả |
| status | VARCHAR(20) | NOT NULL; DEFAULT 'UNPAID'; ∈ {UNPAID, PAID, PARTIALLY_REFUNDED, REFUNDED} | Trạng thái (V bước 8) |
| receipt_url | VARCHAR(500) |  | Biên lai / hóa đơn điện tử (V bước 9) |
| issued_by | BIGINT | FK → staff.id | Thu ngân |
| paid_at | TIMESTAMPTZ |  | Lúc thanh toán đủ |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

### `invoice_item` — Dòng bảng kê  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| invoice_id | BIGINT | FK → invoice.id; NOT NULL | Hóa đơn |
| item_type | VARCHAR(20) | NOT NULL; ∈ {CONSULTATION, CLS, MEDICINE} | Công khám / CLS / thuốc (V bước 4) |
| service_order_item_id | BIGINT | FK → service_order_item.id | Nguồn CLS |
| prescription_item_id | BIGINT | FK → prescription_item.id | Nguồn thuốc |
| description | VARCHAR(300) | NOT NULL | Diễn giải |
| quantity | NUMERIC(10,2) | NOT NULL; DEFAULT 1 | Số lượng |
| unit_price | NUMERIC(12,0) | NOT NULL | Đơn giá |
| amount | NUMERIC(14,0) | NOT NULL | Thành tiền |

### `payment_transaction` — Giao dịch thu / hoàn tiền  _(phạm vi: TENANT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| invoice_id | BIGINT | FK → invoice.id | Hóa đơn (khi thu viện phí) |
| appointment_id | BIGINT | FK → appointment.id | Lịch hẹn (khi hoàn tiền hủy lịch, 8.3, 5.3 LP2) |
| txn_type | VARCHAR(10) | NOT NULL; DEFAULT 'PAYMENT'; ∈ {PAYMENT, REFUND} | Thu / hoàn (11.2 LP2 hoàn phần thuốc chưa phát) |
| method | VARCHAR(10) | NOT NULL; ∈ {CASH, VIETQR, GATEWAY} | Tiền mặt / VietQR / cổng (V bước 6) |
| provider | VARCHAR(20) |  | VNPAY, MOMO… |
| amount | NUMERIC(14,0) | NOT NULL | Số tiền |
| received_amount | NUMERIC(14,0) |  | Tiền khách đưa (tiền mặt) |
| change_amount | NUMERIC(14,0) |  | Tiền thừa (V bước 7a) |
| provider_txn_ref | VARCHAR(100) | UNIQUE | Mã giao dịch ngân hàng / cổng (chống xử lý trùng webhook) |
| status | VARCHAR(10) | NOT NULL; DEFAULT 'PENDING'; ∈ {PENDING, SUCCESS, FAILED} | Trạng thái |
| cashier_id | BIGINT | FK → staff.id | Thu ngân |
| raw_payload | JSONB |  | Dữ liệu webhook gốc (đối soát) |
| completed_at | TIMESTAMPTZ |  | Lúc thành công |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

CHECK: `invoice_id IS NOT NULL OR appointment_id IS NOT NULL`

## M7 – Quyền truy cập hồ sơ & nhật ký

### `record_access_grant` — Quyền truy cập hồ sơ theo lượt khám  _(phạm vi: PATIENT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| patient_id | BIGINT | FK → patient.id; NOT NULL | Chủ hồ sơ |
| encounter_id | BIGINT | FK → encounter.id; NOT NULL | Lượt khám mở quyền (12.1 bước 1) |
| doctor_id | BIGINT | FK → staff.id; NOT NULL | Bác sĩ điều trị duy nhất được xem (KTV không bao giờ có quyền) |
| hospital_id | BIGINT | FK → hospital.id; NOT NULL | Cơ sở của bác sĩ |
| opened_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Lúc mở (“Đã vào phòng”) |
| expires_at | TIMESTAMPTZ | NOT NULL | opened_at + giờ hiệu lực tối đa (14.3) |
| closed_at | TIMESTAMPTZ |  | Lúc đóng |
| close_reason | VARCHAR(20) | ∈ {COMPLETED, CANCELLED, EXPIRED, DOCTOR_CHANGED} | Lý do đóng (12.1 bước 5) |

CHECK: `expires_at > opened_at`

### `record_view_log` — Phiên khám được xem trong thời gian mở quyền  _(phạm vi: PATIENT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| grant_id | BIGINT | FK → record_access_grant.id; NOT NULL | Quyền đang dùng |
| viewed_encounter_id | BIGINT | FK → encounter.id | Phiên được xem (NULL = xem hồ sơ tổng quan 9.3) |
| viewed_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Lúc xem (12.1 bước 4; đếm “đã xem N phiên”) |

### `system_log` — Nhật ký hệ thống (chỉ ghi thêm)  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| event_type | VARCHAR(30) | NOT NULL; ∈ {ACCESS_OPENED, ACCESS_CLOSED, NOTABLE_MARKED, NOTABLE_UNMARKED, NOTABLE_VIEWED, CONFIG_CHANGED, HOSPITAL_SUSPENDED, HOSPITAL_REACTIVATED} | Loại sự kiện (14.4) |
| actor_account_id | BIGINT | FK → account.id | Người thực hiện (NULL = HT tự động) |
| actor_role | VARCHAR(30) |  | Vai trò lúc thực hiện |
| hospital_id | BIGINT | FK → hospital.id | Cơ sở |
| patient_id | BIGINT | FK → patient.id | Bệnh nhân (chỉ hiển thị mã) |
| encounter_id | BIGINT | FK → encounter.id | Phiên khám liên quan |
| detail | JSONB |  | Chi tiết (giá trị cấu hình cũ / mới…) |
| ip_address | VARCHAR(45) |  | IP (14.4 bước 6) |
| user_agent | VARCHAR(300) |  | Thiết bị |
| occurred_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm, tới giây |

## M8 – Thông báo, đánh giá, chatbot & bài viết

### `notification` — Thông báo  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| account_id | BIGINT | FK → account.id | Người nhận có tài khoản (cả admin, bác sĩ, trưởng khoa) |
| patient_id | BIGINT | FK → patient.id | BN nhận (kể cả không có tài khoản → SMS) |
| channel | VARCHAR(10) | NOT NULL; ∈ {IN_APP, SMS, EMAIL} | Kênh (12.1 LP: đổi kênh khi lỗi) |
| type | VARCHAR(40) | NOT NULL | CHECKED_IN, QUEUE_NEAR, CALLED, MISSED, CLS_RESULT, RETURN_TO_ROOM, RESULT_READY, ACCESS_OPENED, ACCESS_CLOSED, SCHEDULE_CHANGED, SCHEDULE_PUBLISHED, FEEDBACK_INVITE, NOTABLE_MARKED… |
| title | VARCHAR(200) |  | Tiêu đề |
| content | TEXT | NOT NULL | Nội dung (không chứa thông tin bệnh) |
| link_url | VARCHAR(500) |  | Link kèm theo |
| ref_type | VARCHAR(30) |  | Đối tượng liên quan |
| ref_id | BIGINT |  | Id đối tượng |
| status | VARCHAR(10) | NOT NULL; DEFAULT 'PENDING'; ∈ {PENDING, SENT, FAILED, READ} | Trạng thái |
| retry_count | SMALLINT | NOT NULL; DEFAULT 0 | Số lần gửi lại (tối đa 3) |
| sent_at | TIMESTAMPTZ |  | Lúc gửi |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

### `encounter_feedback` — Đánh giá sau khám  _(phạm vi: PATIENT)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| encounter_id | BIGINT | FK → encounter.id; NOT NULL | Phiên khám |
| round | VARCHAR(10) | NOT NULL; ∈ {SERVICE, OUTCOME} | Lần 1 sau phiên khám / lần 2 sau khi hết thuốc (8.5) |
| due_at | TIMESTAMPTZ | NOT NULL | Thời điểm mời đánh giá |
| reminder_count | SMALLINT | NOT NULL; DEFAULT 0 | Số lần đã nhắc (tối đa 2) |
| submitted_by | BIGINT | FK → account.id | Người gửi |
| submitted_at | TIMESTAMPTZ |  | Lúc gửi; NULL = chưa trả lời |
| doctor_attitude | SMALLINT | ∈ {1, 2, 3, 4, 5} | Sao: thái độ bác sĩ |
| explanation | SMALLINT | ∈ {1, 2, 3, 4, 5} | Sao: mức độ giải thích |
| waiting_time | SMALLINT | ∈ {1, 2, 3, 4, 5} | Sao: thời gian chờ |
| comment | TEXT |  | Nhận xét |
| outcome | VARCHAR(20) | ∈ {CURED, MUCH_BETTER, UNCHANGED, WORSE} | Tình trạng sau khi hết thuốc |
| side_effects | JSONB |  | Tác dụng phụ đã chọn + mô tả “Khác” |

UNIQUE ghép: (encounter_id, round)

CHECK: `submitted_at IS NULL OR round <> 'OUTCOME' OR outcome IS NOT NULL`

### `chat_session` — Phiên chat với trợ lý AI  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| chat_type | VARCHAR(10) | NOT NULL; ∈ {SYMPTOM, RESULT} | Hỏi triệu chứng (7.4) / phân tích kết quả (8.6) |
| account_id | BIGINT | FK → account.id; NOT NULL | Người dùng đã đăng nhập (khách không được lưu) |
| encounter_id | BIGINT | FK → encounter.id | Phiên khám làm ngữ cảnh (8.6) |
| suggested_specialty_id | BIGINT | FK → specialty.id | Chuyên khoa gợi ý để đặt lịch (7.4) |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

### `chat_message` — Tin nhắn chat  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| chat_session_id | BIGINT | FK → chat_session.id; NOT NULL | Phiên chat |
| sender | VARCHAR(10) | NOT NULL; ∈ {USER, AI} | Người gửi |
| content | TEXT | NOT NULL | Nội dung |
| is_emergency_flag | BOOLEAN | NOT NULL; DEFAULT false | Phát hiện dấu hiệu cấp cứu (7.4 LP) |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |

### `article` — Bài viết trang chủ  _(phạm vi: GLOBAL)_

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | BIGINT | PK | Khóa chính |
| title | VARCHAR(300) | NOT NULL | Tiêu đề (7.3) |
| summary | VARCHAR(500) |  | Đoạn tóm tắt |
| content | TEXT | NOT NULL | Nội dung |
| cover_url | VARCHAR(500) |  | Ảnh |
| specialty_name | VARCHAR(150) |  | Chuyên khoa (lọc, và nút “Đặt lịch khám [chuyên khoa]”) |
| hospital_id | BIGINT | FK → hospital.id | Cơ sở đăng (NULL = bài chung) |
| is_published | BOOLEAN | NOT NULL; DEFAULT true | Hiển thị |
| published_at | TIMESTAMPTZ |  | Ngày đăng |
| created_at | TIMESTAMPTZ | NOT NULL; DEFAULT now() | Thời điểm tạo |
