# FinTech Project - Usage

Repo hiện gồm 2 ứng dụng chính:

- `backend/`: Spring Boot (Java 21) API.
- `frontend/`: React + Vite web app.

## 1) Chạy bằng Docker (khuyến nghị)

Yêu cầu: Docker Desktop (có `docker compose`).

1. Tạo file biến môi trường cho Docker Compose:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Build & chạy toàn bộ stack:

```bash
docker compose up -d --build
```

Mặc định:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- MySQL: `localhost:3308` (để debug từ máy host nếu cần)

Dừng stack:

```bash
docker compose down
```

Xoá luôn dữ liệu DB (reset sạch):

```bash
docker compose down -v
```

## 2) Chạy local (không Docker)

### Backend

Yêu cầu: Java 21 + MySQL 8.

1. Tạo `.env`:

```bash
cp backend/.env.example backend/.env
```

2. Cập nhật `backend/.env` (ít nhất: `SQL_URL`, `SQL_USERNAME`, `SQL_PASSWORD`, `JWT_SECRET_KEY`).

3. Chạy:

```bash
cd backend
./mvnw spring-boot:run
```

Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### Frontend

Yêu cầu: Node.js 22+.

1. Tạo `.env`:

```bash
cp frontend/.env.example frontend/.env
```

2. Chạy dev server:

```bash
cd frontend
npm install
npm run dev
```

## 3) CI/CD với Jenkins

Pipeline nằm ở `Jenkinsfile`.

Gợi ý tối thiểu cho Jenkins agent:

- Có Node.js + Java 21 + Docker (nếu bật `DOCKER_BUILD`/`DEPLOY_COMPOSE`).
- Có thể bật các tham số:
  - `RUN_TESTS`: chạy test/lint.
  - `DOCKER_BUILD`: build image.
  - `DEPLOY_COMPOSE`: deploy bằng `docker compose up -d --build` ngay trên agent host.

## 4) Tài liệu bảo trì

Xem `fix_guilde.md` để hiểu cấu trúc thư mục và hướng dẫn bảo trì/mở rộng.

