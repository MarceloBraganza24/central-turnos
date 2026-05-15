import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}