# Fix / Guide (Cấu trúc thư mục & Bảo trì)

Tài liệu này mô tả:

1. Chức năng từng phần trong cấu trúc thư mục.
2. Quy ước bảo trì (thêm tính năng, sửa lỗi, vận hành).
3. Gợi ý CI/CD (Jenkins + Docker).

---

## 1) Tổng quan cấu trúc thư mục (root)

| Path | Mục đích |
| --- | --- |
| `backend/` | Spring Boot API (Java 21) |
| `fintech-mobile/` | Expo / React Native app (TypeScript) |
| `.github/` | Thư mục phục vụ tooling nội bộ (không phải logic sản phẩm) |
| `docker-compose.yml` | Orchestrate MySQL + backend + frontend(web) |
| `Jenkinsfile` | Pipeline Jenkins CI/CD |
| `usage.md` | Hướng dẫn chạy nhanh |
| `fix_guilde.md` | Tài liệu này |

---

## 2) Backend (`backend/`)

### 2.1 Điểm vào ứng dụng

- `backend/src/main/java/com/fintrack/backend/BackendApplication.java`: entry point khởi động Spring Boot.

### 2.2 Cấu hình

- `backend/src/main/java/com/fintrack/backend/config/`
  - `CorsConfig.java`: cấu hình CORS để FE/mobile gọi API.
  - `SecurityConfig.java`: cấu hình Spring Security + JWT filter.
  - `DotenvConfig.java`: nạp cấu hình từ `.env` và/hoặc từ environment variables.

Khuyến nghị bảo trì:

- Ưu tiên config qua environment variables trong môi trường CI/CD/production.
- Không commit secret thật lên git (JWT secret, mail password, API key).

### 2.3 Các lớp theo tầng

| Folder | Vai trò |
| --- | --- |
| `controller/` | REST endpoints (nhận request/response, validate, gọi service) |
| `service/` | Business logic, transaction boundary, orchestration |
| `repository/` | JPA repositories (CRUD DB) |
| `model/` | Entity (bảng DB), quan hệ JPA |
| `dto/` | Request/Response DTO (payload API) |
| `mapper/` | Map entity -> DTO response |
| `exception/` | Exception + handler (nếu có) |
| `specification/` | Dynamic query (JPA Specification) |
| `util/` / `common/` | Helpers, constants |
| `sercurity/` | (Tên folder đang bị typo) các phần liên quan bảo mật/JWT (nếu có) |

### 2.4 Quy trình thêm tính năng (backend)

1. Xác định API: method + path + request/response.
2. Tạo/điều chỉnh DTO trong `dto/`.
3. Implement service trong `service/`.
4. Nếu cần DB: update entity trong `model/` + repository trong `repository/`.
5. Wire vào `controller/`.
6. (Khuyến nghị) thêm test/coverage cho service/controller.

### 2.5 Database & migration

Hiện tại `spring.jpa.hibernate.ddl-auto=update` (auto update schema).

Khuyến nghị khi đưa production:

- Dùng migration tool (Flyway/Liquibase) để quản lý version schema, rollback, và CI/CD an toàn.

---

## 3) Mobile/Web (`fintech-mobile/`)

### 3.1 Các phần chính

| Path | Vai trò |
| --- | --- |
| `fintech-mobile/src/app/` | Routing theo file (expo-router): màn hình, layout, tabs |
| `fintech-mobile/src/features/` | Module theo nghiệp vụ (auth, dashboard, wallets, transactions, …) |
| `fintech-mobile/src/services/` | Gọi API (axios), service wrappers theo domain |
| `fintech-mobile/src/components/` | UI components dùng lại |
| `fintech-mobile/src/providers/` | Context providers (session, theme, …) |
| `fintech-mobile/src/hooks/` | Custom hooks (useAuth, useTheme, …) |
| `fintech-mobile/src/utils/` | Helpers (format, storage, …) |
| `fintech-mobile/src/types/` | Types/DTO cho FE |
| `fintech-mobile/src/constants/` | Theme/colors/constants |

### 3.2 Cấu hình API URL

File: `fintech-mobile/.env`

- `EXPO_API_URL_WEB`
- `EXPO_API_URL_ANDROID` (emulator)
- `EXPO_API_URL_IOS`
- `EXPO_API_URL_DEVICE` (máy thật cùng LAN)

Logic chọn base URL: `fintech-mobile/src/services/api.ts` (dựa theo `Platform` + `Device.isDevice`).

### 3.3 Quy trình thêm màn hình/tính năng (mobile)

1. Tạo route trong `src/app/` (hoặc thêm vào tabs/auth group).
2. Tạo module nghiệp vụ trong `src/features/<feature>/`.
3. Tạo API wrappers trong `src/services/` (theo backend endpoints).
4. Reuse UI components trong `src/components/`.
5. Update types trong `src/types/` nếu cần.

---

## 4) Docker

### 4.1 Files liên quan

- `backend/Dockerfile`, `backend/.dockerignore`
- `fintech-mobile/Dockerfile`, `fintech-mobile/nginx.conf`, `fintech-mobile/.dockerignore`
- `docker-compose.yml`

### 4.2 Nguyên tắc vận hành

- Backend: khuyến nghị truyền config qua environment variables (CI/CD/production).
- Frontend (Expo web export): API URL cho web là *build-time* (được inject qua Docker build args).

---

## 5) Jenkins CI/CD

File pipeline: `Jenkinsfile`

### 5.1 Những thứ cần chuẩn bị trên Jenkins agent

- Docker Engine + quyền chạy `docker`.
- Node.js 20+ (nếu bật stage lint frontend).
- Java 21 (nếu chạy `mvnw test` trực tiếp trên agent).

### 5.2 Cấu hình khuyến nghị

- Đặt `DOCKER_NAMESPACE` theo org của bạn.
- Bật `PUSH_IMAGES=true` và set `DOCKER_CREDENTIALS_ID` khi muốn push image.
- Đưa secret ra Jenkins Credentials (không hardcode trong repo):
  - `MYSQL_ROOT_PASSWORD`
  - `JWT_SECRET_KEY`
  - `MAIL_USERNAME`, `MAIL_PASSWORD`, `GEMINI_API_KEY` (nếu dùng)

---

## 6) Checklist bảo trì

- Rotate secrets định kỳ (JWT, mail, API keys).
- Backup DB theo lịch (volume `mysql_data`).
- Theo dõi log (backend) và metrics (nếu có).
- Update dependencies theo chu kỳ, ưu tiên các bản vá security.
- Khi sửa lỗi API: luôn kiểm tra ảnh hưởng tới mobile (services/types).

