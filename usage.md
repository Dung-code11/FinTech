# FinTech Mobile + Backend (Usage)

Repo này gồm 2 phần chính:

- `backend/`: Spring Boot (Java 21) cung cấp REST API + JWT + JPA(MySQL) + Mail + OpenAPI.
- `fintech-mobile/`: Expo / React Native (TypeScript). Có thể chạy mobile (Expo Go/dev build) và có thể build web để deploy.

## 1) Chạy local (không Docker)

### Backend

Yêu cầu: Java 21, MySQL 8.x.

1. Tạo DB `fintech` và chỉnh cấu hình kết nối.
2. Cấu hình biến môi trường cho backend (khuyến nghị dùng file `backend/.env`).
3. Chạy:

```bash
cd backend
./mvnw spring-boot:run
```

Windows:

```bat
cd backend
mvnw.cmd spring-boot:run
```

Backend chạy mặc định: `http://localhost:8080`

### Fintech mobile (Expo)

Yêu cầu: Node.js 20+.

1. Cài dependencies:

```bash
cd fintech-mobile
npm ci
```

2. Chạy dev server:

```bash
npx expo start
```

Web (nếu cần test nhanh trên browser):

```bash
npm run web
```

Lưu ý cấu hình API URL nằm trong `fintech-mobile/.env` (các biến `EXPO_API_URL_*`).

## 2) Chạy bằng Docker (FE + BE + MySQL)

Yêu cầu: Docker Desktop + Docker Compose v2.

Chạy toàn bộ stack:

```bash
docker compose up --build
```

Endpoints:

- Backend: `http://localhost:8080`
- Frontend web (build từ Expo): `http://localhost:3000`
- MySQL: `localhost:3308` (mapping từ container `3306`)

### Tuỳ biến biến môi trường cho Docker Compose

Bạn có thể tạo file `.env` ở thư mục gốc (cùng cấp `docker-compose.yml`) để override:

- `MYSQL_ROOT_PASSWORD`
- `JWT_SECRET_KEY`
- `EXPO_API_URL_WEB`, `EXPO_API_URL_ANDROID`, `EXPO_API_URL_IOS`, `EXPO_API_URL_DEVICE`

Ví dụ `.env`:

```env
MYSQL_ROOT_PASSWORD=your_password
JWT_SECRET_KEY=your_jwt_secret
EXPO_API_URL_WEB=http://localhost:8080/api
```

## 3) CI/CD với Jenkins

Pipeline: `Jenkinsfile`

Mặc định pipeline có các stage:

- `Checks` (tuỳ chọn): chạy test backend (spin up MySQL bằng Docker) + lint mobile.
- `Build Images`: build Docker images:
  - `${DOCKER_NAMESPACE}/fintech-backend:${IMAGE_TAG}`
  - `${DOCKER_NAMESPACE}/fintech-frontend:${IMAGE_TAG}`
- `Push Images` (tuỳ chọn): push lên registry (cần cấu hình Jenkins credentials).

Khuyến nghị cấu hình trong Jenkins Job:

- `DOCKER_NAMESPACE` (vd: `yourorg`)
- `DOCKER_CREDENTIALS_ID` (username/password cho registry)
- `MYSQL_ROOT_PASSWORD`, `JWT_SECRET_KEY` (dưới dạng secret text / credentials)

## 4) Tài liệu cấu trúc & bảo trì

Xem `fix_guilde.md`.

