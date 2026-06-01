import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentTenant } from "@/lib/get-current-tenant";
import { Availability } from "@/models/Availability";
import { Appointment } from "@/models/Appointment";
import { ScheduleException } from "@/models/ScheduleException";

export const runtime = "nodejs";

type AvailabilityBlock = {
  startTime: string;
  endTime: string;
};

type AppointmentItem = {
  startTime: string;
  endTime: string;
};

type ManualBlock = {
  startTime: string;
  endTime: string;
};

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

function addMinutes(time: string, minutes: number) {
  return minutesToTime(timeToMinutes(time) + minutes);
}

function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  return (
    timeToMinutes(startA) < timeToMinutes(endB) &&
    timeToMinutes(endA) > timeToMinutes(startB)
  );
}

export async function GET(request: Request) {
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

  const { tenant, professional } = context;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { message: "Falta la fecha" },
      { status: 400 }
    );
  }

  const exception = await ScheduleException.findOne({
    tenant: tenant._id,
    professional: professional._id,
    date,
  });

  if (
    exception &&
    ["vacation", "holiday"].includes(exception.type)
  ) {
    return NextResponse.json([]);
  }

  const selectedDate = new Date(`${date}T00:00:00`);
  const dayOfWeek = selectedDate.getDay();

  let availabilityBlocks = (await Availability.find({
    tenant: tenant._id,
    professional: professional._id,
    dayOfWeek,
    isActive: true,
  })
    .sort({ startTime: 1 })
    .lean()) as AvailabilityBlock[];

  if (
    exception &&
    exception.type === "special_hours" &&
    exception.startTime &&
    exception.endTime
  ) {
    availabilityBlocks = [
      {
        startTime: exception.startTime,
        endTime: exception.endTime,
      },
    ];
  }

  const manualBlocks = (await ScheduleException.find({
    tenant: tenant._id,
    professional: professional._id,
    date,
    type: "manual_block",
  }).lean()) as ManualBlock[];

  const appointments = (await Appointment.find({
    tenant: tenant._id,
    professional: professional._id,
    appointmentDate: date,
    status: { $ne: "cancelled" },
  }).lean()) as AppointmentItem[];

  const duration =
    Number(professional.appointmentDurationMinutes) || 30;

  const bufferMinutes =
    Number(professional.appointmentBufferMinutes) || 0;

  const slots: string[] = [];

  for (const block of availabilityBlocks) {
    let currentTime = block.startTime;

    while (addMinutes(currentTime, duration) <= block.endTime) {
      const slotStart = currentTime;
      const slotEnd = addMinutes(slotStart, duration);

      const overlapsAppointment = appointments.some((appointment) =>
        rangesOverlap(
          slotStart,
          slotEnd,
          appointment.startTime,
          appointment.endTime
        )
      );

      const overlapsManualBlock = manualBlocks.some((manualBlock) =>
        rangesOverlap(
          slotStart,
          slotEnd,
          manualBlock.startTime,
          manualBlock.endTime
        )
      );

      if (!overlapsAppointment && !overlapsManualBlock) {
        slots.push(slotStart);
      }

      currentTime = addMinutes(
        currentTime,
        duration + bufferMinutes
      );
    }
  }

  return NextResponse.json(slots);
}