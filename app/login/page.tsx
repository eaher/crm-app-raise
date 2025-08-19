// app/login/page.tsx
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-black text-blue-600 mb-2"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Bienvenido
          </h1>
          <p
            className="text-slate-600"
            style={{ fontFamily: "var(--font-open-sans)" }}
          >
            Iniciá sesión para continuar
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
