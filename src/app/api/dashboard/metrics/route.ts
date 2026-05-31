import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import { Client } from "@/models/Client";
import { getCurrentTenant } from "@/lib/get-current-tenant";
import { requireTenantPermission } from "@/lib/permissions";

export const runtime = "nodejs";

export async function GET() {
  await connectDB();

  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json(
      { message: "No autorizado" },
      { status: 401 }
    );
  }

  if (!context.tenant) {
    return NextResponse.json({
      todayAppointments: 0,
      weekAppointments: 0,
      totalClients: 0,
      estimatedIncome: 0,
      needsTenantSetup: true,
    });
  }

  const professional = context.professional;
  const tenant = context.tenant;

  const permission = await requireTenantPermission(
    tenant._id.toString(),
    "canViewReports"
  );

  if (!permission.allowed) {
    return NextResponse.json(
      { message: permission.message },
      { status: permission.status }
    );
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
    tenant: tenant._id,
    professional: professional._id,
    appointmentDate: today,
    status: { $ne: "cancelled" },
  });

  const weekAppointments = await Appointment.countDocuments({
    tenant: tenant._id,
    professional: professional._id,
    appointmentDate: { $gte: weekStart, $lte: weekEnd },
    status: { $ne: "cancelled" },
  });

  const clientIds = await Appointment.find({
    tenant: tenant._id,
    professional: professional._id,
  }).distinct("client");

  const totalClients = await Client.countDocuments({
    tenant: tenant._id,
    _id: { $in: clientIds },
  });

  const estimatedIncome =
    weekAppointments * Number(professional.price || 0);

  return NextResponse.json({
    todayAppointments,
    weekAppointments,
    totalClients,
    estimatedIncome,
    needsTenantSetup: false,
  });
}