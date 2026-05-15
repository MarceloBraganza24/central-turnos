import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Professional } from "@/models/Professional";
import { Availability } from "@/models/Availability";
import { Appointment } from "@/models/Appointment";
import { Tenant } from "@/models/Tenant";
import { ScheduleException } from "@/models/ScheduleException";
import { Service } from "@/models/Service";

export const runtime = "nodejs";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

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
  return timeToMinutes(startA) < timeToMinutes(endB) &&
    timeToMinutes(endA) > timeToMinutes(startB);
}

export async function GET(request: Request, { params }: Props) {
  await connectDB();

  const { id } = await params;
  const { searchParams } = new URL(request.url);

  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!date) {
    return NextResponse.json(
      { message: "Falta la fecha" },
      { status: 400 }
    );
  }

  const professional = await Professional.findOne({
    _id: id,
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

  let duration =
    Number(professional.appointmentDurationMinutes) || 30;

  if (serviceId) {
    const service = await Service.findOne({
      _id: serviceId,
      tenant: tenant._id,
      professional: professional._id,
      isActive: true,
    });

    if (service) {
      duration = Number(service.durationMinutes) || duration;
    }
  }

  const bufferMinutes =
    Number(professional.appointmentBufferMinutes) || 0;

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