import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import { sendWhatsAppText } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";
import { acquireLock, releaseLock } from "@/lib/locks";

export const runtime = "nodejs";

type ReminderAppointment = {
  _id: string;
  appointmentDate: string;
  startTime: string;
  reminder24hSent: boolean;
  reminder2hSent: boolean;
  reminder24hProcessing?: boolean;
  reminder2hProcessing?: boolean;
  client?: {
    _id: string;
    fullName?: string;
    phone?: string;
    email?: string;
  };
  professional?: {
    _id: string;
    displayName?: string;
  };
  save: () => Promise<void>;
};

function getDateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function getCurrentHour() {
  return new Date().getHours();
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const lockKey = "cron:reminders";
  const locked = await acquireLock(lockKey, 300);

  if (!locked) {
    return NextResponse.json({
      message: "Cron reminders ya está en ejecución",
    });
  }

  try {
    await connectDB();

    const tomorrow = getDateOffset(1);
    const today = getDateOffset(0);
    const currentHour = getCurrentHour();

    const reminder24hAppointments =
      await Appointment.find({
        appointmentDate: tomorrow,
        status: { $in: ["pending", "confirmed"] },
        reminder24hSent: false,
        reminder24hProcessing: false,
      })
        .populate("client")
        .populate("professional");

    let reminder24hCount = 0;

    for (const appointment of reminder24hAppointments as ReminderAppointment[]) {
      const client = appointment.client;
      const professional = appointment.professional;

      if (!client?.phone || !professional?.displayName) continue;

      appointment.reminder24hProcessing = true;
      await appointment.save();

      try {
        const message = `Recordatorio de turno.

Hola ${client.fullName || "cliente"}, mañana tenés un turno con ${
          professional.displayName
        } a las ${appointment.startTime}.`;

        await sendWhatsAppText({
          to: client.phone,
          message,
          entityId: appointment._id.toString(),
        });

        if (client.email) {
          await sendEmail({
            to: client.email,
            subject: "Recordatorio de turno",
            html: `<p>Hola ${
              client.fullName || "cliente"
            }, mañana tenés un turno con <strong>${
              professional.displayName
            }</strong> a las ${appointment.startTime}.</p>`,
          });
        }

        appointment.reminder24hSent = true;
        reminder24hCount++;
      } finally {
        appointment.reminder24hProcessing = false;
        await appointment.save();
      }
    }

    const todayAppointments =
      await Appointment.find({
        appointmentDate: today,
        status: { $in: ["pending", "confirmed"] },
        reminder2hSent: false,
        reminder2hProcessing: false,
      })
        .populate("client")
        .populate("professional");

    let reminder2hCount = 0;

    for (const appointment of todayAppointments as ReminderAppointment[]) {
      const client = appointment.client;
      const professional = appointment.professional;

      if (!client?.phone || !professional?.displayName) continue;

      const appointmentHour = Number(String(appointment.startTime).slice(0, 2));

      if (appointmentHour - currentHour !== 2) continue;

      appointment.reminder2hProcessing = true;
      await appointment.save();

      try {
        const message = `Recordatorio de turno.

Hola ${client.fullName || "cliente"}, hoy tenés un turno con ${
          professional.displayName
        } a las ${appointment.startTime}.`;

        await sendWhatsAppText({
          to: client.phone,
          message,
          entityId: appointment._id.toString(),
        });

        appointment.reminder2hSent = true;
        reminder2hCount++;
      } finally {
        appointment.reminder2hProcessing = false;
        await appointment.save();
      }
    }

    return NextResponse.json({
      message: "Recordatorios procesados",
      reminder24hCount,
      reminder2hCount,
    });
  } finally {
    await releaseLock(lockKey);
  }
}