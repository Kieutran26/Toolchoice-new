# Quản trị Toolchoice

Mở `/Admin` và đăng nhập tài khoản quản trị. API riêng trên Cloudflare xác thực mọi thao tác ghi; trình duyệt không giữ khóa Supabase hoặc R2. Phiên hết hạn sau bốn giờ.

## Thêm công cụ

Chọn thêm tool, dán link đầy đủ và tải ảnh PNG, JPEG, WebP hoặc GIF (tối đa 10 MB). Khi bật tự động, Workers AI đọc trang chính cùng tối đa hai trang thông tin liên quan để đề xuất tên, mô tả ngắn, mô tả dài, danh mục, ưu điểm và loại giá. Có thể chạy lại bằng nút phân tích.

Có thể copy ảnh rồi dán bằng Ctrl+V (Mac: Command+V) trong vùng nhập nhanh hoặc ô logo/gallery. Khi thay ảnh lỗi, bấm nút **Dán ảnh · Ctrl+V** ở đúng dòng rồi dán. Ảnh được upload và kiểm tra như khi chọn file; dán văn bản/link vẫn hoạt động bình thường.

Kiểm tra bản nháp trước khi lưu. Nếu website chặn truy cập hoặc nội dung không đủ, nhập thủ công. Giá không xác định cần được chọn lại. AI không tự tạo mã giảm giá.

Link referral được giữ nguyên; các tham số phổ biến như `ref`, `referral`, `via`, `affiliate` được tách vào `referral_code` và `referral_parameter`. Mã `coupon`, `discount`, `promo` được điền vào `promotion_code`. Có thể chỉnh lại các trường trước khi lưu.

## Kiểm tra ảnh

Admin tự quét khi mở trang và có nút quét lại/dừng. Kiểm tra toàn bộ logo/gallery của tools, ảnh bài viết (banner, avatar, ảnh trong nội dung), logo deals và logo website. Trình duyệt thử hiển thị ảnh; API kiểm tra bổ sung khi ảnh không tải được. Phân biệt file hỏng, ảnh thiếu và lỗi mạng/chặn truy cập, kể cả phản hồi HTTP 200 có nội dung ảnh không hợp lệ.

Tải ảnh thay thế ngay trên dòng lỗi. Chỉ trường tương ứng được đổi; các ảnh khác trong gallery được giữ lại. Nếu dữ liệu đã đổi trong lúc quét, cần quét lại. Logo website tĩnh được sửa trong mã nguồn. Việc quét chạy khi admin mở, không phải lịch nền định kỳ.

## Cấu hình

API đang chạy: `https://toolchoice-admin-api.nguyenngockieutran.workers.dev`. Cấu hình: `workers/admin-api/wrangler.toml`; frontend: `VITE_ADMIN_API_URL`. Worker cần bindings AI, BROWSER, BUCKET và hai bộ giới hạn yêu cầu. Browser Run đọc trang chạy JavaScript khi HTML ban đầu không có đủ nội dung, chỉ cho phép tài nguyên cùng origin. Bí mật server: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`. Không đặt bí mật vào biến `VITE_*`.

Mật khẩu dùng PBKDF2 SHA-256, 100.000 vòng, định dạng `salt:hash` từ hàm `passwordHash` trong `workers/admin-api/src/auth.js`. Cấu hình `ALLOWED_ORIGINS` đúng địa chỉ frontend. Chạy migration `supabase/migrations/20261005_add_tool_referral_fields.sql` trước khi dùng; migration này đã được áp dụng cho dự án hiện tại.

Chạy kiểm tra: `node --test workers/admin-api/test/*.test.js`, `npm run lint`, `npm run build`. Triển khai Worker bằng Cloudflare API hoặc Wrangler; frontend theo quy trình triển khai hiện có.
