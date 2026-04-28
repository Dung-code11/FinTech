import type { Metadata } from "next";
import "./globals.css";

import { getBaseUrl } from "@/lib/site";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "FinTrack — FinTech cá nhân",
    template: "%s | FinTrack"
  },
  description:
    "Theo dõi chi tiêu, ngân sách, nợ, tiết kiệm và dòng tiền theo cách nhanh, rõ ràng, tối ưu SEO/GEO cho landing page.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    siteName: "FinTrack",
    title: "FinTrack — FinTech cá nhân",
    description:
      "Landing page Next.js tối ưu SEO/GEO: metadata, sitemap, robots, structured data, pages theo địa điểm.",
    url: "/",
    locale: "vi_VN"
  },
  twitter: {
    card: "summary_large_image",
    title: "FinTrack — FinTech cá nhân",
    description:
      "Landing page Next.js tối ưu SEO/GEO: metadata, sitemap, robots, structured data, pages theo địa điểm."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
