import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import OnboardingProgressCard from "@/components/onboarding/OnboardingProgressCard";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="max-w-7xl text-[var(--foreground)]">
      <section className="space-y-6">
        <OnboardingProgressCard />

        <div className="premium-card premium-gradient rounded-3xl p-8">
          <p className="text-sm text-brand">Central Turnos</p>

          <h1 className="mt-3 text-3xl font-bold">
            Panel principal
          </h1>

          <p className="mt-2 max-w-2xl text-[var(--muted)]">
            Gestioná tus turnos, clientes, servicios y configuración desde un
            solo lugar.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/dashboard/calendar"
            className="premium-card premium-card-hover rounded-3xl p-6"
          >
            <h2 className="text-xl font-semibold">Calendario</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Visualizá tus turnos y cambiá estados rápidamente.
            </p>
          </Link>

          <Link
            href="/dashboard/services"
            className="premium-card premium-card-hover rounded-3xl p-6"
          >
            <h2 className="text-xl font-semibold">Servicios</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Cargá precios, duración y señas por servicio.
            </p>
          </Link>

          <Link
            href="/dashboard/availability"
            className="premium-card premium-card-hover rounded-3xl p-6"
          >
            <h2 className="text-xl font-semibold">Horarios</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Definí cuándo pueden reservar tus clientes.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}