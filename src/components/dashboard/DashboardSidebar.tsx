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
    <aside className="hidden w-72 border-r border-neutral-800 bg-neutral-950 lg:flex lg:flex-col">
      <div className="border-b border-neutral-800 p-6">
        <h1 className="text-2xl font-bold text-white">Turnero Pro</h1>

        <p className="mt-1 text-sm text-neutral-400">
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
                  : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
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