"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function ReviewPage() {
  const params = useParams();
  const appointmentId = params.appointmentId as string;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    const response = await fetch("/api/public/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appointmentId,
        rating,
        comment,
      }),
    });

    const data = await response.json();

    setSaving(false);

    if (!response.ok) {
      toast.error(data.message || "Error al enviar reseña");
      return;
    }

    setSent(true);
    toast.success("Gracias por tu reseña");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6 text-[var(--foreground)]">
      <section className="w-full max-w-xl rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8">
        {sent ? (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-brand text-2xl font-bold">
              ✓
            </div>

            <h1 className="mt-5 text-3xl font-bold">Gracias por tu reseña</h1>

            <p className="mt-3 text-[var(--muted)]">
              Tu opinión ayuda a otros clientes a elegir mejor.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl bg-brand px-5 py-3 font-medium text-[var(--foreground)] hover:bg-brand-hover"
            >
              Volver al inicio
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-brand">Central Turnos</p>

            <h1 className="mt-3 text-3xl font-bold">
              ¿Cómo fue tu atención?
            </h1>

            <p className="mt-2 text-[var(--muted)]">
              Calificá tu experiencia con el profesional.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label className="mb-3 block text-sm text-neutral-300">
                  Calificación
                </label>

                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border text-xl ${
                        rating >= value
                          ? "border-brand bg-brand text-[var(--foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)]"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Comentario opcional
                </label>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                  className="min-h-32 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                  placeholder="Contá brevemente cómo fue tu experiencia..."
                />

                <p className="mt-2 text-xs text-[var(--muted)]">
                  {comment.length}/500
                </p>
              </div>

              <button
                disabled={saving}
                className="w-full rounded-xl bg-brand py-3 font-medium text-[var(--foreground)] hover:bg-brand-hover disabled:opacity-60"
              >
                {saving ? "Enviando..." : "Enviar reseña"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}