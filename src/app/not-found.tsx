import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6 text-[var(--foreground)]">
      <div className="max-w-md text-center">
        <p className="text-sm text-brand">404</p>

        <h1 className="mt-3 text-4xl font-bold">Página no encontrada</h1>

        <p className="mt-3 text-[var(--muted)]">
          El enlace puede haber cambiado o el espacio ya no está disponible.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-brand px-5 py-3 font-medium text-[var(--foreground)] hover:bg-brand-hover"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}