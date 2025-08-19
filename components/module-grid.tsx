// components/module-grid.tsx
"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  PiggyBank,
  LifeBuoy,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";

const modules = [
  {
    key: "ventas",
    title: "Ventas",
    desc: "Embudo, oportunidades y clientes",
    href: "/ventas",
    icon: ShoppingCart,
    gradient:
      "from-blue-500/10 to-blue-600/10 hover:border-blue-300",
  },
  {
    key: "finanzas",
    title: "Finanzas",
    desc: "Ingresos, egresos y reportes",
    href: "/finanzas",
    icon: PiggyBank,
    gradient:
      "from-emerald-500/10 to-emerald-600/10 hover:border-emerald-300",
  },
  {
    key: "soporte",
    title: "Soporte",
    desc: "Tickets, SLAs y satisfacción",
    href: "/soporte",
    icon: LifeBuoy,
    gradient:
      "from-violet-500/10 to-violet-600/10 hover:border-violet-300",
  },
  {
    key: "accounting",
    title: "Accounting",
    desc: "Asientos, conciliación e impuestos",
    href: "/accounting",
    icon: FileSpreadsheet,
    gradient:
      "from-amber-500/10 to-amber-600/10 hover:border-amber-300",
  },
];

export function ModuleGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {modules.map((m) => {
        const Icon = m.icon;
        return (
          <Card
            key={m.key}
            className={`border transition-colors bg-gradient-to-br ${m.gradient}`}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="rounded-lg border p-2">
                  <Icon className="h-5 w-5" />
                </span>
                <span>{m.title}</span>
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href={m.href}>
                  Abrir <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{m.desc}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
