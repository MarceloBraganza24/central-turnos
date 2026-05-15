import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { connectDB } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";

export const runtime = "nodejs";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  await connectDB();

  const { appointmentId } = await request.json();

  if (!appointmentId) {
    return NextResponse.json({ message: "Falta appointmentId" }, { status: 400 });
  }

  const appointment = await Appointment.findById(appointmentId)
    .populate("tenant")
    .populate("client")
    .populate("professional");

  if (!appointment) {
    return NextResponse.json({ message: "Turno no encontrado" }, { status: 404 });
  }

  if (!appointment.depositAmount || appointment.depositAmount <= 0) {
    return NextResponse.json(
      { message: "Este turno no requiere seña" },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const preference = new Preference(client);

  const result = await preference.create({
    body: {
      items: [
        {
          id: appointment._id.toString(),
          title: "Seña de turno",
          quantity: 1,
          unit_price: Number(appointment.depositAmount),
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: `${appUrl}/reserva-exitosa/${appointment._id}?payment=success`,
        failure: `${appUrl}/reserva-exitosa/${appointment._id}?payment=failure`,
        pending: `${appUrl}/reserva-exitosa/${appointment._id}?payment=pending`,
      },
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      external_reference: appointment._id.toString(),
    },
  });

  appointment.paymentPreferenceId = result.id || "";
  appointment.paymentStatus = "pending";
  await appointment.save();

  return NextResponse.json({
    initPoint: result.init_point,
    preferenceId: result.id,
  });
}