# Jenkins (CI/CD)

## Chạy Jenkins bằng Docker (trên Linux server)

1. Tại thư mục repo:
   - `docker compose -f jenkins/docker-compose.jenkins.yml up -d --build`
2. Mở Jenkins:
   - `http://<server-ip>:8081`
3. Tạo Pipeline job và trỏ tới `Jenkinsfile` ở root repo.

## Gợi ý tối thiểu để giảm lỗi khi deploy

- Pipeline đã có các bước:
  - Backend: chạy `mvn test`
  - Frontend: `npm ci`, `npm run lint`, `npm run build`
  - Build Docker images
- Muốn bật deploy tự động:
  - Tạo credential SSH trong Jenkins (ví dụ id: `deploy-ssh-key`)
  - Thêm env `DEPLOY_HOST`, `DEPLOY_USER`
  - Bỏ comment phần deploy trong `Jenkinsfile` và đảm bảo server có sẵn `docker-compose.prod.yml` + `.env`.

