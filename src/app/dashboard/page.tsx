"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MetricCard from "@/components/ui/MetricCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { useRouter } from "next/navigation";
import MobileQuickActions from "@/components/dashboard/MobileQuickActions";
import OnboardingChecklist from "@/components/onboarding/OnboardingChecklist";

type Metrics = {
  todayAppointments: number;
  weekAppointments: number;
  totalClients: number;
  estimatedIncome: number;
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function checkOnboarding() {
      const response = await fetch("/api/onboarding");
      const data = await response.json();

      if (!data.completed) {
        router.push("/dashboard/onboarding");
      }
    }

    checkOnboarding();
  }, [router]);

  useEffect(() => {
    async function loadMetrics() {
      const response = await fetch("/api/dashboard/metrics");
      const data = await response.json();
      setMetrics(data);
    }

    loadMetrics();
  }, []);

  return (
    <section className="max-w-7xl text-white">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <p className="mt-2 text-neutral-400">
        Resumen general de tu actividad profesional.
      </p>

      <div className="mt-6">
        <OnboardingChecklist />
      </div>

      <div className="mt-6">
        <MobileQuickActions />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {!metrics ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <MetricCard
              title="Turnos hoy"
              value={metrics.todayAppointments}
              description="Reservas activas del día"
            />
            <MetricCard
              title="Turnos esta semana"
              value={metrics.weekAppointments}
              description="Sin contar cancelados"
            />
            <MetricCard
              title="Clientes"
              value={metrics.totalClients}
              description="Personas que reservaron"
            />
            <MetricCard
              title="Ingresos estimados"
              value={`$${metrics.estimatedIncome}`}
              description="Según turnos semanales"
            />
          </>
        )}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Link
          href="/dashboard/calendar"
          className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition hover:bg-neutral-800"
        >
          <h2 className="font-semibold">Calendario</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Vista semanal de tus turnos.
          </p>
        </Link>

        <Link
          href="/dashboard/profile"
          className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition hover:bg-neutral-800"
        >
          <h2 className="font-semibold">Mi perfil</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Datos públicos y categoría.
          </p>
        </Link>

        <Link
          href="/dashboard/availability"
          className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition hover:bg-neutral-800"
        >
          <h2 className="font-semibold">Horarios</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Configurá tu disponibilidad.
          </p>
        </Link>

        <Link
          href="/dashboard/clients"
          className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition hover:bg-neutral-800"
        >
          <h2 className="font-semibold">Clientes</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Historial y datos de contacto.
          </p>
        </Link>
      </div>
    </section>
  );
}