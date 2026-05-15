export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-neutral-800 border-t-brand" />
        <p className="mt-4 text-sm text-neutral-400">Cargando Central Turnos...</p>
      </div>
    </main>
  );
}