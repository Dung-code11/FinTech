# Jenkins (CI/CD)

## Chạy Jenkins bằng Docker (trên Linux server)

1. Ở thư mục root repo:

```bash
docker compose -f jenkins/docker-compose.jenkins.yml up -d --build
```

2. Mở Jenkins:

- `http://<server-ip>:8081`

3. Tạo Pipeline job trỏ tới `Jenkinsfile` ở root repo.

---

## Pipeline hiện có (theo `Jenkinsfile`)

- Backend: chạy test bằng Maven Wrapper trong container `maven:3.9-eclipse-temurin-21`.
- Frontend: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build` trong container `node:20-alpine` (thư mục `frontend-nextjs-seo-geo/`).
- Docker: build image backend + frontend (Next.js) với build-args:
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_API_BASE_URL`

---

## Deploy (tuỳ chọn)

Stage deploy chỉ chạy khi branch là `main` và hiện đang để dạng "gợi ý".

Muốn bật deploy:

- Tạo Jenkins credential SSH (ví dụ id: `deploy-ssh-key`).
- Thiết lập env `DEPLOY_HOST`, `DEPLOY_USER` trong Jenkins job/global env.
- Bỏ comment block deploy trong `Jenkinsfile` và đảm bảo server đã có:
  - `docker-compose.prod.yml`
  - file `.env` tương ứng (có thể copy từ `.env.example`)

