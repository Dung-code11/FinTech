"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/fintech/hooks/useAuth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { initialLoading, isAuthenticated, isAdmin } = useAuth();
  const isAdminUser = isAdmin();

  useEffect(() => {
    if (initialLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!isAdminUser) {
      router.replace("/dashboard");
    }
  }, [initialLoading, isAuthenticated, pathname, router, isAdminUser]);

  if (initialLoading) return <div style={{ padding: 16 }}>Đang kiểm tra quyền truy cập...</div>;
  if (!isAuthenticated) return null;
  if (!isAdminUser) return null;
  return <>{children}</>;
}
