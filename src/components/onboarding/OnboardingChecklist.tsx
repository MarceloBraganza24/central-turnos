"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Steps = {
  profileCompleted: boolean;
  categorySelected: boolean;
  availabilityConfigured: boolean;
  publicProfileShared: boolean;
  firstAppointmentReceived: boolean;
};

type Response = {
  steps: Steps;
  progress: number;
  dismissed: boolean;
};

const items = [
  {
    key: "profileCompleted",
    label: "Completá tu perfil",
    description: "Agregá nombre, descripción y datos básicos.",
    href: "/dashboard/profile",
  },

  {
    key: "categorySelected",
    label: "Elegí tu categoría",
    description: "Así los clientes pueden encontrarte.",
    href: "/dashboard/profile",
  },

  {
    key: "availabilityConfigured",
    label: "Configurá horarios",
    description: "Definí cuándo trabajás.",
    href: "/dashboard/availability",
  },

  {
    key: "publicProfileShared",
    label: "Compartí tu perfil",
    description: "Copiá tu link y empezá a recibir reservas.",
    href: "/dashboard/share",
  },

  {
    key: "firstAppointmentReceived",
    label: "Recibí tu primer turno",
    description: "Tu sistema ya está funcionando.",
    href: "/dashboard/calendar",
  },
];

export default function OnboardingChecklist() {
  const [data, setData] = useState<Response | null>(null);

  async function load() {
    const response = await fetch("/api/onboarding");
    const result = await response.json();

    if (!response.ok) return;

    setData(result);
  }

  async function dismiss() {
    await fetch("/api/onboarding", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dismissed: true,
      }),
    });

    setData((prev) =>
      prev
        ? {
            ...prev,
            dismissed: true,
          }
        : prev
    );
  }

  useEffect(() => {
    load();
  }, []);

  if (!data || data.dismissed || data.progress === 100) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-brand/20 bg-linear-to-br from-brand/10 to-neutral-900 p-6 text-white">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-brand">
            Configuración inicial
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Terminá de configurar Central Turnos
          </h2>

          <p className="mt-2 text-sm text-neutral-300">
            Seguí estos pasos para empezar a recibir turnos online.
          </p>
        </div>

        <button
          onClick={dismiss}
          className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900"
        >
          Ocultar
        </button>
      </div>

      <div className="mt-6">
        <div className="h-3 overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{
              width: `${data.progress}%`,
            }}
          />
        </div>

        <p className="mt-2 text-sm text-neutral-400">
          {data.progress}% completado
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => {
          const completed =
            data.steps[item.key as keyof Steps];

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`block rounded-2xl border p-4 transition ${
                completed
                  ? "border-green-900 bg-green-950/30"
                  : "border-neutral-800 bg-neutral-900 hover:border-brand/40"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    completed
                      ? "bg-green-500 text-black"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {completed ? "✓" : ""}
                </div>

                <div>
                  <h3 className="font-medium">
                    {item.label}
                  </h3>

                  <p className="mt-1 text-sm text-neutral-400">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}