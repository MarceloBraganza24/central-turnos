import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Professional } from "@/models/Professional";
import { Appointment } from "@/models/Appointment";
import { Client } from "@/models/Client";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const professional = await Professional.findOne({
    user: session.user.id,
  });

  if (!professional) {
    return NextResponse.json({
      todayAppointments: 0,
      weekAppointments: 0,
      totalClients: 0,
      estimatedIncome: 0,
    });
  }

  const today = new Date().toISOString().split("T")[0];

  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1));

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const weekStart = monday.toISOString().split("T")[0];
  const weekEnd = sunday.toISOString().split("T")[0];

  const todayAppointments = await Appointment.countDocuments({
    professional: professional._id,
    appointmentDate: today,
    status: { $ne: "cancelled" },
  });

  const weekAppointments = await Appointment.countDocuments({
    professional: professional._id,
    appointmentDate: { $gte: weekStart, $lte: weekEnd },
    status: { $ne: "cancelled" },
  });

  const appointments = await Appointment.find({
    professional: professional._id,
  }).distinct("client");

  const totalClients = await Client.countDocuments({
    _id: { $in: appointments },
  });

  const estimatedIncome = weekAppointments * Number(professional.price || 0);

  return NextResponse.json({
    todayAppointments,
    weekAppointments,
    totalClients,
    estimatedIncome,
  });
}