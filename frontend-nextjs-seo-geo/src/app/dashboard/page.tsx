import type { Metadata } from "next";

import Dashboard from "@/fintech/entrypoints/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard"
};

export default function Page() {
  return <Dashboard />;
}

