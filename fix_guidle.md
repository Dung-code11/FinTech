# Fix guide (bảo trì) — FinTech_NextJS_SEO

Tài liệu này mô tả cấu trúc & vai trò file/thư mục để dễ bảo trì. Trọng tâm là frontend Next.js mới: `frontend-nextjs-seo-geo/` (không ảnh hưởng thư mục `frontend/` cũ).

---

## 1) Tổng quan repo

- `backend/`: Spring Boot API.
- `frontend/`: React/Vite dashboard (FE gốc).
- `frontend-nextjs-seo-geo/`: Next.js App Router (FE mới) cho landing page tối ưu SEO/GEO.
- `fintech-mobile/`: Expo/React Native.

---

## 2) Frontend Next.js (SEO/GEO) — cấu trúc & chức năng

Path gốc: `frontend-nextjs-seo-geo/`

### 2.1 Các file cấu hình chính

- `frontend-nextjs-seo-geo/package.json`: scripts `dev/build/start/lint`.
- `frontend-nextjs-seo-geo/next.config.mjs`: `output: "standalone"` để đóng gói chạy production trong Docker.
- `frontend-nextjs-seo-geo/.env.example`: biến môi trường mẫu.
- `frontend-nextjs-seo-geo/Dockerfile`: build multi-stage, chạy `node server.js` từ standalone output.
- `frontend-nextjs-seo-geo/docker-compose.prod.yml`: chạy production container, có healthcheck gọi `/api/health`.

### 2.2 App Router (SEO mặc định)

- `frontend-nextjs-seo-geo/src/app/layout.tsx`
  - Khai báo `metadata` global: title template, description, canonical, OpenGraph/Twitter, robots.
  - Đây là “baseline SEO”. Page con có thể override bằng `export const metadata`.
- `frontend-nextjs-seo-geo/src/app/sitemap.ts`
  - Tạo sitemap động chuẩn Next.js (`/sitemap.xml`).
  - Khi thêm page SEO quan trọng, cần cân nhắc thêm entry hoặc đảm bảo page được crawl theo link nội bộ.
- `frontend-nextjs-seo-geo/src/app/robots.ts`
  - Tạo robots chuẩn Next.js (`/robots.txt`).
  - Nếu có route không muốn index, chỉnh rules ở đây hoặc đặt `metadata.robots` theo từng page.
- `frontend-nextjs-seo-geo/src/app/opengraph-image.tsx` và `frontend-nextjs-seo-geo/src/app/twitter-image.tsx`
  - Tạo ảnh OG/Twitter tự động bằng `next/og` (không cần asset tĩnh).
- `frontend-nextjs-seo-geo/src/app/not-found.tsx`
  - Trang 404 thân thiện (tốt cho UX, gián tiếp hỗ trợ SEO).

### 2.3 GEO (landing pages theo địa điểm)

- `frontend-nextjs-seo-geo/src/lib/locations.ts`
  - Danh sách địa điểm (slug -> tên, region, lat/lng).
  - Muốn thêm địa điểm mới: chỉ cần thêm key mới vào `LOCATIONS`.
- `frontend-nextjs-seo-geo/src/app/locations/[slug]/page.tsx`
  - `generateStaticParams()` tạo trang tĩnh cho từng slug (crawl nhanh, ổn định).
  - `generateMetadata()` sinh title/description/canonical + “geo meta” (ICBM, geo.region, geo.placename) theo slug.
  - Render JSON-LD kiểu `LocalBusiness` theo từng địa điểm.

### 2.4 Structured Data (JSON-LD)

- `frontend-nextjs-seo-geo/src/components/json-ld.tsx`
  - Component bơm JSON-LD vào `<script type="application/ld+json">`.
  - Quy ước: mỗi page chỉ nên khai báo 1–2 khối JSON-LD “đủ dùng”, tránh spam.

### 2.5 Healthcheck (Docker/monitoring)

- `frontend-nextjs-seo-geo/src/app/api/health/route.ts`
  - Route đơn giản trả `ok: true` để Docker/monitoring kiểm tra service sống.

---

## 3) Quy ước khi mở rộng (để không “gãy SEO”)

- Mỗi page mới nên có:
  - `export const metadata` (ít nhất title + description).
  - Canonical hợp lý (tránh trùng lặp nội dung).
- Các trang dạng kết quả tìm kiếm / filter:
  - Nên `noindex` (ví dụ đã làm ở `src/app/search/page.tsx`).
- Khi thêm location:
  - Cập nhật `LOCATIONS` và kiểm tra sitemap đã tự thêm theo slug.
- Tránh dùng `"use client"` nếu không cần:
  - Ưu tiên Server Components để giảm JS bundle và tăng điểm Core Web Vitals.

