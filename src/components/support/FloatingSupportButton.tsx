"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function FloatingSupportButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-50 lg:bottom-6">
      {open && (
        <div className="mb-3 w-[320px] overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--background)] shadow-2xl">
          <div className="border-b border-[var(--border)] bg-brand p-5 text-[var(--foreground)]">
            <p className="text-sm opacity-80">
              Soporte Central Turnos
            </p>

            <h3 className="mt-1 text-lg font-semibold text-white">
              ¿Necesitás ayuda?
            </h3>
          </div>

          <div className="space-y-3 p-4">
            <Link
              href="/"
              className="flex items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-brand/40"
            >
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  Ir al inicio
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Volver
                </p>
              </div>
            </Link>

            <a
              href="https://wa.me/5492926459172"
              target="_blank"
              className="flex items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-brand/40"
            >
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  WhatsApp soporte
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Respuesta rápida
                </p>
              </div>
            </a>

            <a
              href="mailto:marceebraga@gmail.com"
              className="flex items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-brand/40"
            >
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  Email soporte
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  soporte@centralturnos.com
                </p>
              </div>
            </a>

            <Link
              href="/help"
              className="flex items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-brand/40"
            >
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  Centro de ayuda
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Guías y preguntas frecuentes
                </p>
              </div>
            </Link>

            <Link
              href="/report-problem"
              className="flex items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-brand/40"
            >
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  Reportar problema
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Bugs o errores del sistema
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-[var(--foreground)] shadow-2xl transition hover:bg-brand-hover"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}