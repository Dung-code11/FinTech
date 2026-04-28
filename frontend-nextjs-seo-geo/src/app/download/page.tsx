import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tải ứng dụng"
};

export default function Page() {
  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: 24 }}>
      <h1>Tải ứng dụng</h1>
      <p>Trang này là placeholder. Bạn có thể thay thế bằng link thật (App Store/Google Play) hoặc render từ CMS.</p>
    </main>
  );
}

