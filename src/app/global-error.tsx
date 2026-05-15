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
      <body className="bg-neutral-950 text-white">
        <main className="flex min-h-screen items-center justify-center p-6">
          <div className="max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-8 text-center">
            <h1 className="text-2xl font-bold">Algo salió mal</h1>
            <p className="mt-3 text-neutral-400">
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