import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { LOCATIONS, type LocationSlug } from "@/lib/locations";
import { getBaseUrl } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return Object.keys(LOCATIONS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const loc = LOCATIONS[slug as LocationSlug];
  if (!loc) return {};

  const title = `FinTrack tại ${loc.name}`;
  const description = `Landing page FinTech cho ${loc.name}: theo dõi chi tiêu, ngân sách, tiết kiệm. Tối ưu SEO/GEO theo địa điểm.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/locations/${slug}`
    },
    other: {
      "geo.region": loc.region,
      "geo.placename": loc.name,
      ICBM: `${loc.lat}, ${loc.lng}`
    },
    openGraph: {
      title,
      description,
      url: `/locations/${slug}`
    }
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;
  const loc = LOCATIONS[slug as LocationSlug];
  if (!loc) notFound();

  const baseUrl = getBaseUrl();

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `FinTrack — ${loc.name}`,
    url: `${baseUrl}/locations/${slug}`,
    areaServed: loc.name,
    address: {
      "@type": "PostalAddress",
      addressLocality: loc.name,
      addressRegion: loc.region,
      addressCountry: "VN"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: loc.lat,
      longitude: loc.lng
    }
  };

  return (
    <>
      <header className="nav">
        <Link className="brand" href="/">
          <span>FinTrack</span>
          <span className="badge">Geo page</span>
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
        <h1 className="h1">FinTrack tại {loc.name}</h1>
        <div className="card">
          <p className="p">
            Trang này minh hoạ GEO (tối ưu theo địa điểm). Nội dung, metadata, canonical, OpenGraph và schema.org đều
            khác theo thành phố.
          </p>
          <div className="grid" role="list" aria-label="Geo details">
            <div className="kpi" role="listitem">
              <strong>{loc.region}</strong>
              <span>Vùng/miền</span>
            </div>
            <div className="kpi" role="listitem">
              <strong>
                {loc.lat}, {loc.lng}
              </strong>
              <span>Tọa độ (ICBM)</span>
            </div>
            <div className="kpi" role="listitem">
              <strong>/locations/{slug}</strong>
              <span>Canonical</span>
            </div>
          </div>
        </div>
      </main>

      <JsonLd data={localBusinessJsonLd} />
    </>
  );
}

