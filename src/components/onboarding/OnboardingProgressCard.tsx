"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type OnboardingData = {
  progress: number;
  dismissed?: boolean;
  steps: {
    profileCompleted: boolean;
    categorySelected: boolean;
    availabilityConfigured: boolean;
    firstAppointmentReceived: boolean;
  };
};

export default function OnboardingProgressCard() {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOnboarding = useCallback(async () => {
    try {
      const response = await fetch("/api/onboarding");
      const json = await response.json();

      if (!response.ok) {
        setData(null);
        return;
      }

      setData(json);
    } catch (error) {
      console.error(error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOnboarding();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadOnboarding]);

  if (loading || !data || data.progress >= 100 || data.dismissed) {
    return null;
  }

  const missingSteps = [
    {
      label: "Completar perfil",
      done: data.steps.profileCompleted,
    },
    {
      label: "Elegir categoría",
      done: data.steps.categorySelected,
    },
    {
      label: "Cargar horarios",
      done: data.steps.availabilityConfigured,
    },
    {
      label: "Recibir primer turno",
      done: data.steps.firstAppointmentReceived,
    },
  ];

  return (
    <div className="premium-card premium-gradient rounded-3xl p-6">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-brand">Primeros pasos</p>

          <h2 className="mt-2 text-2xl font-bold">
            Terminá de configurar tu cuenta
          </h2>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Tu perfil está al {data.progress}%. Completá estos pasos para
            empezar a recibir turnos.
          </p>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-brand"
              style={{
                width: `${data.progress}%`,
              }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {missingSteps.map((step) => (
              <span
                key={step.label}
                className={`rounded-full border px-3 py-1 text-xs ${
                  step.done
                    ? "border-green-900 text-green-400"
                    : "border-neutral-700 text-[var(--muted)]"
                }`}
              >
                {step.done ? "✓" : "•"} {step.label}
              </span>
            ))}
          </div>
        </div>

        <Link
          href="/dashboard/onboarding"
          className="rounded-xl bg-brand px-5 py-3 text-center font-medium text-[var(--foreground)] hover:bg-brand-hover"
        >
          Continuar configuración
        </Link>
      </div>
    </div>
  );
}