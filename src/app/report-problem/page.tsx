"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ReportProblemPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!message) {
      toast.error("Describí el problema");
      return;
    }

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setLoading(false);

    toast.success("Reporte enviado");

    setMessage("");
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-20 text-[var(--foreground)]">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/turnos"
          className="text-sm text-[var(--muted)] underline text-brand"
        >
          Buscar profesionales
        </Link>

        <p className="text-sm text-brand pt-4">
          Soporte
        </p>

        <h1 className="mt-4 text-5xl font-bold">
          Reportar problema
        </h1>

        <p className="mt-4 text-[var(--muted)]">
          Contanos qué ocurrió y vamos a revisarlo.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 premium-card premium-card-hover premium-gradient rounded-3xl p-6"
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            placeholder="Ej: no puedo cargar horarios, error al reservar..."
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-xl bg-brand px-6 py-3 font-medium text-white hover:bg-brand-hover disabled:opacity-60"
          >
            {loading
              ? "Enviando..."
              : "Enviar reporte"}
          </button>
        </form>
      </div>
    </main>
  );
}