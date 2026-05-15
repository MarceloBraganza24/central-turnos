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

function addMinutes(time: string, minutes: number) {
  const [hours, mins] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes, 0, 0);

  return date.toTimeString().slice(0, 5);
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

  let duration = professional.appointmentDurationMinutes;

  if (serviceId) {
    const service = await Service.findOne({
      _id: serviceId,
      professional: professional._id,
      isActive: true,
    });

    if (service) {
      duration = service.durationMinutes;
    }
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

  const selectedDate = new Date(date + "T00:00:00");
  const dayOfWeek = selectedDate.getDay();

  let availabilityBlocks = await Availability.find({
    tenant: tenant._id,
    professional: professional._id,
    dayOfWeek,
    isActive: true,
  }).sort({ startTime: 1 });

  if (
    exception &&
    exception.type === "special_hours"
  ) {
    availabilityBlocks = [
      {
        startTime: exception.startTime,
        endTime: exception.endTime,
      },
    ];
  }

  const appointments = await Appointment.find({
    tenant: tenant._id,
    professional: professional._id,
    appointmentDate: date,
    status: { $ne: "cancelled" },
  });

  const takenTimes = appointments.map((appointment) => appointment.startTime);

  const slots: string[] = [];

  for (const block of availabilityBlocks) {
    let currentTime = block.startTime;

    while (
      addMinutes(currentTime, duration) <=
      block.endTime
    ) {
      if (!takenTimes.includes(currentTime)) {
        slots.push(currentTime);
      }

      currentTime = addMinutes(
        currentTime,
        duration
      );
    }
  }

  return NextResponse.json(slots);
}