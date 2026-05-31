import Link from "next/link";

const actions = [
  {
    label: "Ver agenda",
    href: "/dashboard/calendar",
  },
  {
    label: "Cargar horarios",
    href: "/dashboard/availability",
  },
  {
    label: "Compartir perfil",
    href: "/dashboard/share",
  },
  {
    label: "Configurar calendario",
    href: "/dashboard/calendar/settings",
  },
];

export default function MobileQuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:hidden">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="touch-card text-sm font-medium text-[var(--foreground)]"
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}