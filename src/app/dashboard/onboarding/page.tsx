"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

type OnboardingData = {
  progress: number;
  dismissed?: boolean;
  steps: {
    profileCompleted: boolean;
    categorySelected: boolean;
    tenantConfigured: boolean;
    availabilityConfigured: boolean;
    firstAppointmentReceived: boolean;
  };
};

const defaultOnboardingData: OnboardingData = {
  progress: 0,
  dismissed: false,
  steps: {
    profileCompleted: false,
    categorySelected: false,
    availabilityConfigured: false,
    firstAppointmentReceived: false,
    tenantConfigured: false,
  },
};

const steps = [
  {
    key: "profileCompleted",
    title: "Completá tu perfil profesional",
    description:
      "Agregá tu nombre visible, bio, teléfono, ciudad y datos básicos.",
    href: "/dashboard/profile",
    action: "Completar perfil",
  },
  {
    key: "categorySelected",
    title: "Elegí tu categoría",
    description: "Seleccioná en qué rubro querés aparecer públicamente.",
    href: "/dashboard/profile",
    action: "Elegir categoría",
  },
  {
    key: "tenantConfigured",
    title: "Configurá tu espacio profesional",
    description:
      "Definí el nombre de tu espacio, ciudad, provincia, branding y link público.",
    href: "/dashboard/tenant",
    action: "Configurar espacio",
  },
  {
    key: "availabilityConfigured",
    title: "Configurá tus horarios",
    description: "Definí cuándo vas a recibir reservas.",
    href: "/dashboard/availability",
    action: "Configurar horarios",
  },
  {
    key: "firstAppointmentReceived",
    title: "Recibí tu primer turno",
    description: "Compartí tu perfil y conseguí tu primera reserva.",
    href: "/dashboard/share",
    action: "Compartir perfil",
  },
] as const;

export default function OnboardingPage() {
  const [data, setData] = useState<OnboardingData>(
    defaultOnboardingData
  );

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadOnboarding() {
      try {
        const response = await fetch("/api/onboarding");
        const result = await response.json();

        if (!response.ok || !result?.steps) {
          setMessage(
            result?.message ||
              "Todavía falta completar la configuración inicial."
          );

          setData(defaultOnboardingData);
          return;
        }

        setData({
          progress: result.progress ?? 0,
          dismissed: result.dismissed ?? false,
          steps: {
            profileCompleted:
              result.steps.profileCompleted ?? false,
            categorySelected:
              result.steps.categorySelected ?? false,
            tenantConfigured:
              result.steps.tenantConfigured ?? false, 
            availabilityConfigured:
              result.steps.availabilityConfigured ?? false,
            firstAppointmentReceived:
              result.steps.firstAppointmentReceived ?? false,
          },
        });
      } catch (error) {
        console.error(error);
        setMessage("No pudimos cargar el onboarding.");
        setData(defaultOnboardingData);
      } finally {
        setLoading(false);
      }
    }

    void loadOnboarding();
  }, []);

  if (loading) {
    return <section className="text-[var(--foreground)]">Cargando onboarding...</section>;
  }

  return (
    <section className="max-w-5xl text-[var(--foreground)]">
      <div className="premium-card premium-gradient rounded-3xl p-8">
        <p className="inline-flex rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-300">
          Primeros pasos
        </p>

        <h1 className="mt-5 text-4xl font-bold">
          Configurá tu cuenta profesional
        </h1>

        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          Seguí estos pasos para que tu perfil quede listo y tus clientes puedan
          reservar turnos sin escribirte por WhatsApp.
        </p>

        {message && (
          <div className="mt-6 rounded-2xl border border-yellow-900 bg-yellow-950/30 p-5 text-sm text-yellow-300">
            {message}
          </div>
        )}

        {data.progress === 100 && (
          <div className="mt-6 rounded-2xl border border-green-900 bg-green-950/40 p-5 text-green-300">
            Tu perfil ya está listo para recibir reservas.
          </div>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--muted)]">
            Progreso de configuración
          </span>

          <span className="font-semibold">{data.progress}%</span>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{
              width: `${data.progress}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {steps.map((step, index) => {
          const isDone = Boolean(data.steps[step.key]);

          return (
            <div
              key={step.key}
              className="premium-card premium-card-hover grid gap-4 rounded-2xl p-5 md:grid-cols-[auto_1fr_auto]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--background)]">
                {isDone ? (
                  <CheckCircle className="text-green-400" size={24} />
                ) : (
                  <Circle className="text-neutral-500" size={24} />
                )}
              </div>

              <div>
                <p className="text-sm text-neutral-500">Paso {index + 1}</p>

                <h2 className="mt-1 text-lg font-semibold">
                  {step.title}
                </h2>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  {step.description}
                </p>
              </div>

              <div className="flex items-center">
                <Link
                  href={step.href}
                  className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
                    isDone
                      ? "border border-neutral-700 text-[var(--foreground)] hover:bg-neutral-800"
                      : "bg-brand text-[var(--foreground)] hover:bg-brand-hover"
                  }`}
                >
                  {isDone ? "Revisar" : step.action}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {data.progress === 100 && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="rounded-xl bg-white px-6 py-3 text-center font-medium text-black"
          >
            Ir al dashboard
          </Link>

          <Link
            href="/dashboard/calendar"
            className="rounded-xl border border-neutral-700 px-6 py-3 text-center font-medium text-[var(--foreground)]"
          >
            Ver calendario
          </Link>
        </div>
      )}
    </section>
  );
}