import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Availability } from "@/models/Availability";
import { timesOverlap } from "@/lib/validations";
import { getCurrentTenant } from "@/lib/get-current-tenant";
import { deleteCacheByPattern } from "@/lib/cache";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { professional, tenant } = context;

  if (!professional) {
    return NextResponse.json([]);
  }

  const availability = await Availability.find({
    tenant: tenant._id,
    professional: professional._id,
  }).sort({ dayOfWeek: 1, startTime: 1 });

  return NextResponse.json(availability);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const body = await request.json();

  const { dayOfWeek, startTime, endTime } = body;

  if (dayOfWeek === undefined || !startTime || !endTime) {
    return NextResponse.json(
      { message: "Faltan datos obligatorios" },
      { status: 400 }
    );
  }

  if (startTime >= endTime) {
    return NextResponse.json(
      { message: "La hora de inicio debe ser menor a la hora de fin" },
      { status: 400 }
    );
  }

  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { professional, tenant } = context;

  if (!professional) {
    return NextResponse.json(
      { message: "No existe perfil profesional" },
      { status: 404 }
    );
  }

  const existingBlocks = await Availability.find({
    tenant: tenant._id,
    professional: professional._id,
    dayOfWeek,
    isActive: true,
  });

  const duplicatedOrOverlapped = existingBlocks.some((block) =>
    timesOverlap(startTime, endTime, block.startTime, block.endTime)
  );

  if (duplicatedOrOverlapped) {
    return NextResponse.json(
      { message: "Ese horario se superpone con otro ya cargado" },
      { status: 409 }
    );
  }

  const availability = await Availability.create({
    tenant: tenant._id,
    professional: professional._id,
    dayOfWeek,
    startTime,
    endTime,
  });

  await deleteCacheByPattern("public:*");

  return NextResponse.json(availability, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "Falta el ID del horario" },
      { status: 400 }
    );
  }

  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { professional, tenant } = context;

  if (!professional) {
    return NextResponse.json(
      { message: "No existe perfil profesional" },
      { status: 404 }
    );
  }

  await Availability.deleteOne({
    _id: id,
    tenant: tenant._id,
    professional: professional._id,
  });

  return NextResponse.json({
    message: "Horario eliminado correctamente",
  });
}