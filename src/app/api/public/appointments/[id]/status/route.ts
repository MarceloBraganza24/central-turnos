import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Props) {
  await connectDB();

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (!["confirmed", "cancelled"].includes(String(action))) {
    return NextResponse.json({ message: "Acción inválida" }, { status: 400 });
  }

  const appointment = await Appointment.findByIdAndUpdate(
    id,
    { status: action },
    { new: true }
  );

  if (!appointment) {
    return NextResponse.json({ message: "Turno no encontrado" }, { status: 404 });
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/reserva-exitosa/${id}?status=${action}`
  );
}