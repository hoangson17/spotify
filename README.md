# Spotify clone

React/Vite frontend và NestJS backend, dùng MySQL, Redis và SMTP.

## Chạy local

Backend đọc cấu hình từ `backend/.env`. Cần cấu hình:

- Database: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- Redis: `REDIS_HOST`, `REDIS_PORT`; cache phiên, cache tìm kiếm, bộ đếm throttler và BullMQ dùng chung cấu hình này. Cache tìm kiếm mặc định giữ 60 giây; có thể đổi bằng `CACHE_TTL_SECONDS` (tối đa 86400 giây) và `CACHE_PREFIX`. Key throttler dùng prefix `THROTTLE_REDIS_PREFIX` (mặc định `spotify:throttle`).
- Rate limit: toàn API mặc định 100 request trong 60 giây cho mỗi IP. Có thể đổi bằng `THROTTLE_LIMIT` và `THROTTLE_TTL_SECONDS`. Nếu backend chạy sau reverse proxy trên cùng máy, đặt `TRUST_PROXY=loopback` để nhận đúng IP client.
- JWT: `JWT_SECRET`, `JWT_TOKEN_EXPIRED` (ví dụ `15m`), `JWT_REFRESH_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_EXPIRED` (ví dụ `7d`). Dùng hai secret riêng.
- Email: `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_HOST`, `MAIL_FROM`, `MAIL_FROM_NAME`.
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_SECRET_ID`, `GOOGLE_CALLBACK_URL` (backend `/auth/google/callback`), `GOOGLE_FRONTEND_URL` (frontend `/auth/google/callback`).
- `PORT` mặc định là `3000`.

Chỉ đặt `DB_NODE_ENV=development` trên database phát triển nếu muốn TypeORM tự đồng bộ schema. Khi thiếu biến này hoặc chạy production, tự đồng bộ schema bị tắt; cần chuẩn bị schema trước khi chạy.

Các khóa chính và khóa ngoại của catalog, tài khoản, playlist và follower dùng UUID. Nếu database đã tồn tại từ phiên bản dùng ID số, hãy sao lưu rồi migrate dữ liệu/khóa ngoại hoặc tạo lại database phát triển trước khi khởi động backend; không bật `synchronize` trên database production để tự chuyển kiểu khóa.

Frontend đọc `VITE_SERVER_API` từ `frontend/.env`, ví dụ `http://localhost:3000`.

Trong hai terminal PowerShell riêng:

```powershell
cd backend
npm.cmd run start:dev
```

```powershell
cd frontend
npm.cmd run dev
```

## Kiểm tra

Trong `backend`:

```powershell
npm.cmd test -- --runInBand
npm.cmd run build
```

Trong `frontend`:

```powershell
npm.cmd test
npm.cmd run build
```

Các test hồi quy dùng database, Redis và HTTP adapter giả lập; không yêu cầu dịch vụ ngoài. Test e2e cũ trong `backend/test` cần MySQL/Redis/SMTP đã cấu hình.

## Hành vi xác thực và API

- Mỗi tài khoản có một phiên hoạt động. Đăng nhập mới thay phiên cũ. Refresh giữ nguyên phiên; logout, đổi mật khẩu hoặc khóa tài khoản thu hồi phiên.
- Sau khi nâng cấp từ cơ chế token cũ, đăng nhập lại để nhận token có session ID.
- Đăng ký tạo tài khoản user; không tự đăng nhập. Chỉ super admin được đổi role user/admin. Không API nào cấp role super admin.
- `PATCH /user/:id` và `PATCH /auth/profile/:id` chỉ cho chủ tài khoản hoặc admin. Trường ngoài danh sách cho phép bị trả lỗi `400`.
- Artist, album và track chỉ cho admin tạo/sửa/xóa. Liked tracks yêu cầu đăng nhập và kiểm tra chủ tài khoản.
- Tạo playlist chỉ gửi `title`, `description`, `is_public` và file `cover_image` nếu có. Chủ sở hữu lấy từ phiên đăng nhập. Không gửi `user_id`, `users` hoặc `user_Id`.
- Playlist riêng tư chỉ chủ sở hữu và admin xem được; chỉ chủ sở hữu hoặc admin được sửa nội dung.
- Xóa một số bài: `PATCH /playlist-track/remove/:userId` với `{ "playlistId": 1, "trackIds": [2, 3] }`. Sync chấp nhận `trackIds: []` để xóa hết bài.
- Google callback dùng state gắn với cookie và mã trao đổi một lần, thời hạn 60 giây. Frontend gửi `{ "code": "..." }` tới `POST /auth/google/callback`; token Google không nằm trên URL frontend.
- Upload ảnh JPG/PNG/WebP/GIF mặc định tối đa 10 MB; MP3 mặc định tối đa 100 MB mỗi file. Áp dụng giới hạn ảnh cả khi tải ảnh bìa cùng MP3. File mới được dọn khi request thất bại. Template email được copy khi build backend.

Giới hạn upload có thể đổi bằng `UPLOAD_MAX_IMAGE_MB` (1–100 MB) và `UPLOAD_MAX_AUDIO_MB` (1–1024 MB) trong `backend/.env`, sau đó khởi động lại backend. Frontend lấy giới hạn từ `GET /upload-limits`, kiểm tra trước khi gửi và dành tối đa 120 giây cho request có file. Nếu vượt giới hạn, API trả `413` kèm thông báo dung lượng, giao diện hiển thị lỗi cụ thể. JSON và các trường text vẫn có giới hạn riêng; tăng giới hạn ảnh/MP3 không mở rộng parser JSON. Nếu triển khai qua reverse proxy, giới hạn tổng request của proxy cũng phải đủ cho MP3 + ảnh bìa + phần multipart.

## Super admin riêng

Trong `backend/.env`, cấu hình `SUPER_ADMIN_NAME`, `SUPER_ADMIN_EMAIL` và `SUPER_ADMIN_PASSWORD` (ít nhất 12 ký tự, tối đa 72 byte). Không commit file `.env`.

Sau khi đã có database và bảng `users`, chạy trong thư mục `backend` với Node.js 22:

```powershell
npm.cmd run seed:super-admin -- --check
npm.cmd run seed:super-admin
```

Lệnh đầu chỉ kiểm tra cấu hình. Lệnh sau bổ sung giá trị `super_admin` vào enum `users.role` nếu cần rồi tạo tài khoản riêng với mật khẩu bcrypt. Không cần chạy cả ứng dụng, SMTP hay Redis. Chạy lại không thay mật khẩu và không tự nâng quyền tài khoản có cùng email. Nếu đã có một super admin khác, lệnh dừng và giữ nguyên các tài khoản.

Khởi động lại backend để nạp cấu hình mới. Super admin đăng nhập bằng email/mật khẩu tại `/login`, sau đó vào `/admin`. Google login không được dùng cho tài khoản này. Email đã cấu hình được dành riêng, không thể đăng ký qua API công khai.

Super admin có toàn bộ quyền quản lý nội dung và cấp/gỡ admin. Admin thường chỉ quản lý tài khoản user; không sửa tài khoản admin khác hay super admin. Super admin chỉ tự sửa hồ sơ và mật khẩu của mình; không thể bị khóa, xóa hoặc hạ quyền qua API. Email super admin không đổi qua API. Thay đổi `SUPER_ADMIN_PASSWORD` trong `.env` rồi chạy lại lệnh seed không đặt lại mật khẩu đã có; đổi mật khẩu qua hồ sơ sau khi đăng nhập.

Test lệnh khởi tạo bằng `npm.cmd run test:super-admin`.

## Phân quyền admin thường (RBAC)

Chạy `npm.cmd run migrate:rbac` trong `backend` trước khi chạy phiên bản có RBAC. Lệnh chỉ bổ sung cột `users.permissions` nếu chưa có; không ghi đè quyền đã lưu. Admin chưa được cấp quyền có danh sách quyền rỗng, không tự động có toàn quyền.

Đăng nhập super admin, vào **Trang quản trị → Phân quyền admin** (`/admin/permissions`), chọn admin ở bên trái và tick quyền cho từng chức năng. Có thể đi từ nút **RBAC** tại danh sách người dùng. Nếu chưa có admin thường, đổi vai trò một user thành Admin trước. Chọn **Lưu quyền** để áp dụng; phiên hiện tại của admin được thu hồi, admin cần đăng nhập lại.

- Bài hát, nghệ sĩ, album, playlist: Xem, Tạo, Sửa, Xóa.
- Người dùng: Xem, Sửa, Khóa, Khôi phục, Xóa vĩnh viễn.
- Quyền thao tác tự đi kèm quyền xem cùng nhóm. Chỉ super admin được phân quyền hoặc cấp/gỡ role admin.
- Frontend giới hạn menu, trang và nút thao tác; backend kiểm tra từng API, không dựa vào quyền gửi từ client. Quyền quản trị không thay quyền cá nhân: người dùng vẫn quản lý playlist của chính mình và đọc nội dung công khai.
- Đổi role sẽ xóa quyền quản trị đã cấp trước đó, tránh khôi phục quyền cũ khi nâng lại thành admin.

API cho super admin: `GET /user/permission-catalog`, `GET /user/admins`, `PUT /user/:id/permissions` với body `{ "permissions": ["tracks:read", "tracks:create"] }`. Không nhận quyền qua endpoint hồ sơ/đăng ký. `rbac:manage` chỉ dành cho super admin và không thể gán cho admin thường.

Test migration bằng `npm.cmd run test:rbac`; test phân quyền API nằm trong bộ test backend.
