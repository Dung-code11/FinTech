import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Trang liên hệ demo cho FinTrack — tối ưu SEO meta + nội dung rõ ràng."
};

export default function ContactPage() {
  return (
    <>
      <header className="nav">
        <Link className="brand" href="/">
          <span>FinTrack</span>
          <span className="badge">Contact</span>
        </Link>
        <nav className="navLinks" aria-label="Primary">
          <Link className="chip" href="/features">
            SEO/GEO
          </Link>
          <Link className="chip" href="/locations/ho-chi-minh">
            Hồ Chí Minh
          </Link>
        </nav>
      </header>

      <main>
        <h1 className="h1">Liên hệ</h1>
        <div className="card">
          <p className="p">
            Đây là trang demo. Khi triển khai thực tế, bạn có thể render thông tin từ CMS hoặc cấu hình env.
          </p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Email: support@example.com</li>
            <li>Hotline: 0000 000 000</li>
            <li>Địa chỉ: (tuỳ cấu hình theo thành phố)</li>
          </ul>
        </div>
      </main>
    </>
  );
}

