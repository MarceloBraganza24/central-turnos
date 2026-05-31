"use client";

import FadeIn from "@/components/animations/FadeIn";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type SettingsForm = {
  appointmentDurationMinutes: number;
  appointmentBufferMinutes: number;

  whatsappRemindersEnabled: boolean;
  whatsappConfirmationsEnabled: boolean;

  publicProfileEnabled: boolean;

  primaryColor: string;
  accentColor: string;
};

export default function DashboardSettingsPage() {
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<SettingsForm>({
    appointmentDurationMinutes: 30,
    appointmentBufferMinutes: 0,

    whatsappRemindersEnabled: true,
    whatsappConfirmationsEnabled: true,

    publicProfileEnabled: true,

    primaryColor: "#ffffff",
    accentColor: "#8b5cf6",
  });

  async function loadSettings() {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();

      setForm({
        appointmentDurationMinutes:
          data.appointmentDurationMinutes || 30,

        appointmentBufferMinutes:
          data.appointmentBufferMinutes || 0,

        whatsappRemindersEnabled:
          data.whatsappRemindersEnabled ?? true,

        whatsappConfirmationsEnabled:
          data.whatsappConfirmationsEnabled ?? true,

        publicProfileEnabled:
          data.publicProfileEnabled ?? true,

        primaryColor:
          data.primaryColor || "#ffffff",

        accentColor:
          data.accentColor || "#8b5cf6",
      });
    } catch (error) {
      console.error(error);
      toast.error("Error cargando configuración");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSettings();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  async function saveSettings() {
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        toast.error("Error guardando");
        return;
      }

      toast.success("Configuración guardada");
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error");
    }
  }

  if (loading) {
    return (
      <main className="max-w-4xl">
        Cargando...
      </main>
    );
  }

  return (
    <main className="max-w-4xl">
      <div className="space-y-6">
        <FadeIn>
          <div className="premium-card premium-gradient rounded-3xl p-8">
            <h1 className="text-3xl font-bold">
              Configuración
            </h1>

            <p className="mt-2 text-[var(--muted)]">
              Personalizá cómo funciona tu agenda.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="premium-card rounded-3xl p-6">
            <h2 className="text-xl font-semibold">
              Turnos
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm text-[var(--muted)]">
                  Duración por defecto (min)
                </label>

                <input
                  type="number"
                  min={5}
                  value={form.appointmentDurationMinutes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      appointmentDurationMinutes:
                        Number(e.target.value),
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-neutral-700 bg-[var(--background)] px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm text-[var(--muted)]">
                  Buffer entre turnos (min)
                </label>

                <input
                  type="number"
                  min={0}
                  value={form.appointmentBufferMinutes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      appointmentBufferMinutes:
                        Number(e.target.value),
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-neutral-700 bg-[var(--background)] px-4 py-3"
                />
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="premium-card rounded-3xl p-6">
            <h2 className="text-xl font-semibold">
              WhatsApp
            </h2>

            <div className="mt-6 space-y-4">
              <label className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                <span>
                  Recordatorios automáticos
                </span>

                <input
                  type="checkbox"
                  checked={
                    form.whatsappRemindersEnabled
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      whatsappRemindersEnabled:
                        e.target.checked,
                    })
                  }
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                <span>
                  Confirmaciones automáticas
                </span>

                <input
                  type="checkbox"
                  checked={
                    form.whatsappConfirmationsEnabled
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      whatsappConfirmationsEnabled:
                        e.target.checked,
                    })
                  }
                />
              </label>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="premium-card rounded-3xl p-6">
            <h2 className="text-xl font-semibold">
              Branding
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm text-[var(--muted)]">
                  Color principal
                </label>

                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      primaryColor: e.target.value,
                    })
                  }
                  className="mt-2 h-14 w-full rounded-2xl border border-neutral-700 bg-[var(--background)]"
                />
              </div>

              <div>
                <label className="text-sm text-[var(--muted)]">
                  Color acento
                </label>

                <input
                  type="color"
                  value={form.accentColor}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      accentColor: e.target.value,
                    })
                  }
                  className="mt-2 h-14 w-full rounded-2xl border border-neutral-700 bg-[var(--background)]"
                />
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <button
            onClick={saveSettings}
            className="touch-button rounded-2xl bg-brand px-6 py-4 font-medium text-[var(--foreground)] hover:bg-brand-hover"
          >
            Guardar configuración
          </button>
        </FadeIn>
      </div>
    </main>
  );
}