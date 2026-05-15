import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import DashboardMobileNav from "./DashboardMobileNav";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function DashboardTopbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/80 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between">
        <DashboardMobileNav />

        <div>
          <p className="text-sm text-neutral-500">Central Turnos</p>
          <p className="text-sm font-medium text-white">
            {session?.user?.email || "Usuario"}
          </p>
        </div>

        <LogoutButton />
      </div>
    </header>
  );
}