export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-brand" />
        <p className="mt-4 text-sm text-[var(--muted)]">Cargando Central Turnos...</p>
      </div>
    </main>
  );
}