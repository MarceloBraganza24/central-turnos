import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentTenant } from "@/lib/get-current-tenant";
import { Appointment } from "@/models/Appointment";
import "@/models/Client";

export const runtime = "nodejs";

export async function GET() {
  const context = await getCurrentTenant();

  if (!context?.tenant || !context.professional) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const count = await Appointment.countDocuments({
    tenant: context.tenant._id,
    professional: context.professional._id,
    status: "pending",
  });

  const latestPending = await Appointment.findOne({
    tenant: context.tenant._id,
    professional: context.professional._id,
    status: "pending",
  })
    .sort({ createdAt: -1 })
    .populate("client")
    .lean();

  return NextResponse.json({
    count,
    latestPending: latestPending
      ? {
          _id: latestPending._id.toString(),
          appointmentDate: latestPending.appointmentDate,
          startTime: latestPending.startTime,
          clientName:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (latestPending.client as any)?.fullName || "Cliente",
        }
      : null,
  });
}