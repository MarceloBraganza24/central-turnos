import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Professional } from "@/models/Professional";
import { Appointment } from "@/models/Appointment";
import { Category } from "@/models/Category";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const admin = await User.findById(session.user.id);

  if (admin?.role !== "super_admin") {
    return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
  }

  const [
    totalProfessionals,
    activeProfessionals,
    pendingProfessionals,
    totalAppointments,
    activeCategories,
  ] = await Promise.all([
    Professional.countDocuments(),
    Professional.countDocuments({ isActive: true }),
    Professional.countDocuments({ isActive: false }),
    Appointment.countDocuments(),
    Category.countDocuments({ isActive: true }),
  ]);

  return NextResponse.json({
    totalProfessionals,
    activeProfessionals,
    pendingProfessionals,
    totalAppointments,
    activeCategories,
  });
}