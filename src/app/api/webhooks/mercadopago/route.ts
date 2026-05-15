import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { connectDB } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import { sendWhatsAppText } from "@/lib/whatsapp";
import { createAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

type PopulatedClient = {
  _id: string;
  fullName?: string;
  phone?: string;
};

type PopulatedProfessional = {
  _id: string;
  displayName?: string;
  phone?: string;
};

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const paymentId =
      body?.data?.id ||
      body?.id ||
      new URL(request.url).searchParams.get("data.id");

    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

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
      .populate("professional");

    if (!appointment) {
      return NextResponse.json({ received: true });
    }

    appointment.paymentId = String(payment.id || "");

    if (payment.status === "approved") {
      appointment.paymentStatus = "paid";
      appointment.status = "confirmed";
    }

    if (["rejected", "cancelled"].includes(String(payment.status))) {
      appointment.paymentStatus = "failed";
    }

    await appointment.save();

    const tenantId = appointment.tenant?.toString?.() || null;

    await createAuditLog({
      tenant: tenantId,
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
      const clientData = appointment.client as PopulatedClient | null;
      const professional =
        appointment.professional as PopulatedProfessional | null;

      if (clientData?.phone && professional?.displayName) {
        await sendWhatsAppText({
          to: clientData.phone,
          tenant: tenantId,
          entityId: appointment._id.toString(),
          message: `Pago recibido. Tu turno con ${professional.displayName} quedó confirmado para el ${appointment.appointmentDate} a las ${appointment.startTime}.`,
        });
      }

      if (professional?.phone && clientData?.fullName) {
        await sendWhatsAppText({
          to: professional.phone,
          tenant: tenantId,
          entityId: appointment._id.toString(),
          message: `Se pagó la seña de un turno.

Cliente: ${clientData.fullName}
Fecha: ${appointment.appointmentDate}
Horario: ${appointment.startTime}`,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);

    await createAuditLog({
      actorRole: "system",
      action: "payment.webhook_failed",
      entityType: "Payment",
      message: "Falló el procesamiento del webhook de Mercado Pago",
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      severity: "error",
    });

    return NextResponse.json(
      {
        message: "Webhook processing failed",
      },
      {
        status: 500,
      }
    );
  }
}