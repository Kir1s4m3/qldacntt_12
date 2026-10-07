# Photo Rain — giao diện hệ thống Photobooth

Bản UI bằng **PHP thuần + HTML/CSS + JavaScript ES Modules**, chưa dùng cơ sở dữ liệu. Gồm giao diện máy Photobooth, trang nhận ảnh và website quản lý hai cơ sở.

## Chạy trên máy hiện tại

Mở PowerShell trong thư mục `photobooth` và chạy:

```powershell
& C:\xampp\php\php.exe -S 127.0.0.1:8088 -t public
```

Hoặc chạy script hỗ trợ:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-local.ps1
```

- Máy Photobooth: http://127.0.0.1:8088/
- Trang nhận ảnh: http://127.0.0.1:8088/gallery.php
- Quản lý: http://127.0.0.1:8088/admin.php

Giữ terminal chạy máy chủ; nhấn **Ctrl+C** để dừng. Nếu cổng 8088 đã được sử dụng, dùng `-Port 8089` với script hoặc đổi cổng trong lệnh PHP.

Không cần Node.js, npm, Composer hay MySQL để chạy website. PHP 8.0 trở lên có thể chạy bản UI; máy hiện tại đã được kiểm tra với PHP 8.0.30. Bản phát hành thực tế cần dùng phiên bản PHP còn được hỗ trợ tại thời điểm triển khai.

## Cấu trúc và cách đọc mã

```text
photobooth/
├── app/
│   ├── bootstrap.php         Khởi tạo cấu hình và hàm dùng chung
│   ├── config.php            Thương hiệu, lựa chọn camera, khung và giá mẫu
│   ├── helpers.php           Escape HTML, xuất JSON an toàn, icon giao diện
│   ├── data/demo.php         Dữ liệu giả cho các màn hình quản lý
│   └── views/
│       ├── partials/         Head HTML, thương hiệu dùng chung
│       ├── kiosk.php         Khung trang máy Photobooth
│       ├── gallery.php       Khung trang nhận ảnh
│       └── admin.php         Menu và bố cục quản lý
├── public/                   Chỉ thư mục này được dùng làm web root
│   ├── index.php             Điểm vào Photobooth
│   ├── gallery.php           Điểm vào trang nhận ảnh
│   ├── admin.php             Điểm vào quản lý; kiểm tra danh sách trang cho phép
│   └── assets/
│       ├── css/              Token chung và CSS từng khu vực
│       ├── js/
│       │   ├── shared.js     Tiền tệ, escape, dialog, QR và tải tệp
│       │   ├── kiosk.js      Trạng thái và các bước chụp
│       │   ├── gallery.js    Xem, tải ảnh và trạng thái nhận ảnh
│       │   ├── admin.js      Khởi tạo, bộ lọc cơ sở, điều hướng
│       │   └── admin/
│       │       ├── store.js      Dữ liệu mẫu và lưu trong phiên trình duyệt
│       │       ├── ui.js         Bảng, biểu mẫu và xuất CSV dùng chung
│       │       ├── overview.js   Tổng quan
│       │       ├── operations.js Ảnh, máy, vật tư và phụ kiện
│       │       ├── people.js     Ca làm, chấm công, lương và tài khoản
│       │       └── reports.js    Báo cáo và chốt ca
│       ├── images/           Favicon và ảnh minh họa cục bộ
│       └── vendor/           Thư viện QR, giữ nguyên mã bên thứ ba
├── tests/ui-smoke.cjs        Kiểm thử trình duyệt tùy chọn
└── start-local.ps1           Lệnh chạy PHP để học và xem thử
```

Để tìm hiểu theo thứ tự: `public/index.php` → `app/bootstrap.php` → `app/views/kiosk.php` → `public/assets/js/kiosk.js`. Đổi màu chung trong `public/assets/css/base.css`. Sửa tên, giá và danh mục khung trong `app/config.php`. Các cấu hình giá, màu, số bản in và tên cơ sở hiện là giả định cho bản UI, cần xác nhận trước khi triển khai thật.

## Chức năng của bản đầu

### Máy Photobooth

Chọn camera/sắc ảnh → chọn khung → số bản in → QR thanh toán mẫu → chụp 4 ảnh → đổi màu khung và lời nhắn → xuất ảnh PNG và trang nhận ảnh. Giá cập nhật theo khung và số bản in. Hai bản in đầu đã được tính trong giá mẫu; tối đa tám bản.

- QR thanh toán chỉ chứa chuỗi minh họa, **không phải mã chuyển khoản ngân hàng**.
- Nút “Mô phỏng thành công” mở lượt; nút “Thử lỗi” giữ nguyên màn hình thanh toán.
- Mặc định chụp từ ảnh minh họa; nút “Dùng webcam của tôi” xin quyền camera từ trình duyệt. Webcam chỉ hoạt động trên localhost hoặc HTTPS được trình duyệt cho phép.
- Ghép ảnh bằng canvas và tải PNG là thao tác thật tại trình duyệt. Không gửi ảnh lên máy chủ.
- Chưa tích hợp máy ảnh chuyên dụng, driver máy in, thanh toán thực hoặc lựa chọn/chỉnh sửa từng ảnh nâng cao.
- “Classic / Monochrome / Warm film” là ba sắc ảnh mẫu, chưa ánh xạ thiết bị camera trong video.

### Trang nhận ảnh

Hiển thị ảnh vừa chụp khi mở trong **cùng tab/phiên trình duyệt**. Nếu chưa chụp, hiển thị ảnh mẫu. Có các trạng thái UI sẵn sàng, đang đồng bộ và hết hạn để xem thử. Các trạng thái này chưa gắn với cơ chế hết hạn trên máy chủ.

QR nhận ảnh của bản local trỏ đến trang local; chưa dùng để chuyển bộ ảnh sang điện thoại khác. Muốn khách quét trên thiết bị khác cần backend lưu ảnh và liên kết tải riêng có thời hạn. Bản UI không tự áp đặt thời gian lưu ảnh khách hàng.

### Quản lý nội bộ

- Tổng quan: doanh thu và cảnh báo suy ra từ dữ liệu mẫu ngày 07/10/2026.
- Ảnh và tư liệu: lọc, tìm kiếm, xem và tải ảnh mẫu.
- Phòng/máy: sửa tình trạng hoạt động, giấy và mực còn lại.
- Vật tư/phụ kiện: thêm, sửa danh mục; nhập, xuất; không cho xuất quá tồn; kiểm kê và lịch sử thay đổi trong phiên.
- Ca làm: xếp ca, phát hiện trùng giờ của cùng nhân viên trên cả hai cơ sở; nhập giờ vào/ra mẫu. Chưa hỗ trợ ca qua đêm.
- Lương: chỉnh các thành phần, tính tổng, duyệt, xuất CSV. Công thức mẫu là lương cứng + giờ công × đơn giá + KPI; chưa tự tổng hợp từ chấm công.
- Báo cáo: lọc ngày, cơ sở, máy; chỉ tính giao dịch thành công; xuất CSV; kiểm tra số liệu trước khi chốt ca; ngăn chốt khoảng giờ trùng.
- Tài khoản: thêm, sửa vai trò, mô phỏng khóa/mở khóa; kiểm tra email trùng.

Thay đổi quản lý được giữ trong **sessionStorage**, chưa lưu bền vững. Có nút đặt lại dữ liệu mẫu. Dữ liệu giao dịch quản lý chưa được tạo tự động từ lượt chụp demo. Toàn bộ khu vực quản lý đang ở góc nhìn chủ cửa hàng; chưa có đăng nhập thật hoặc các trang tự phục vụ riêng cho từng nhân viên.

## Hướng mở rộng backend và cơ sở dữ liệu

1. Chốt các màn hình, giá, quy tắc lượt chụp, quy tắc lương và ma trận quyền.
2. Thêm repository PHP để truy cập cơ sở dữ liệu bằng PDO; giữ các file view và CSS độc lập. Dữ liệu mẫu hiện tập trung trong một file để dễ thay thế.
3. Thêm controller/endpoint cho từng nghiệp vụ; chuyển thao tác trong các module quản lý sang gọi API. `store.js` là điểm tiếp nhận dữ liệu UI, không chứa thông tin kết nối DB.
4. Thêm đăng nhập, session máy chủ, CSRF và kiểm tra quyền tại **mọi endpoint**. Các vai trò hiển thị trên UI chưa phải cơ chế bảo mật.
5. Giá và trạng thái thanh toán phải được xác nhận phía máy chủ; callback thanh toán cần chống xử lý trùng, mỗi giao dịch hợp lệ chỉ mở một lượt.
6. Tách dữ liệu lượt chụp, thanh toán, ảnh, máy, cơ sở, vật tư, ca làm, chấm công, bảng lương và tài khoản. Khi lưu giao dịch thật, dùng ID nhân sự thay cho tên để liên kết.
7. Lưu ảnh riêng tư phía máy chủ, tạo liên kết tải theo từng lượt chụp, bổ sung chính sách lưu/xóa ảnh và dịch vụ in.

Các kiểm tra phía JavaScript hiện phục vụ trải nghiệm UI. Khi có backend, phải thực hiện lại kiểm tra ở PHP và thêm ràng buộc dữ liệu tương ứng. Không sử dụng bản demo này như một hệ thống quản lý đã có bảo mật.

## Kiểm thử

Bản đầu đã được kiểm tra cú pháp PHP và chạy luồng end-to-end trên Edge/Chromium. `tests/ui-smoke.cjs` kiểm tra tính giá, chặn chụp trước thanh toán, xuất PNG, trang ảnh, tồn kho, ca trùng, lương, tài khoản, chốt ca, bộ lọc và layout 390px.

Chỉ cần Node.js và Playwright nếu muốn chạy lại kiểm thử tự động (website không cần chúng):

```powershell
$env:PLAYWRIGHT_MODULE = 'đường-dẫn-tới-node_modules\playwright'
node tests/ui-smoke.cjs
```

Máy chủ PHP phải đang chạy trên cổng 8088. Có thể đặt `TEST_BASE_URL` và `BROWSER_CHANNEL` nếu dùng URL hoặc trình duyệt khác. Ảnh kiểm tra được ghi vào `tests/artifacts/`, không phải dữ liệu ứng dụng.

Mã nguồn sử dụng PHP thuần, không có bước build. CSS/JS/PHP đã được định dạng; không chỉnh thư mục `assets/vendor` trừ khi nâng phiên bản thư viện.
