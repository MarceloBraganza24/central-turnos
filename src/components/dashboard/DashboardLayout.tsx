import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import DashboardBottomNav from "./DashboardBottomNav";
import PendingAppointmentsNotifier from "@/components/dashboard/PendingAppointmentsNotifier";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <DashboardSidebar />

      <div className="flex flex-1 flex-col">
        <DashboardTopbar />

        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 lg:pb-6">
          {children}
        </main>

        <DashboardBottomNav />
      </div>
      <PendingAppointmentsNotifier />
    </div>
  );
}