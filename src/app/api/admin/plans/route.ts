import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const admin = await User.findById(session.user.id);

  if (admin?.role !== "super_admin") {
    return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
  }

  const { userId, plan } = await request.json();

  if (!userId || !["free", "pro", "premium"].includes(plan)) {
    return NextResponse.json({ message: "Datos inválidos" }, { status: 400 });
  }

  await User.findByIdAndUpdate(userId, { plan });

  return NextResponse.json({ message: "Plan actualizado correctamente" });
}