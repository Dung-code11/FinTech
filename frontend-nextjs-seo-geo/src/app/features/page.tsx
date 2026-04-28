import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { getBaseUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tối ưu SEO & GEO",
  description:
    "Checklist SEO/GEO thực chiến cho Next.js: metadata, canonical, OpenGraph, robots/sitemap, structured data, landing pages theo địa điểm."
};

export default function FeaturesPage() {
  const baseUrl = getBaseUrl();

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FinTrack",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <header className="nav">
        <Link className="brand" href="/">
          <span>FinTrack</span>
          <span className="badge">SEO/GEO</span>
        </Link>
        <nav className="navLinks" aria-label="Primary">
          <Link className="chip" href="/locations/ho-chi-minh">
            Pages địa điểm
          </Link>
          <Link className="chip" href="/contact">
            Liên hệ
          </Link>
        </nav>
      </header>

      <main>
        <h1 className="h1">Checklist SEO & GEO (Next.js)</h1>
        <div className="card">
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            <li>
              <strong>Metadata server-side</strong>: <code>metadata</code>, <code>generateMetadata</code>, title template, canonical.
            </li>
            <li>
              <strong>OpenGraph/Twitter</strong>: định nghĩa ở root, có thể override từng page.
            </li>
            <li>
              <strong>Sitemap + robots</strong>: dùng <code>src/app/sitemap.ts</code> và <code>src/app/robots.ts</code>.
            </li>
            <li>
              <strong>Structured data</strong>: JSON-LD cho Organization/WebSite + LocalBusiness theo địa điểm.
            </li>
            <li>
              <strong>GEO (địa lý)</strong>: tạo landing pages theo thành phố (slug), nội dung & metadata khác nhau.
            </li>
            <li>
              <strong>Performance</strong>: App Router SSG/ISR, giảm JS phía client, dùng server components mặc định.
            </li>
          </ol>
        </div>
      </main>

      <JsonLd data={websiteJsonLd} />
    </>
  );
}

