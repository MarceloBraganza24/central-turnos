import Link from "next/link";
import WhatsAppSection from "@/components/landing/WhatsAppSection";

const features = [
  "Turnos online 24/7",
  "Agenda visual",
  "Recordatorios por WhatsApp",
  "Clientes e historial",
  "Servicios con precio y duración",
  "Perfil público con QR",
];

const useCases = [
  "Consultorios",
  "Psicólogos",
  "Nutricionistas",
  "Kinesiólogos",
  "Peluquerías",
  "Barberías",
  "Manicuras",
  "Estéticas",
  "Entrenadores",
  "Gimnasios",
  "Masajistas",
  "Servicios a domicilio",
];

const steps = [
  {
    title: "Creás tu cuenta",
    text: "Registrás tu espacio y completás tus datos básicos.",
  },
  {
    title: "Configurás horarios",
    text: "Cargás tus días, servicios, duración y disponibilidad.",
  },
  {
    title: "Compartís tu link",
    text: "Tus clientes reservan desde tu perfil público o código QR.",
  },
  {
    title: "Gestionás todo",
    text: "Ves turnos, clientes, estados y agenda desde el dashboard.",
  },
];

const plans = [
  {
    name: "Gratis",
    price: "$0",
    description: "Para empezar y probar el sistema.",
    features: [
      "Perfil público",
      "Agenda online",
      "Hasta 20 turnos por mes",
      "QR para compartir",
    ],
    cta: "Empezar gratis",
  },
  {
    name: "Pro",
    price: "$19.999",
    description: "Para profesionales y negocios con flujo constante.",
    features: [
      "Turnos ilimitados",
      "Clientes e historial",
      "Recordatorios WhatsApp",
      "Servicios personalizados",
      "Calendario completo",
    ],
    cta: "Elegir Pro",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$29.999",
    description: "Para equipos y negocios que buscan crecer.",
    features: [
      "Todo Pro",
      "Branding personalizado",
      "Dominio propio",
      "Métricas avanzadas",
      "Soporte prioritario",
    ],
    cta: "Elegir Premium",
  },
];

const testimonials = [
  {
    name: "Nutricionista",
    quote:
      "Antes manejaba todo por WhatsApp. Ahora mis pacientes reservan solos y yo veo todo ordenado.",
  },
  {
    name: "Kinesiólogo",
    quote:
      "Me ayudó a reducir olvidos y tener más control de mis horarios semanales.",
  },
  {
    name: "Estética",
    quote:
      "El link público y el QR me sirven mucho para Instagram y para compartir con clientas.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold">
            Central Turnos
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--card)]"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
            >
              Crear cuenta gratis
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl flex-col justify-center px-6 py-20">
        <div className="max-w-4xl">
          <p className="inline-flex rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-300">
            Sistema de turnos para negocios, oficios y profesionales
          </p>

          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            Recibí turnos online las 24 horas y organizá tu agenda sin llamadas
            ni mensajes.
          </h1>

          <p className="mt-6 max-w-3xl text-lg text-[var(--muted)]">
            Central Turnos ayuda a consultorios, estéticas, peluquerías,
            barberías, entrenadores, gimnasios y prestadores de servicios a
            gestionar reservas, clientes y horarios desde un solo lugar.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-xl bg-brand px-6 py-3 text-center font-medium text-black transition hover:bg-neutral-200"
            >
              Crear cuenta gratis
            </Link>

            <Link
              href="/turnos"
              className="rounded-xl border border-neutral-700 px-6 py-3 text-center font-medium text-[var(--foreground)] transition hover:bg-[var(--card)]"
            >
              Buscar profesionales
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {features.slice(0, 3).map((feature) => (
            <div
              key={feature}
              className="premium-card premium-card-hover premium-gradient rounded-3xl p-6"
            >
              <h2 className="font-semibold">{feature}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Una función pensada para ahorrar tiempo, reducir olvidos y
                ordenar la atención.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-900 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm text-neutral-500">Casos de uso</p>

            <h2 className="mt-3 text-4xl font-bold">
              Funciona para cualquier negocio que trabaje con reservas.
            </h2>

            <p className="mt-4 text-[var(--muted)]">
              Ideal para quienes todavía gestionan turnos con agenda de papel,
              Excel, notas o mensajes sueltos por WhatsApp.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {useCases.map((item) => (
              <div
                key={item}
                className="premium-card premium-card-hover premium-gradient rounded-3xl p-6"
              >
                <h3 className="text-xl font-semibold">{item}</h3>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Reservas online, historial de clientes y agenda ordenada.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-900 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm text-neutral-500">Cómo funciona</p>

              <h2 className="mt-3 text-4xl font-bold">
                Empezá a recibir reservas en menos de 10 minutos.
              </h2>

              <p className="mt-4 text-[var(--muted)]">
                Sin instalaciones, sin conocimientos técnicos y sin depender de
                mensajes para coordinar horarios. Configurás tu espacio,
                compartís tu link y tus clientes reservan solos.
              </p>

              <div className="mt-8 space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="premium-card premium-card-hover rounded-3xl p-5"
                  >
                    <p className="text-sm text-brand">Paso {index + 1}</p>
                    <h3 className="mt-2 text-xl font-semibold">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="premium-card premium-gradient rounded-3xl p-6">
                <p className="text-sm text-neutral-500">Demo integrada</p>

                <h3 className="mt-2 text-2xl font-bold">
                  Así se ve el flujo para tus clientes.
                </h3>

                <div className="mt-6 grid gap-3">
                  {[
                    "Elige ciudad y categoría",
                    "Selecciona profesional o negocio",
                    "Elige fecha y horario disponible",
                    "Confirma su reserva sin crear cuenta",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-neutral-300"
                    >
                      ✓ {item}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/turnos"
                    className="rounded-xl bg-brand px-5 py-3 text-center font-medium text-black"
                  >
                    Ver búsqueda pública
                  </Link>

                  <Link
                    href="/demo"
                    className="rounded-xl border border-neutral-700 px-5 py-3 text-center font-medium text-[var(--foreground)] hover:bg-[var(--card)]"
                  >
                    Ver demo interactiva
                  </Link>
                </div>
              </div>

              <div className="premium-card premium-gradient rounded-3xl p-6">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                  <p className="text-sm text-neutral-500">Dashboard</p>

                  <h3 className="mt-2 text-2xl font-bold">
                    Turnos de esta semana
                  </h3>

                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    {["Lun", "Mar", "Mié"].map((day) => (
                      <div
                        key={day}
                        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
                      >
                        <p className="text-sm text-neutral-500">{day}</p>

                        <div className="mt-4 space-y-3">
                          <div className="rounded-xl bg-neutral-800 p-3 text-sm">
                            09:00 · Juan
                          </div>

                          <div className="rounded-xl bg-neutral-800 p-3 text-sm">
                            11:30 · María
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                  <p className="text-sm text-neutral-500">Reserva pública</p>

                  <h3 className="mt-2 text-xl font-semibold">
                    Elegir fecha → elegir horario → confirmar turno
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <WhatsAppSection />
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-900 px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {[
            ["24/7", "Reservas online"],
            ["QR", "Perfil público para compartir"],
            ["WhatsApp", "Recordatorios automáticos"],
            ["Agenda", "Turnos y clientes ordenados"],
          ].map(([number, label]) => (
            <div
              key={label}
              className="premium-card premium-gradient rounded-3xl p-6 text-center"
            >
              <p className="text-4xl font-bold">{number}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-900 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm text-neutral-500">Planes</p>

            <h2 className="mt-3 text-4xl font-bold">
              Empezá gratis y escalá cuando lo necesites.
            </h2>

            <p className="mt-4 text-[var(--muted)]">
              Precios simples para validar, crecer y profesionalizar tu agenda.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl border p-6 ${
                  plan.highlighted
                    ? "border-white bg-brand text-black"
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
                }`}
              >
                <h3 className="text-2xl font-bold">{plan.name}</h3>

                <p
                  className={`mt-2 text-sm ${
                    plan.highlighted ? "text-neutral-700" : "text-[var(--muted)]"
                  }`}
                >
                  {plan.description}
                </p>

                <p className="mt-6 text-4xl font-bold">
                  {plan.price}
                  <span className="text-sm font-normal"> / mes</span>
                </p>

                <ul className="mt-6 space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`mt-8 block rounded-xl px-5 py-3 text-center font-medium ${
                    plan.highlighted
                      ? "bg-black text-[var(--foreground)]"
                      : "bg-brand text-black"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-neutral-500">
            Los precios pueden ajustarse según funcionalidades, rubro o etapa de
            lanzamiento.
          </p>
        </div>
      </section>

      <section className="border-t border-neutral-900 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm text-neutral-500">Testimonios</p>

            <h2 className="mt-3 text-4xl font-bold">
              Diseñado para resolver problemas cotidianos.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="premium-card premium-card-hover premium-gradient rounded-3xl p-6"
              >
                <p className="text-neutral-300">“{item.quote}”</p>

                <p className="mt-5 text-sm font-medium text-neutral-500">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-900 px-6 py-24">
        <div className="mx-auto max-w-5xl rounded-3xl border border-[var(--border)] bg-brand p-10 text-center text-black">
          <h2 className="text-4xl font-bold">
            Empezá a recibir turnos online esta semana.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
            Creá tu cuenta, completá tu perfil, cargá tus horarios y compartí tu
            link público con tus clientes.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-xl bg-black px-6 py-3 font-medium text-[var(--foreground)]"
            >
              Crear cuenta gratis
            </Link>

            <Link
              href="/turnos"
              className="rounded-xl border border-neutral-300 px-6 py-3 font-medium text-black"
            >
              Buscar profesionales
            </Link>
          </div>
        </div>
      </section>

      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <Link
          href="/register"
          className="block rounded-2xl bg-brand py-4 text-center font-semibold text-black shadow-xl"
        >
          Crear cuenta gratis
        </Link>
      </div>
    </main>
  );
}