import type { Metadata } from "next";

import AdminDashboard from "@/fintech/entrypoints/AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin Dashboard"
};

export default function Page() {
  return <AdminDashboard />;
}

