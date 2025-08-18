"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

declare global {
  interface Window {
    google?: any;
  }
}

export function LoginForm() {
  const btnRef = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // Cargar Google Identity Services
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (resp: any) => {
          try {
            const r = await fetch("/api/auth/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential: resp.credential }),
            });
            if (!r.ok) {
              const data = await r.json().catch(() => ({}));
              setMsg(data?.error || "Acceso denegado.");
              return;
            }
            // Redirige a la ruta solicitada originalmente o al home
            const p = new URLSearchParams(location.search);
            const redirect = p.get("redirect") || "/";
            location.href = redirect;
          } catch {
            setMsg("Error de conexión. Intenta de nuevo.");
          }
        },
      });

      // Render del botón oficial de Google (texto oscuro, fondo blanco)
      if (btnRef.current) {
        window.google?.accounts.id.renderButton(btnRef.current, {
          type: "standard",
          size: "large",
          theme: "outline",
          text: "signin_with",
          shape: "pill",
          logo_alignment: "left",
          width: 320,
        });
      }
    };
    document.head.appendChild(s);

    // Mensajes desde el querystring (opcional)
    const p = new URLSearchParams(location.search);
    if (p.get("error") === "not-allowed") setMsg("Tu usuario no está habilitado.");
    if (p.get("error") === "session") setMsg("Sesión inválida o expirada.");
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-t-4 border-t-blue-500 bg-white">
      <CardHeader className="space-y-1 text-center">
        <CardTitle
          className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          Iniciar Sesión
        </CardTitle>
        <CardDescription
          className="text-slate-600"
          style={{ fontFamily: "var(--font-open-sans)" }}
        >
          Accede a tu cuenta con Google
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {msg && (
          <p className="text-sm text-red-600 text-center" style={{ fontFamily: "var(--font-open-sans)" }}>
            {msg}
          </p>
        )}

        {/* Botón oficial de Google */}
        <div className="flex justify-center">
          <div ref={btnRef} />
        </div>
      </CardContent>
    </Card>
  );
}
