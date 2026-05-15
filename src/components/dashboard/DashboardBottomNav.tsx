"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, User, Users, Clock } from "lucide-react";

const links = [
  {
    label: "Inicio",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Agenda",
    href: "/dashboard/calendar",
    icon: CalendarDays,
  },
  {
    label: "Turnos",
    href: "/dashboard/appointments",
    icon: Clock,
  },
  {
    label: "Clientes",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    label: "Perfil",
    href: "/dashboard/profile",
    icon: User,
  },
];

export default function DashboardBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-800 bg-neutral-950/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs transition ${
                active
                  ? "bg-brand text-white hover:bg-brand-hover"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="mt-1">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}