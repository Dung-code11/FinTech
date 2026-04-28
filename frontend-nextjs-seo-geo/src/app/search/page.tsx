import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tìm kiếm",
  description: "Trang tìm kiếm demo.",
  robots: {
    index: false,
    follow: true
  }
};

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;

  return (
    <>
      <header className="nav">
        <Link className="brand" href="/">
          <span>FinTrack</span>
          <span className="badge">Search</span>
        </Link>
        <nav className="navLinks" aria-label="Primary">
          <Link className="chip" href="/features">
            SEO/GEO
          </Link>
          <Link className="chip" href="/contact">
            Liên hệ
          </Link>
        </nav>
      </header>

      <main>
        <h1 className="h1">Tìm kiếm</h1>
        <div className="card">
          <p className="p">
            Từ khoá: <strong>{q?.trim() ? q : "(trống)"}</strong>
          </p>
          <p className="p">
            Gợi ý: trong dự án thật, trang này có thể query backend/CMS. Trang search thường nên <code>noindex</code> để
            tránh trùng lặp nội dung.
          </p>
        </div>
      </main>
    </>
  );
}

