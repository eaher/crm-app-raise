// components/app-topbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Me = { email?: string | null };

export function AppTopbar() {
  const pathname = usePathname();
  const [me, setMe] = useState<Me>({});

  // Ocultar en la pantalla de login ("/")
  if (pathname === "/") return null;

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : {}))
      .then(setMe)
      .catch(() => {});
  }, []);

  const logout = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    location.href = "/";
  };

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <nav className="flex gap-4 text-sm">
          <Link href="/dashboard">Inicio</Link>
          <Link href="/ventas">Ventas</Link>
          <Link href="/finanzas">Finanzas</Link>
          <Link href="/soporte">Soporte</Link>
          <Link href="/accounting">Accounting</Link>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600">{me.email ?? ""}</span>
          <button
            onClick={logout}
            className="rounded-md border px-3 py-1.5 text-slate-700 hover:bg-slate-50"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
