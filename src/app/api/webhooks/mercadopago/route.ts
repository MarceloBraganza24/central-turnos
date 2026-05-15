import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { connectDB } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import { sendWhatsAppText } from "@/lib/whatsapp";
import { createAuditLog } from "@/lib/audit";
import { acquireLock, releaseLock } from "@/lib/locks";

export const runtime = "nodejs";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  await connectDB();

  const body = await request.json();

  const paymentId =
    body?.data?.id ||
    body?.id ||
    new URL(request.url).searchParams.get("data.id");

  if (!paymentId) {
    return NextResponse.json({ received: true });
  }

  const lockKey = `webhook:mercadopago:payment:${paymentId}`;

  const locked = await acquireLock(lockKey, 120);

  if (!locked) {
    return NextResponse.json({
      received: true,
      message: "Webhook ya está siendo procesado",
    });
  }

  try {
    const eventKey = `mercadopago:${paymentId}`;

    const paymentClient = new Payment(client);

    const payment = await paymentClient.get({
      id: paymentId,
    });

    const appointmentId = payment.external_reference;

    if (!appointmentId) {
      return NextResponse.json({ received: true });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate("tenant")
      .populate("client")
      .populate("professional")

    if (!appointment) {
      return NextResponse.json({ received: true });
    }

    if (appointment.webhookEvents?.includes(eventKey)) {
      await createAuditLog({
        tenant: appointment.tenant?.toString?.() || null,
        actorRole: "system",
        action: "payment.webhook_duplicate",
        entityType: "Appointment",
        entityId: appointment._id.toString(),
        message: "Webhook duplicado ignorado",
        metadata: { paymentId },
        severity: "warning",
      });

      return NextResponse.json({ received: true, duplicated: true });
    }

    appointment.paymentId = String(payment.id || "");

    if (payment.status === "approved") {
      appointment.paymentStatus = "paid";
      appointment.status = "confirmed";
    }

    if (["rejected", "cancelled"].includes(String(payment.status))) {
      appointment.paymentStatus = "failed";
    }

    appointment.webhookEvents.push(eventKey);
    appointment.paymentProcessedAt = new Date();

    await appointment.save();

    await createAuditLog({
      tenant: appointment.tenant?.toString?.() || null,
      actor: null,
      actorRole: "system",
      action: "payment.webhook_received",
      entityType: "Appointment",
      entityId: appointment._id.toString(),
      message: `Webhook Mercado Pago recibido con estado ${payment.status}`,
      metadata: {
        paymentId: payment.id,
        paymentStatus: payment.status,
        appointmentId,
      },
      severity: payment.status === "approved" ? "info" : "warning",
    });

    if (payment.status === "approved") {
      appointment.paymentStatus = "paid";
      appointment.status = "confirmed";
      const clientData = appointment.client;
      const professional = appointment.professional;

      const tenantId = appointment.tenant?.toString() || null;

      if (clientData?.phone && professional?.displayName) {
        await sendWhatsAppText({
          to: clientData.phone,
          message: `Pago recibido. Tu turno con ${professional.displayName} quedó confirmado para el ${appointment.appointmentDate} a las ${appointment.startTime}.`,
          tenant: tenantId,
          entityId: appointment._id.toString(),
        });
      }

      if (professional?.phone && clientData?.fullName) {
        await sendWhatsAppText({
          to: professional.phone,
          message: `Se pagó la seña de un turno.

      Cliente: ${clientData.fullName}
      Fecha: ${appointment.appointmentDate}
      Horario: ${appointment.startTime}`,
          tenant: tenantId,
          entityId: appointment._id.toString(),
        });
      }

      await sendWhatsAppText({
        to: clientData.phone,
        message: `Pago recibido. Tu turno con ${professional.displayName} quedó confirmado para el ${appointment.appointmentDate} a las ${appointment.startTime}.`,
      });

      if (professional.phone) {
        await sendWhatsAppText({
          to: professional.phone,
          message: `Se pagó la seña de un turno.

  Cliente: ${clientData.fullName}
  Fecha: ${appointment.appointmentDate}
  Horario: ${appointment.startTime}`,
        });
      }
    }

    return NextResponse.json({ received: true });
  } finally {
    await releaseLock(lockKey);
  }

  
}