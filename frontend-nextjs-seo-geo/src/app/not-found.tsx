import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <div className="card">
        <h1 className="h1">404 — Không tìm thấy</h1>
        <p className="p">Trang bạn yêu cầu không tồn tại hoặc đã bị thay đổi đường dẫn.</p>
        <div className="ctaRow">
          <Link className="btn btnPrimary" href="/">
            Về trang chủ
          </Link>
          <Link className="btn" href="/features">
            Checklist SEO/GEO
          </Link>
        </div>
      </div>
    </main>
  );
}

