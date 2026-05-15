import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const admin = await User.findById(session.user.id);

  if (admin?.role !== "super_admin") {
    return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);

  const severity = searchParams.get("severity");
  const action = searchParams.get("action");

  const query: Record<string, unknown> = {};

  if (severity) query.severity = severity;
  if (action) query.action = action;

  const logs = await AuditLog.find(query)
    .populate("tenant", "name slug")
    .populate("actor", "fullName email role")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return NextResponse.json(logs);
}