"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="bg-[var(--background)] text-[var(--foreground)]">
        <main className="flex min-h-screen items-center justify-center p-6">
          <div className="max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <h1 className="text-2xl font-bold">Algo salió mal</h1>
            <p className="mt-3 text-[var(--muted)]">
              Registramos el error y ya podés intentar nuevamente.
            </p>
            <button
              onClick={reset}
              className="mt-6 rounded-xl bg-white px-5 py-3 font-medium text-black"
            >
              Reintentar
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}