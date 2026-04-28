# FinTech_NextJS_SEO - Usage

Repo này **chỉ** gồm:

- `backend/`: Spring Boot API (Java 21, MySQL).
- `frontend-nextjs-seo-geo/`: Next.js (App Router) cho landing page tối ưu SEO/GEO.

---

## 1) Chạy nhanh (Docker Compose - khuyến nghị)

1. Tạo file `.env` ở root (có thể copy từ `.env.example`):

   - `MYSQL_ROOT_PASSWORD`, `JWT_SECRET_KEY` nên đổi giá trị thật.
   - `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_BASE_URL` dùng cho build-time của Next.js.

2. Chạy:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

3. Truy cập:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- Healthcheck FE: `http://localhost:3000/api/health`

---

## 2) Chạy local để dev (không cần Docker)

### 2.1 Backend (Spring Boot)

Yêu cầu: Java 21, MySQL đang chạy.

Backend lấy config DB/JWT từ **biến môi trường** hoặc file `.env` (khi chạy trong thư mục `backend/`).

Ví dụ `backend/.env`:

```env
SQL_URL=jdbc:mysql://localhost:3306/fintech?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SQL_USERNAME=root
SQL_PASSWORD=change-me
JWT_SECRET_KEY=change-me
MAIL_USERNAME=
MAIL_PASSWORD=
GEMINI_API_KEY=
```

Chạy:

```bash
cd backend
./mvnw spring-boot:run
```

### 2.2 Frontend (Next.js SEO/GEO)

Yêu cầu: Node.js 20+ (khuyến nghị), npm.

Tạo env local:

```bash
cd frontend-nextjs-seo-geo
cp .env.example .env.local
```

Chạy dev:

```bash
npm install
npm run dev
```

---

## 3) Cấu trúc repo

| Path | Vai trò |
| --- | --- |
| `backend/` | Spring Boot API. |
| `frontend-nextjs-seo-geo/` | Next.js App Router (SEO/GEO). |
| `docker-compose.prod.yml` | Chạy MySQL + backend + frontend (production-like). |
| `.env.example` | Mẫu biến môi trường cho compose/build. |
| `Jenkinsfile` | Pipeline test/lint/build + build Docker images. |
| `jenkins/` | Docker compose để dựng Jenkins. |
| `fix_guidle.md` | Ghi chú bảo trì/cấu trúc. |

---

## 4) CI/CD (Jenkins)

Xem `jenkins/README.md`.

