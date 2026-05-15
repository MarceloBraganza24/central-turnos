"use client";

export default function DashboardError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="flex min-h-[60vh] items-center justify-center text-white">
      <div className="max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-8 text-center">
        <h1 className="text-2xl font-bold">No pudimos cargar esta sección</h1>

        <p className="mt-3 text-sm text-neutral-400">
          Puede haber sido un error temporal. Probá nuevamente.
        </p>

        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-brand px-5 py-3 font-medium text-white hover:bg-brand-hover"
        >
          Reintentar
        </button>
      </div>
    </section>
  );
}