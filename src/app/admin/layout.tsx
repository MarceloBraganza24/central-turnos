import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export const runtime = "nodejs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findById(session.user.id).lean();

  if (!user || user.role !== "super_admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}