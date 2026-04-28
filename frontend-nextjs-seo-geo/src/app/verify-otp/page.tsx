import type { Metadata } from "next";

import VerifyOTPPage from "@/fintech/entrypoints/VerifyOTPPageClient";

export const metadata: Metadata = {
  title: "Xác thực OTP"
};

export default function Page() {
  return <VerifyOTPPage />;
}

