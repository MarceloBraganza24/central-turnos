"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Primeros pasos", href: "/dashboard/onboarding" },
  { label: "Calendario", href: "/dashboard/calendar" },
  { label: "Mi perfil", href: "/dashboard/profile" },
  { label: "Compartir perfil", href: "/dashboard/share" },
  { label: "Horarios", href: "/dashboard/availability" },
  { label: "Turnos", href: "/dashboard/appointments" },
  { label: "Clientes", href: "/dashboard/clients" },
  { label: "Mi espacio", href: "/dashboard/tenant" },
  { label: "Equipo", href: "/dashboard/team" },
  { label: "Config. calendario", href: "/dashboard/calendar/settings" },
  { label: "Reseñas", href: "/dashboard/reviews" },
  { label: "Servicios", href: "/dashboard/services" },
];

export default function DashboardMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-neutral-700 p-2 text-[var(--foreground)]"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70">
          <div className="h-full w-80 bg-[var(--background)] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Turnero Pro</h2>

              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-neutral-700 p-2 text-[var(--foreground)]"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="mt-8 space-y-2">
              {links.map((link) => {
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-2xl px-4 py-3 text-sm font-medium ${
                      active
                        ? "bg-brand text-[var(--foreground)] hover:bg-brand-hover"
                        : "text-neutral-300 hover:bg-[var(--card)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}