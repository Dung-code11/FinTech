"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/fintech/hooks/useAuth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { initialLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (initialLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [initialLoading, isAuthenticated, pathname, router]);

  if (initialLoading) return <div style={{ padding: 16 }}>Đang kiểm tra đăng nhập...</div>;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

