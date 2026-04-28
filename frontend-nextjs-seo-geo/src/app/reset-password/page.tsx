import type { Metadata } from "next";

import ResetPasswordPage from "@/fintech/entrypoints/ResetPasswordPageClient";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu"
};

export default function Page() {
  return <ResetPasswordPage />;
}

