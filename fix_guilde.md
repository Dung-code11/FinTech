# FinTech Project - Maintenance & Folder Guide

Tài liệu này mô tả chức năng từng phần trong cấu trúc thư mục và cách bảo trì/mở rộng dự án.

## 1) Cấu trúc thư mục gốc

| Path | Chức năng |
| --- | --- |
| `.github/java-upgrade/` | Script/hook nội bộ hỗ trợ nâng cấp Java (không phải logic sản phẩm). |
| `backend/` | Spring Boot API (Java 21). |
| `frontend/` | React/Vite web app (build ra static assets). |
| `docker-compose.yml` | Orchestrate local stack: `db` (MySQL) + `backend` + `frontend`. |
| `.env.example` | Biến môi trường cho Docker Compose (copy sang `.env`). |
| `Jenkinsfile` | Jenkins pipeline cho CI/CD. |
| `usage.md` | Hướng dẫn chạy dự án (Docker + local). |

## 2) Backend (`backend/`)

### 2.1 Các file chính

| Path | Chức năng |
| --- | --- |
| `backend/pom.xml` | Dependency + build Spring Boot. |
| `backend/.env` | Biến môi trường local (không commit). |
| `backend/.env.example` | Mẫu `.env` (không chứa secret thật). |
| `backend/Dockerfile` | Build jar và chạy bằng Java 21 JRE. |
| `backend/src/main/resources/application.properties` | Cấu hình Spring, datasource, mail, gemini key. |

### 2.2 Package chính

Trong `backend/src/main/java/com/fintrack/backend/`:

| Folder | Chức năng |
| --- | --- |
| `config/` | Cấu hình Spring (CORS, security, dotenv…). |
| `controller/` | REST API layer (mapping request/response). |
| `service/` | Business logic, xử lý nghiệp vụ. |
| `repository/` | Data access layer (JPA repositories). |
| `model/` | Entity/Model (JPA). |
| `dto/` | DTO request/response (payload). |
| `mapper/` | Mapping entity ↔ DTO response. |
| `enums/` | Enum dùng chung (role, type…). |
| `exception/` | Exception + handler (nếu có). |
| `specification/` | JPA specification/filter nâng cao (nếu dùng). |
| `util/` | Helpers/tiện ích chung. |
| `common/` | Const/response wrapper (tuỳ dự án). |
| `sercurity/` | (Tên folder đang bị typo) logic liên quan security nếu dự án đang dùng. |

### 2.3 Quy ước bảo trì backend (khuyến nghị)

- Thêm API mới: tạo `controller` → `service` → `repository` → `dto`/`mapper`.
- Tránh viết logic nghiệp vụ trong `controller`.
- Khi thêm biến môi trường mới:
  - Ưu tiên đọc qua placeholder trong `application.properties` (ví dụ `${NEW_KEY:}`).
  - Nếu cần `.env` local: thêm vào `backend/.env.example`.
- Không commit secret: mật khẩu mail, key AI, mật khẩu DB production.

## 3) Frontend (`frontend/`)

### 3.1 Các file chính

| Path | Chức năng |
| --- | --- |
| `frontend/package.json` | Script `dev/build/lint/preview`. |
| `frontend/.env` | Biến môi trường local (không commit). |
| `frontend/.env.example` | Mẫu env (chỉ config public, không chứa secret). |
| `frontend/vite.config.js` | Cấu hình Vite. |
| `frontend/Dockerfile` | Build static assets và serve bằng Nginx. |
| `frontend/nginx.conf` | Reverse proxy `/api/` sang `backend:8080` + SPA fallback. |

### 3.2 Folder chính

Trong `frontend/src/`:

| Folder | Chức năng |
| --- | --- |
| `pages/` | Màn hình/route level. |
| `components/` | UI components tái sử dụng. |
| `services/` | Gọi API, xử lý dữ liệu từ backend. |
| `context/` | State global (React context). |
| `hooks/` | Custom hooks. |
| `utils/` | Helpers/formatters. |
| `config/` | Cấu hình (base URL, constants…). |
| `assets/` | Ảnh/icon/static assets. |
| `css/` | CSS/global styles. |

### 3.3 Quy ước bảo trì frontend (khuyến nghị)

- Không hardcode base URL: dùng `VITE_BACKEND_API_URL`.
- Tách “API layer” trong `services/` (không gọi fetch/axios rải rác trong UI).
- Khi đổi endpoint backend: cập nhật một chỗ trong `services/`/`config/`.

## 4) Docker hoá (FE/BE + DB)

### 4.1 Luồng hoạt động

- `frontend` chạy Nginx và proxy `/api/*` sang `backend`.
- `backend` kết nối MySQL service `db` trong network compose.

### 4.2 Các file liên quan

- `docker-compose.yml`: định nghĩa `db`, `backend`, `frontend`.
- `backend/Dockerfile`: build jar bằng Maven Wrapper → chạy bằng JRE.
- `frontend/Dockerfile`: build Vite → copy `dist/` sang Nginx.
- `.env.example`: biến cấu hình cho compose (copy sang `.env`).

## 5) Jenkins CI/CD

`Jenkinsfile` hiện gồm:

- Build backend (test + package).
- Build frontend (npm ci + lint + build).
- (Tuỳ chọn) build Docker images.
- (Tuỳ chọn) deploy với `docker compose`.

Khuyến nghị vận hành Jenkins:

- Jenkins agent có Docker socket (nếu deploy/build image).
- Dùng Jenkins Credentials cho registry (nếu muốn push images) và tách stage push riêng theo nhu cầu.

## 6) Checklist bảo trì định kỳ

- Backend: update dependency trong `backend/pom.xml`, chạy `./mvnw -B test`.
- Frontend: update dependency, chạy `npm run lint` + `npm run build`.
- Rotate secrets nếu lộ/đã commit nhầm.
- Dọn artefact: không commit `backend/target/`, `frontend/node_modules/`, `frontend/dist/`.

