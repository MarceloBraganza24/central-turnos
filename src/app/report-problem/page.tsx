"use client";

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
    <main className="min-h-screen bg-neutral-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-brand">
          Soporte
        </p>

        <h1 className="mt-4 text-5xl font-bold">
          Reportar problema
        </h1>

        <p className="mt-4 text-neutral-400">
          Contanos qué ocurrió y vamos a revisarlo.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-neutral-800 bg-neutral-900 p-6"
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            placeholder="Ej: no puedo cargar horarios, error al reservar..."
            className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 p-4"
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