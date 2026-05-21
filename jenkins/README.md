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

## Lỗi `permission denied ... /var/run/docker.sock`

Nếu pipeline báo lỗi kiểu:

- `permission denied while trying to connect to the docker API at unix:///var/run/docker.sock`

Nguyên nhân: user `jenkins` trong container **không có quyền** truy cập Docker socket của host.

Cách khắc phục (khuyến nghị):

1) Lấy GID của docker socket trên host:

```bash
stat -c %g /var/run/docker.sock
```

2) Export biến môi trường trước khi chạy compose (ví dụ GID là `999`):

```bash
export DOCKER_GID=999
docker compose -f jenkins/docker-compose.jenkins.yml up -d --build
```

File `jenkins/docker-compose.jenkins.yml` đã hỗ trợ `group_add: ${DOCKER_GID}` để Jenkins dùng được Docker daemon của host.

Nếu bạn chạy Jenkins bằng Docker Desktop trên Windows/macOS mà vẫn lỗi, hãy kiểm tra permission thật của socket:

```bash
ls -l /var/run/docker.sock
id
```

Nếu socket là `root:root` và quyền quá chặt (ví dụ `srw-------`), cách nhanh nhất cho môi trường local là chạy Jenkins container bằng root bằng cách **uncomment** dòng:

- `user: "0:0"` trong `jenkins/docker-compose.jenkins.yml`

