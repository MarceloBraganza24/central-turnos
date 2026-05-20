import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import { getCurrentTenant } from "@/lib/get-current-tenant";

export const runtime = "nodejs";

type AppointmentWithClient = {
  _id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  client?: {
    _id: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  
  if (!context?.tenant) {
    return NextResponse.json(
      {
        message:
          "Primero completá la configuración de tu espacio",
      },
      { status: 400 }
    );
  }

  const { professional, tenant } = context;

  if (!professional) {
    return NextResponse.json([]);
  }

  const appointments = await Appointment.find({
    tenant: tenant._id,
    professional: professional._id,
  })
    .populate("client")
    .sort({ appointmentDate: -1, startTime: -1 })
    .lean<AppointmentWithClient[]>();

  const clientsMap = new Map();

  for (const appointment of appointments) {
    const client = appointment.client;

    if (!client) continue;

    const clientId = client._id.toString();

    if (!clientsMap.has(clientId)) {
      clientsMap.set(clientId, {
        _id: clientId,
        fullName: client.fullName,
        phone: client.phone,
        email: client.email,
        totalAppointments: 0,
        lastAppointmentDate: appointment.appointmentDate,
        lastAppointmentTime: appointment.startTime,
        appointments: [],
      });
    }

    const currentClient = clientsMap.get(clientId);

    currentClient.totalAppointments += 1;

    currentClient.appointments.push({
      _id: appointment._id.toString(),
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      notes: appointment.notes,
    });
  }

  const clients = Array.from(clientsMap.values());

  return NextResponse.json(clients);
}