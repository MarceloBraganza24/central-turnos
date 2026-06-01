"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Primeros pasos",
    href: "/dashboard/onboarding",
  },
  {
    label: "Calendario",
    href: "/dashboard/calendar",
  },
  {
    label: "Mi perfil",
    href: "/dashboard/profile",
  },
  { 
    label: "Compartir perfil",
    href: "/dashboard/share"
  },
  {
    label: "Horarios",
    href: "/dashboard/availability",
  },
  {
    label: "Turnos",
    href: "/dashboard/appointments",
  },
  {
    label: "Clientes",
    href: "/dashboard/clients",
  },
  { 
    label: "Mi espacio",
     href: "/dashboard/tenant"
  },
  { 
    label: "Equipo",
     href: "/dashboard/team"
  },
  { 
    label: "Config. calendario",
    href: "/dashboard/calendar/settings"
  },
  { 
    label: "Reseñas",
     href: "/dashboard/reviews"
  },
  { 
    label: "Servicios",
     href: "/dashboard/services"
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-72 overflow-y-auto border-r border-[var(--border)] bg-[var(--background)]">
      <div className="border-b border-[var(--border)] p-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Central Turnos</h1>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Panel profesional
        </p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-brand text-white hover:bg-brand-hover"
                  : "text-black hover:bg-[var(--card)] hover:text-[var(--foreground)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}