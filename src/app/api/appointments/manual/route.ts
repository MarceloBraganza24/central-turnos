import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { getCurrentTenant } from "@/lib/get-current-tenant";
import { requireTenantPermission } from "@/lib/permissions";
import { Client } from "@/models/Client";
import { Appointment } from "@/models/Appointment";
import { Service } from "@/models/Service";
import { createAuditLog } from "@/lib/audit";
import { sendWhatsAppText } from "@/lib/whatsapp";
import {
  isPastDate,
  isValidArgentinaWhatsapp,
  isValidEmail,
  normalizePhone,
} from "@/lib/validations";

export const runtime = "nodejs";

function addMinutes(time: string, minutes: number) {
  const [hours, mins] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hours, mins + minutes, 0, 0);

  return date.toTimeString().slice(0, 5);
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const context = await getCurrentTenant();

    if (!context) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    if (!context.tenant) {
      return NextResponse.json(
        { message: "Primero completá la configuración de tu espacio" },
        { status: 400 }
      );
    }

    const { session, tenant, professional } = context;

    const permission = await requireTenantPermission(
      tenant._id.toString(),
      "canManageAppointments"
    );

    if (!permission.allowed) {
      return NextResponse.json(
        { message: permission.message },
        { status: permission.status }
      );
    }

    const body = await request.json();

    const {
      appointmentDate,
      startTime,
      fullName,
      phone,
      email,
      notes,
      serviceId,
      sendWhatsapp,
    } = body;

    if (!appointmentDate || !startTime || !fullName || !phone) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    if (isPastDate(appointmentDate)) {
      return NextResponse.json(
        { message: "No se pueden crear turnos en fechas pasadas" },
        { status: 400 }
      );
    }

    if (!isValidArgentinaWhatsapp(phone)) {
      return NextResponse.json(
        {
          message:
            "El WhatsApp debe tener formato internacional. Ej: 5492926...",
        },
        { status: 400 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { message: "El email no tiene un formato válido" },
        { status: 400 }
      );
    }

    let selectedService = null;

    if (serviceId) {
      selectedService = await Service.findOne({
        _id: serviceId,
        tenant: tenant._id,
        professional: professional._id,
        isActive: true,
      });

      if (!selectedService) {
        return NextResponse.json(
          { message: "Servicio no disponible" },
          { status: 400 }
        );
      }
    }

    const duration =
      Number(selectedService?.durationMinutes) ||
      Number(professional.appointmentDurationMinutes) ||
      30;

    const endTime = addMinutes(startTime, duration);

    const existingAppointment = await Appointment.findOne({
      tenant: tenant._id,
      professional: professional._id,
      appointmentDate,
      startTime,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { message: "Ese horario ya tiene un turno cargado" },
        { status: 409 }
      );
    }

    const client = await Client.create({
      tenant: tenant._id,
      fullName,
      phone: normalizePhone(phone),
      email: email || "",
    });

    const appointment = await Appointment.create({
      tenant: tenant._id,
      professional: professional._id,
      client: client._id,
      appointmentDate,
      startTime,
      endTime,
      notes: notes || "",
      status: "confirmed",
      paymentStatus: "unpaid",
      service: selectedService?._id || null,
      serviceName: selectedService?.name || "",
      servicePrice: selectedService?.price || 0,
      source: "manual",
      createdBy: session.user.id,
      serviceDurationMinutes: duration,
      depositAmount: 0,
      publicToken: crypto.randomBytes(32).toString("hex"),
    });

    await createAuditLog({
      tenant: tenant._id.toString(),
      actor: session.user.id,
      actorRole: "professional",
      action: "appointment.manual_created",
      entityType: "Appointment",
      entityId: appointment._id.toString(),
      message: "Turno creado manualmente desde el dashboard",
      metadata: {
        appointmentDate,
        startTime,
        endTime,
        clientName: fullName,
        clientPhone: normalizePhone(phone),
        serviceId: serviceId || null,
      },
    });

    let whatsappStatus: "sent" | "failed" | "not_sent" = "not_sent";

    if (sendWhatsapp) {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const reservationUrl = `${appUrl}/mi-reserva/${appointment.publicToken}`;

      const message = `Hola ${fullName}, tu turno fue registrado correctamente.

Profesional: ${professional.displayName}
Fecha: ${appointmentDate}
Horario: ${startTime} a ${endTime}
Estado: confirmado

Podés ver tu reserva acá:
${reservationUrl}`;

      const whatsappResult = await sendWhatsAppText({
        to: normalizePhone(phone),
        message,
        tenant: tenant._id.toString(),
        entityId: appointment._id.toString(),
      });

      whatsappStatus = whatsappResult.success ? "sent" : "failed";

      appointment.whatsappClientStatus = whatsappStatus;
      await appointment.save();
    }

    return NextResponse.json(
      {
        message: "Turno creado correctamente",
        appointmentId: appointment._id.toString(),
        publicToken: appointment.publicToken,
        whatsappStatus,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("MANUAL_APPOINTMENT_ERROR", error);

    return NextResponse.json(
      {
        message: "Error al crear turno manual",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}