import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import LandingPage from "@/fintech/entrypoints/LandingPageClient";
import { getBaseUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "FinTrack — FinTech cá nhân",
  description:
    "Theo dõi chi tiêu, ngân sách, nợ và tiết kiệm. Frontend production viết bằng Next.js để tối ưu SEO/GEO.",
  alternates: {
    canonical: "/"
  }
};

export default function HomePage() {
  const baseUrl = getBaseUrl();

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FinTrack",
    url: baseUrl,
    description:
      "Sản phẩm FinTech cá nhân: theo dõi chi tiêu, ngân sách, tiết kiệm, nợ; frontend Next.js tối ưu SEO/GEO.",
    sameAs: []
  };

  return (
    <>
      <LandingPage />
      <JsonLd data={orgJsonLd} />
    </>
  );
}
