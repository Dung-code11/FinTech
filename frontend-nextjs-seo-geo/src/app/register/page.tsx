import type { Metadata } from "next";

import RegisterPage from "@/fintech/entrypoints/RegisterPageClient";

export const metadata: Metadata = {
  title: "Đăng ký"
};

export default function Page() {
  return <RegisterPage />;
}

