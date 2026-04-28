import type { Metadata } from "next";

import ForgotPasswordPage from "@/fintech/entrypoints/ForgotPasswordPageClient";

export const metadata: Metadata = {
  title: "Quên mật khẩu"
};

export default function Page() {
  return <ForgotPasswordPage />;
}

