"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MetricCard from "@/components/ui/MetricCard";
import SkeletonCard from "@/components/ui/SkeletonCard";

type AdminMetrics = {
  totalProfessionals: number;
  activeProfessionals: number;
  pendingProfessionals: number;
  totalAppointments: number;
  activeCategories: number;
};

export default function AdminPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      const response = await fetch("/api/admin/metrics");
      const data = await response.json();
      setMetrics(data);
    }

    loadMetrics();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)]">
      <section className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">Panel super admin</h1>

        <p className="mt-2 text-[var(--muted)]">
          Vista general del sistema, profesionales, categorías y actividad.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {!metrics ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <MetricCard
                title="Profesionales"
                value={metrics.totalProfessionals}
                description="Registrados totales"
              />
              <MetricCard
                title="Activos"
                value={metrics.activeProfessionals}
                description="Visibles públicamente"
              />
              <MetricCard
                title="Pendientes"
                value={metrics.pendingProfessionals}
                description="Esperando aprobación"
              />
              <MetricCard
                title="Turnos"
                value={metrics.totalAppointments}
                description="Reservas generadas"
              />
              <MetricCard
                title="Categorías"
                value={metrics.activeCategories}
                description="Activas"
              />
            </>
          )}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link
            href="/admin/professionals"
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition hover:bg-neutral-800"
          >
            <h2 className="text-lg font-semibold">Profesionales</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Aprobar, desactivar y cambiar planes.
            </p>
          </Link>

          <Link
            href="/admin/categories"
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition hover:bg-neutral-800"
          >
            <h2 className="text-lg font-semibold">Categorías</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Crear, editar y activar categorías profesionales.
            </p>
          </Link>

          <Link
            href="/admin/appointments"
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition hover:bg-neutral-800"
          >
            <h2 className="text-lg font-semibold">Turnos</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Ver reservas, estados y pagos de todo el sistema.
            </p>
          </Link>

          <Link
            href="/admin/audit-logs"
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition hover:bg-neutral-800"
          >
            <h2 className="text-lg font-semibold">Auditoría</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Ver acciones importantes, errores y actividad del sistema.
            </p>
          </Link>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold">Planes</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Free, Pro y Premium asignados desde profesionales.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}