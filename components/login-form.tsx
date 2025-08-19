"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

declare global {
  interface Window {
    google?: any;
  }
}

export function LoginForm() {
  const [msg, setMsg] = useState<string | null>(null);
  const btnRef = useRef<HTMLDivElement>(null); // contenedor del botón Google

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setMsg("Falta NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      console.error("Falta NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }

    const handleCredentialResponse = async (response: any) => {
      setMsg(null);
      try {
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setMsg(data?.error || "Acceso denegado.");
          return;
        }

        const p = new URLSearchParams(location.search);
        const redirect = p.get("redirect") || "/dashboard"; // 👈 acá el cambio
        location.href = redirect;
      } catch (e) {
        console.error(e);
        setMsg("Error de conexión. Intenta nuevamente.");
      }
    };

    const init = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });
      if (btnRef.current) {
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "left",
          width: 320,
        });
      }
    };

    if (window.google?.accounts?.id) {
      init();
    } else {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = init;
      document.body.appendChild(s);
    }

    const qs = new URLSearchParams(location.search);
    if (qs.get("error") === "not-allowed") setMsg("Tu usuario no está habilitado.");
    if (qs.get("error") === "session") setMsg("Sesión inválida o expirada.");
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
        <CardDescription className="text-slate-600" style={{ fontFamily: "var(--font-open-sans)" }}>
          Accede a tu cuenta con Google
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {msg && (
          <p className="text-sm text-red-600 text-center" style={{ fontFamily: "var(--font-open-sans)" }}>
            {msg}
          </p>
        )}
        <div className="flex justify-center">
          <div ref={btnRef} />
        </div>
      </CardContent>
    </Card>
  );
}
