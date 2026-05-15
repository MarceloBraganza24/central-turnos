import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import { getCurrentTenant } from "@/lib/get-current-tenant";
import { createAuditLog } from "@/lib/audit";
import { sendWhatsAppText } from "@/lib/whatsapp";

export const runtime = "nodejs";

type PopulatedClient = {
  _id: string;
  fullName?: string;
  phone?: string;
  email?: string;
};

type PopulatedProfessional = {
  _id: string;
  displayName?: string;
  phone?: string;
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

  const { professional, tenant } = context;

  const appointments = await Appointment.find({
    tenant: tenant._id,
    professional: professional._id,
  })
    .populate("client")
    .sort({ appointmentDate: 1, startTime: 1 })
    .lean();

  if (!professional) {
    return NextResponse.json([]);
  }

  return NextResponse.json(appointments);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const body = await request.json();

  const { appointmentId, status } = body;

  if (!appointmentId || !status) {
    return NextResponse.json(
      { message: "Faltan datos obligatorios" },
      { status: 400 }
    );
  }

  const validStatuses = ["pending", "confirmed", "cancelled", "completed"];

  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { message: "Estado inválido" },
      { status: 400 }
    );
  }

  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { professional, tenant } = context;

  if (!professional) {
    return NextResponse.json(
      { message: "Perfil profesional no encontrado" },
      { status: 404 }
    );
  }

  const appointment = await Appointment.findOneAndUpdate(
    {
      _id: appointmentId,
      tenant: tenant._id,
      professional: professional._id,
    },
    {
      status,
    },
    {
      new: true,
    }
  );

  if (!appointment) {
    return NextResponse.json(
      { message: "Turno no encontrado" },
      { status: 404 }
    );
  }

  await createAuditLog({
    tenant: tenant._id.toString(),
    actor: session.user.id,
    actorRole: "professional",
    action: "appointment.status_changed",
    entityType: "Appointment",
    entityId: appointment._id.toString(),
    message: `Profesional cambió el estado del turno a ${status}`,
    metadata: {
      appointmentId,
      status,
    },
  });

  if (status === "completed") {
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("client")
      .populate("professional");

    const client =
      populatedAppointment?.client as PopulatedClient | null;

    const professional =
      populatedAppointment?.professional as PopulatedProfessional | null;

    if (client?.phone && professional?.displayName) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      await sendWhatsAppText({
        to: client.phone,
        tenant: tenant._id.toString(),
        entityId: appointment._id.toString(),
        message: `Hola ${client.fullName} 👋

  Gracias por asistir a tu turno con ${professional.displayName}.

  ¿Nos dejás una reseña?
  ${appUrl}/review/${appointment._id.toString()}`,
      });
    }
  }

  return NextResponse.json(appointment);
}