import Link from "next/link";

const items = [
  {
    title: "¿Cómo cargo horarios?",
    description:
      "Entrá a Disponibilidad y configurá tus días y horarios.",
  },

  {
    title: "¿Cómo comparto mi perfil?",
    description:
      "Desde Compartir perfil podés copiar el link o descargar tu QR.",
  },

  {
    title: "¿Cómo funcionan los recordatorios?",
    description:
      "Central Turnos envía WhatsApp automáticos antes del turno.",
  },

  {
    title: "¿Cómo cambio mi plan?",
    description:
      "Desde Facturación podés actualizar tu suscripción.",
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-20 text-[var(--foreground)]">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/turnos"
          className="text-sm text-[var(--muted)] underline text-brand"
        >
          Buscar profesionales
        </Link>
        <p className="text-sm text-brand pt-4">
          Centro de ayuda
        </p>

        <h1 className="mt-4 text-5xl font-bold">
          ¿En qué podemos ayudarte?
        </h1>

        <div className="mt-12 space-y-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="premium-card premium-card-hover premium-gradient rounded-3xl p-6"
            >
              <h2 className="text-xl font-semibold text-white">
                {item.title}
              </h2>

              <p className="mt-3 text-[var(--muted)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}