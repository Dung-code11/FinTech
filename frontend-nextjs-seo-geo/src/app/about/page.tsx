import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Về chúng tôi"
};

export default function Page() {
  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: 24 }}>
      <h1>Về chúng tôi</h1>
      <p>Trang này là placeholder. Bạn có thể thay thế bằng nội dung thật hoặc render từ CMS.</p>
    </main>
  );
}

