import Link from "next/link";
import WhatsAppSection from "@/components/landing/WhatsAppSection";

const features = [
  "Turnos online 24/7",
  "Agenda visual",
  "Recordatorios por WhatsApp",
  "Clientes e historial",
  "Pagos con seña",
  "Perfil público con QR",
];

const useCases = [
  "Psicólogos",
  "Nutricionistas",
  "Kinesiólogos",
  "Entrenadores",
  "Estética",
  "Consultorios",
];

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Ideal para probar el sistema.",
    features: ["Perfil público", "Hasta 20 turnos/mes", "Agenda básica"],
    cta: "Empezar gratis",
  },
  {
    name: "Pro",
    price: "$9.999",
    description: "Para profesionales que ya reciben turnos todos los días.",
    features: [
      "Turnos ilimitados",
      "Recordatorios por WhatsApp",
      "Pagos con seña",
      "Clientes e historial",
    ],
    cta: "Elegir Pro",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$19.999",
    description: "Para negocios o profesionales que quieren destacarse.",
    features: [
      "Todo Pro",
      "Perfil destacado",
      "QR personalizado",
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
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-20">
        <div className="max-w-4xl">
          <p className="inline-flex rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-300">
            Turnero multi-profesional para ciudades chicas y medianas
          </p>

          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            Digitalizá tus turnos y dejá de depender del WhatsApp.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-neutral-400">
            Una plataforma moderna para que profesionales gestionen reservas,
            clientes, pagos, recordatorios y agenda desde un solo lugar.
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
              className="rounded-xl border border-neutral-700 px-6 py-3 text-center font-medium text-white transition hover:bg-neutral-900"
            >
              Ver demo pública
            </Link>
            <Link
              href="/demo"
              className="rounded-xl border border-neutral-700 px-6 py-3 text-center font-medium text-white transition hover:bg-neutral-900"
            >
              Ver demo interactiva
            </Link>
            <Link
              href="/turnos"
              className="rounded-xl border border-neutral-700 px-6 py-3 text-center font-medium text-white transition hover:bg-neutral-900"
            >
              Buscar profesionales
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {features.slice(0, 3).map((feature) => (
            <div
              key={feature}
              className="premium-card premium-card-hover rounded-3xl p-6"
            >
              <h2 className="font-semibold">{feature}</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Una función pensada para ahorrar tiempo y ordenar la atención.
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
              Pensado para profesionales reales de tu ciudad.
            </h2>
            <p className="mt-4 text-neutral-400">
              Ideal para quienes todavía gestionan turnos con agenda de papel,
              notas, Excel o mensajes sueltos.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {useCases.map((item) => (
              <div
                key={item}
                className="premium-card premium-card-hover premium-gradient rounded-3xl p-6"
              >
                <h3 className="text-xl font-semibold">{item}</h3>
                <p className="mt-2 text-sm text-neutral-400">
                  Reservas online, historial de clientes y agenda ordenada.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-900 px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm text-neutral-500">Demo del producto</p>
            <h2 className="mt-3 text-4xl font-bold">
              Un flujo simple para el profesional y para el cliente.
            </h2>
            <p className="mt-4 text-neutral-400">
              El profesional carga sus horarios, comparte su link y los clientes
              reservan sin necesidad de registrarse.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-brand px-6 py-3 text-center font-medium text-black"
              >
                Probar como profesional
              </Link>
              <Link
                href="/turnos"
                className="rounded-xl border border-neutral-700 px-6 py-3 text-center font-medium text-white"
              >
                Ver experiencia del cliente
              </Link>
            </div>
          </div>

          <WhatsAppSection />

          <div className="premium-card premium-gradient rounded-3xl p-6">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
              <p className="text-sm text-neutral-500">Dashboard</p>
              <h3 className="mt-2 text-2xl font-bold">Turnos de esta semana</h3>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {["Lun", "Mar", "Mié"].map((day) => (
                  <div
                    key={day}
                    className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4"
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

            <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
              <p className="text-sm text-neutral-500">Reserva pública</p>
              <h3 className="mt-2 text-xl font-semibold">
                Elegir fecha → elegir horario → confirmar turno
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-900 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm text-neutral-500">Planes</p>
            <h2 className="mt-3 text-4xl font-bold">
              Empezá simple y escalá cuando lo necesites.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl border p-6 ${
                  plan.highlighted
                    ? "border-white bg-brand text-black"
                    : "border-neutral-800 bg-neutral-900 text-white"
                }`}
              >
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p
                  className={`mt-2 text-sm ${
                    plan.highlighted ? "text-neutral-700" : "text-neutral-400"
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
                      ? "bg-black text-white"
                      : "bg-brand text-black"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
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
        <div className="mx-auto max-w-5xl rounded-3xl border border-neutral-800 bg-brand p-10 text-center text-black">
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
              className="rounded-xl bg-black px-6 py-3 font-medium text-white"
            >
              Crear cuenta gratis
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-neutral-300 px-6 py-3 font-medium text-black"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}