"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

type OnboardingData = {
  completed: boolean;
  steps: {
    hasProfile: boolean;
    hasCategory: boolean;
    hasAvailability: boolean;
    hasPublicLink: boolean;
  };
  professional: {
    id: string;
    slug?: string;
    onboardingCompleted: boolean;
  };
};

const steps = [
  {
    key: "hasProfile",
    title: "Completá tu perfil profesional",
    description: "Agregá tu nombre visible, bio, teléfono, ciudad y datos básicos.",
    href: "/dashboard/profile",
    action: "Completar perfil",
  },
  {
    key: "hasCategory",
    title: "Elegí tu categoría",
    description: "Seleccioná en qué rubro querés aparecer públicamente.",
    href: "/dashboard/profile",
    action: "Elegir categoría",
  },
  {
    key: "hasAvailability",
    title: "Cargá tus horarios",
    description: "Definí los días y horarios en los que vas a recibir turnos.",
    href: "/dashboard/availability",
    action: "Cargar horarios",
  },
  {
    key: "hasPublicLink",
    title: "Compartí tu perfil",
    description: "Copiá tu link público o descargá tu QR para empezar a recibir reservas.",
    href: "/dashboard/share",
    action: "Compartir perfil",
  },
] as const;

export default function OnboardingPage() {
  const [data, setData] = useState<OnboardingData | null>(null);

  useEffect(() => {
    async function loadOnboarding() {
      const response = await fetch("/api/onboarding");
      const result = await response.json();
      setData(result);
    }

    loadOnboarding();
  }, []);

  if (!data) {
    return <section className="text-white">Cargando onboarding...</section>;
  }

  return (
    <section className="max-w-5xl text-white">
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8">
        <p className="inline-flex rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-300">
          Primeros pasos
        </p>

        <h1 className="mt-5 text-4xl font-bold">
          Configurá tu cuenta profesional
        </h1>

        <p className="mt-3 max-w-2xl text-neutral-400">
          Seguí estos pasos para que tu perfil quede listo y tus clientes puedan
          reservar turnos sin escribirte por WhatsApp.
        </p>

        {data.completed && (
          <div className="mt-6 rounded-2xl border border-green-900 bg-green-950/40 p-5 text-green-300">
            Tu perfil ya está listo para recibir reservas.
          </div>
        )}
      </div>

      <div className="mt-8 space-y-4">
        {steps.map((step, index) => {
          const isDone = Boolean(data.steps[step.key]);

          return (
            <div
              key={step.key}
              className="grid gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 md:grid-cols-[auto_1fr_auto]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950">
                {isDone ? (
                  <CheckCircle className="text-green-400" size={24} />
                ) : (
                  <Circle className="text-neutral-500" size={24} />
                )}
              </div>

              <div>
                <p className="text-sm text-neutral-500">Paso {index + 1}</p>
                <h2 className="mt-1 text-lg font-semibold">{step.title}</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  {step.description}
                </p>
              </div>

              <div className="flex items-center">
                <Link
                  href={step.href}
                  className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
                    isDone
                      ? "border border-neutral-700 text-white hover:bg-neutral-800"
                      : "bg-brand text-white hover:bg-brand-hover hover:bg-neutral-200"
                  }`}
                >
                  {isDone ? "Revisar" : step.action}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {data.completed && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="rounded-xl bg-white px-6 py-3 text-center font-medium text-black"
          >
            Ir al dashboard
          </Link>

          <Link
            href="/dashboard/calendar"
            className="rounded-xl border border-neutral-700 px-6 py-3 text-center font-medium text-white"
          >
            Ver calendario
          </Link>
        </div>
      )}
    </section>
  );
}