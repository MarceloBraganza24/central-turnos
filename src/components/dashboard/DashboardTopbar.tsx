import { auth, signOut } from "@/auth";
import DashboardMobileNav from "./DashboardMobileNav";

export default async function DashboardTopbar() {
  const session = await auth();

  return (
    <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-6 py-4">
      <div className="flex items-center gap-4">
        <DashboardMobileNav />

        <div>
          <p className="text-sm text-neutral-500">Bienvenido nuevamente</p>
          <h2 className="text-xl font-semibold text-white">
            {session?.user?.name || "Profesional"}
          </h2>
        </div>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-white transition hover:bg-neutral-900">
          Cerrar sesión
        </button>
      </form>
    </header>
  );
}