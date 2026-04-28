import type { Metadata } from "next";

import LoginPage from "@/fintech/entrypoints/LoginPageClient";

export const metadata: Metadata = {
  title: "Đăng nhập"
};

export default function Page() {
  return <LoginPage />;
}

