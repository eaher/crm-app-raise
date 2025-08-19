// app/dashboard/page.tsx
import { ModuleGrid } from "@/components/module-grid";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-800" style={{ fontFamily: "var(--font-montserrat)" }}>
            Selecciona un módulo
          </h1>
          <p className="text-slate-600" style={{ fontFamily: "var(--font-open-sans)" }}>
            Elige a dónde querés ingresar para continuar.
          </p>
        </header>
        <ModuleGrid />
      </div>
    </main>
  );
}
