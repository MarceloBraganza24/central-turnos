"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];

export default function DemoPage() {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  function handleConfirm() {
    if (!date || !slot) {
      toast.error("Elegí una fecha y un horario");
      return;
    }

    setConfirmed(true);
    toast.success("Reserva demo confirmada");
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-white">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-neutral-400 underline">
          Volver al inicio
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div className="premium-card premium-gradient rounded-3xl p-8">
            <p className="inline-flex rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-sm text-brand">
              Demo interactiva
            </p>

            <h1 className="mt-5 text-4xl font-bold md:text-5xl">
              Probá cómo reserva un cliente.
            </h1>

            <p className="mt-4 max-w-2xl text-neutral-400">
              Esta es una simulación visual. No crea datos reales, pero muestra
              cómo sería el flujo para tus clientes.
            </p>

            <div className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand text-2xl font-bold text-white">
                  N
                </div>

                <div>
                  <p className="text-sm text-neutral-500">Nutrición</p>
                  <h2 className="text-2xl font-bold">Lic. Natalia Demo</h2>
                  <p className="mt-2 text-sm text-neutral-400">
                    Atención nutricional, control de hábitos y seguimiento
                    personalizado.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-neutral-900 p-4">
                  <p className="text-sm text-neutral-500">Valor</p>
                  <p className="mt-1 text-xl font-bold">$12.000</p>
                </div>

                <div className="rounded-2xl bg-neutral-900 p-4">
                  <p className="text-sm text-neutral-500">Duración</p>
                  <p className="mt-1 text-xl font-bold">30 min</p>
                </div>

                <div className="rounded-2xl bg-neutral-900 p-4">
                  <p className="text-sm text-neutral-500">Modalidad</p>
                  <p className="mt-1 text-xl font-bold">Presencial</p>
                </div>
              </div>
            </div>

            {!confirmed ? (
              <div className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
                <h3 className="text-xl font-bold">Reservar turno</h3>

                <div className="mt-5">
                  <label className="mb-2 block text-sm text-neutral-300">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3"
                  />
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm text-neutral-300">
                    Horarios disponibles
                  </label>

                  <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
                    {slots.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSlot(item)}
                        className={`rounded-xl border px-4 py-3 text-sm transition ${
                          slot === item
                            ? "border-brand bg-brand text-white"
                            : "border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <input
                    value="Cliente Demo"
                    readOnly
                    className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-neutral-300"
                  />

                  <input
                    value="5492926000000"
                    readOnly
                    className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-neutral-300"
                  />
                </div>

                <button
                  onClick={handleConfirm}
                  className="mt-6 w-full rounded-xl bg-brand py-3 font-medium text-white transition hover:bg-brand-hover"
                >
                  Confirmar reserva demo
                </button>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-green-900 bg-green-950/40 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500 text-xl font-bold text-black">
                  ✓
                </div>

                <h3 className="mt-5 text-2xl font-bold">
                  Reserva demo confirmada
                </h3>

                <p className="mt-2 text-green-200">
                  El cliente vería una pantalla de éxito, podría agregar el
                  turno a Google Calendar y recibiría WhatsApp.
                </p>

                <div className="mt-5 rounded-2xl bg-neutral-950 p-5">
                  <p className="text-sm text-neutral-500">Detalle</p>
                  <p className="mt-2 font-medium">Lic. Natalia Demo</p>
                  <p className="text-sm text-neutral-400">
                    {date} · {slot}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setConfirmed(false);
                    setDate("");
                    setSlot("");
                  }}
                  className="mt-5 rounded-xl border border-neutral-700 px-5 py-3 font-medium text-white hover:bg-neutral-900"
                >
                  Probar de nuevo
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="premium-card rounded-3xl p-6">
              <h2 className="text-xl font-bold">Qué pasa detrás</h2>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-neutral-950 p-4">
                  <p className="font-medium">1. Cliente elige horario</p>
                  <p className="mt-1 text-sm text-neutral-400">
                    El sistema muestra solo turnos disponibles.
                  </p>
                </div>

                <div className="rounded-2xl bg-neutral-950 p-4">
                  <p className="font-medium">2. Se crea la reserva</p>
                  <p className="mt-1 text-sm text-neutral-400">
                    El profesional la ve en su calendario.
                  </p>
                </div>

                <div className="rounded-2xl bg-neutral-950 p-4">
                  <p className="font-medium">3. Llega WhatsApp</p>
                  <p className="mt-1 text-sm text-neutral-400">
                    Cliente y profesional reciben confirmación.
                  </p>
                </div>
              </div>
            </div>

            <div className="premium-card premium-gradient rounded-3xl p-6">
              <h2 className="text-xl font-bold">Vista profesional</h2>

              <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                <p className="text-sm text-neutral-500">Calendario</p>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-brand/30 bg-brand/10 p-3">
                    <p className="font-medium">09:00 · Cliente Demo</p>
                    <p className="text-xs text-neutral-400">
                      Pendiente / Confirmado
                    </p>
                  </div>

                  <div className="rounded-xl bg-neutral-900 p-3">
                    <p className="font-medium">10:30 · Turno disponible</p>
                    <p className="text-xs text-neutral-400">Libre</p>
                  </div>
                </div>
              </div>

              <Link
                href="/register"
                className="mt-6 block rounded-xl bg-brand px-5 py-3 text-center font-medium text-white hover:bg-brand-hover"
              >
                Crear cuenta gratis
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}