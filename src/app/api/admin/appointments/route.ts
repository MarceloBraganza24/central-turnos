import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Appointment } from "@/models/Appointment";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const admin = await User.findById(session.user.id);

  if (admin?.role !== "super_admin") {
    return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status");
  const paymentStatus = searchParams.get("paymentStatus");

  const query: Record<string, unknown> = {};

  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  const appointments = await Appointment.find(query)
    .populate("client")
    .populate({
      path: "professional",
      populate: {
        path: "category",
      },
    })
    .sort({ appointmentDate: -1, startTime: -1 })
    .lean();

  return NextResponse.json(appointments);
}