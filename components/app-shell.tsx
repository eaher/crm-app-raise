// components/app-shell.tsx
"use client";

import { usePathname } from "next/navigation";
import { AppTopbar } from "@/components/app-topbar";

const HIDE_TOPBAR_PATHS = ["/", "/login"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Si estás en "/" o "/login", no mostramos el Topbar
  const showTopbar = !HIDE_TOPBAR_PATHS.includes(pathname);

  return (
    <>
      {showTopbar && <AppTopbar />}
      {children}
    </>
  );
}
