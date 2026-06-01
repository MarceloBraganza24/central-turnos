import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Professional } from "@/models/Professional";
import { Client } from "@/models/Client";
import { Appointment } from "@/models/Appointment";
import { sendWhatsAppText } from "@/lib/whatsapp";
import {
  isPastDate,
  isValidArgentinaWhatsapp,
  isValidEmail,
  normalizePhone,
} from "@/lib/validations";
import { Tenant } from "@/models/Tenant";
import { createAuditLog } from "@/lib/audit";
import { isTenantBillingBlocked } from "@/lib/billing-guard";
import { Service } from "@/models/Service";
import { reservationRateLimit, getIp } from "@/lib/rate-limit";
import crypto from "crypto";
import { PLAN_LIMITS, type PlanName } from "@/lib/plans";
import "@/models/User";

export const runtime = "nodejs";

function addMinutes(time: string, minutes: number) {
  const [hours, mins] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes, 0, 0);

  return date.toTimeString().slice(0, 5);
}

export async function POST(request: Request) {
  try {

    const ip = getIp(request);

    const rateLimit = await reservationRateLimit.limit(`reservation:${ip}`);

    if (!rateLimit.success) {
      return NextResponse.json(
        { message: "Demasiados intentos de reserva. Probá nuevamente en unos minutos." },
        { status: 429 }
      );
    }
    
    await connectDB();

    const body = await request.json();

    const {
      professionalId,
      appointmentDate,
      startTime,
      fullName,
      phone,
      email,
      notes,
      depositAmount,
      serviceId,
    } = body;

    if (!professionalId || !appointmentDate || !startTime || !fullName || !phone) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    if (isPastDate(appointmentDate)) {
      return NextResponse.json(
        { message: "No se pueden reservar fechas pasadas" },
        { status: 400 }
      );
    }

    if (!isValidArgentinaWhatsapp(phone)) {
      return NextResponse.json(
        { message: "El WhatsApp debe tener formato internacional. Ej: 5492926..." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "El email no tiene un formato válido" },
        { status: 400 }
      );
    }

    const professional = await Professional.findOne({
      _id: professionalId,
      isActive: true,
    });

    if (!professional) {
      return NextResponse.json(
        { message: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    const tenant = await Tenant.findOne({
      professional: professional._id,
      isActive: true,
    });

    if (!tenant) {
      return NextResponse.json(
        { message: "Espacio profesional no encontrado" },
        { status: 404 }
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

    if (isTenantBillingBlocked(tenant)) {
      return NextResponse.json(
        {
          message:
            "Este profesional no puede recibir turnos en este momento. Intentá más tarde.",
        },
        { status: 403 }
      );
    }

    const plan: PlanName =
      tenant.plan === "pro" || tenant.plan === "premium"
        ? tenant.plan
        : "free";

    const limits = PLAN_LIMITS[plan];

    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const monthlyAppointments =
      await Appointment.countDocuments({
        tenant: tenant._id,
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      });

    if (
      limits.monthlyAppointments !== -1 &&
      monthlyAppointments >= limits.monthlyAppointments
    ) {
      return NextResponse.json(
        {
          message:
            "Este profesional alcanzó el límite mensual de turnos de su plan.",
        },
        { status: 403 }
      );
    }

    const existingAppointment = await Appointment.findOne({
      tenant: tenant._id,
      professional: professional._id,
      appointmentDate,
      startTime,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { message: "Ese horario ya fue reservado" },
        { status: 409 }
      );
    }

    const client = await Client.create({
      tenant: tenant._id, 
      fullName,
      phone: normalizePhone(phone),
      email,
    });

    const duration =
      selectedService?.durationMinutes ||
      professional.appointmentDurationMinutes;

    const endTime = addMinutes(startTime, duration);

    const finalDepositAmount = selectedService?.requiresDeposit
      ? selectedService.depositAmount
      : Number(depositAmount) || 0;

    const shouldPayDeposit =
      finalDepositAmount > 0 && limits.canUsePayments;

    const appointment = await Appointment.create({
      tenant: tenant._id,
      professional: professional._id,
      client: client._id,
      appointmentDate,
      startTime,
      endTime,
      notes,
      status: "pending",
      paymentStatus: shouldPayDeposit ? "pending" : "unpaid",
      source: "public",
      service: selectedService?._id || null,
      serviceName: selectedService?.name || "",
      servicePrice: selectedService?.price || 0,
      serviceDurationMinutes: duration,
      depositAmount: finalDepositAmount,
      publicToken: crypto.randomBytes(32).toString("hex"),
    });

    await createAuditLog({
      tenant: tenant._id.toString(),
      actor: null,
      actorRole: "public_user",
      action: "appointment.created",
      entityType: "Appointment",
      entityId: appointment._id.toString(),
      message: "Usuario público reservó un turno",
      metadata: {
        professionalId,
        appointmentDate,
        startTime,
        clientName: fullName,
        clientPhone: normalizePhone(phone),
        requiresPayment: shouldPayDeposit,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const successUrl = `${appUrl}/reserva-exitosa/${appointment._id.toString()}`;
    const confirmUrl = `${appUrl}/api/public/appointments/${appointment._id}/status?action=confirmed`;
    const cancelUrl = `${appUrl}/api/public/appointments/${appointment._id}/status?action=cancelled`;

    const clientMessage = `Hola ${fullName}, tu turno fue reservado.

Profesional: ${professional.displayName}
Fecha: ${appointmentDate}
Horario: ${startTime} a ${endTime}
Estado: pendiente de confirmación

Detalle:
${successUrl}

Confirmar:
${confirmUrl}

Cancelar:
${cancelUrl}`;

    const clientWhatsappResult = await sendWhatsAppText({
      to: phone,
      message: clientMessage,
      tenant: tenant._id.toString(),
      entityId: appointment._id.toString(),
    });

    appointment.whatsappClientStatus = clientWhatsappResult.success
      ? "sent"
      : "failed";

    const professionalMessage = `Nuevo turno reservado.

Cliente: ${client.fullName}
Fecha: ${appointment.appointmentDate}
Horario: ${appointment.startTime} a ${appointment.endTime}
Servicio: ${selectedService?.name || "Consulta"}

Confirmar:
${confirmUrl}

Cancelar:
${cancelUrl}`;

    if (professional.phone) {
      const professionalWhatsappResult = await sendWhatsAppText({
        to: professional.phone,
        message: professionalMessage,
        tenant: tenant._id.toString(),
        entityId: appointment._id.toString(),
      });

      appointment.whatsappProfessionalStatus = professionalWhatsappResult.success
        ? "sent"
        : "failed";

      console.log("WhatsApp cliente:", clientWhatsappResult);
      console.log("WhatsApp profesional:", professionalWhatsappResult);
    }

    await appointment.save();
    
    return NextResponse.json(
      {
        message: "Turno reservado correctamente",
        appointmentId: appointment._id.toString(),
        requiresPayment: shouldPayDeposit,
        publicToken: appointment.publicToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        message: "Error al reservar turno",
      },
      { status: 500 }
    );
  }
}