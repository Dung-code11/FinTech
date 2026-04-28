# Fix guide (bảo trì) - FinTech_NextJS_SEO

Mục tiêu tài liệu: mô tả nhanh cấu trúc repo để dễ bảo trì. Repo này **chỉ** gồm `backend/` và `frontend-nextjs-seo-geo/`.

---

## 1) Tổng quan repo

- `backend/`: Spring Boot API (MySQL, JWT, mail, OpenAPI).
- `frontend-nextjs-seo-geo/`: Next.js App Router cho landing page tối ưu SEO/GEO (metadata, sitemap/robots, JSON-LD, pages theo địa điểm).
- `docker-compose.prod.yml`: stack chạy MySQL + backend + frontend.
- `Jenkinsfile`: test/lint/build trong Docker.

---

## 2) Frontend Next.js (SEO/GEO)

Path gốc: `frontend-nextjs-seo-geo/`

### 2.1 File cấu hình chính

- `frontend-nextjs-seo-geo/package.json`: scripts `dev/build/start/lint/typecheck`.
- `frontend-nextjs-seo-geo/next.config.mjs`: cấu hình Next.js (có `output: "standalone"` để build Docker).
- `frontend-nextjs-seo-geo/.env.example`: biến môi trường mẫu (copy sang `.env.local` khi dev).
- `frontend-nextjs-seo-geo/Dockerfile`: build multi-stage, chạy từ standalone output.
- `frontend-nextjs-seo-geo/docker-compose.prod.yml`: compose riêng cho FE (nếu dùng).

### 2.2 SEO mặc định (App Router)

- `frontend-nextjs-seo-geo/src/app/layout.tsx`: `metadata` global (title template, description, canonical, OG/Twitter, robots).
- `frontend-nextjs-seo-geo/src/app/sitemap.ts`: sitemap động theo chuẩn Next.js.
- `frontend-nextjs-seo-geo/src/app/robots.ts`: robots.txt theo chuẩn Next.js.
- `frontend-nextjs-seo-geo/src/app/opengraph-image.tsx` và `frontend-nextjs-seo-geo/src/app/twitter-image.tsx`: ảnh OG/Twitter bằng `next/og`.
- `frontend-nextjs-seo-geo/src/app/not-found.tsx`: 404 thân thiện.

### 2.3 GEO (landing pages theo địa điểm)

- `frontend-nextjs-seo-geo/src/lib/locations.ts`: danh sách địa điểm (slug -> info).
- `frontend-nextjs-seo-geo/src/app/locations/[slug]/page.tsx`:
  - `generateStaticParams()` tạo trang tĩnh cho từng slug.
  - `generateMetadata()` sinh title/description/canonical + các meta GEO theo slug.

### 2.4 Structured Data (JSON-LD)

- `frontend-nextjs-seo-geo/src/components/json-ld.tsx`: bơm JSON-LD vào `<script type="application/ld+json">`.

### 2.5 Healthcheck

- `frontend-nextjs-seo-geo/src/app/api/health/route.ts`: trả `ok: true` để docker/monitoring check.

### 2.6 Quy ước khi mở rộng để không "gãy SEO"

- Mỗi page mới nên có `metadata` (ít nhất title + description) và canonical hợp lý.
- Tránh `"use client"` nếu không cần (ưu tiên Server Components để giảm JS bundle).
- Khi thêm location: cập nhật `LOCATIONS` và kiểm tra sitemap đã có entry theo slug.

---

## 3) Backend (Spring Boot)

Path gốc: `backend/`

### 3.1 Cấu hình môi trường

- `backend/src/main/resources/application.properties` đọc:
  - `SQL_URL`, `SQL_USERNAME`, `SQL_PASSWORD`
  - `JWT_SECRET_KEY`
  - `MAIL_USERNAME`, `MAIL_PASSWORD`
  - `GEMINI_API_KEY` (optional)
- `backend/src/main/java/com/fintrack/backend/config/DotenvConfig.java` hỗ trợ load `.env` khi chạy local trong thư mục `backend/`.

### 3.2 CORS

- `backend/src/main/java/com/fintrack/backend/config/CorsConfig.java`: whitelist origin cho FE gọi API.

