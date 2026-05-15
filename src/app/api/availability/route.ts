import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Availability } from "@/models/Availability";
import { timesOverlap } from "@/lib/validations";
import { getCurrentTenant } from "@/lib/get-current-tenant";
import { deleteCacheByPattern } from "@/lib/cache";
import { requireTenantPermission } from "@/lib/permissions";

export const runtime = "nodejs";

async function getAvailabilityContext() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      ),
    };
  }

  await connectDB();

  const context = await getCurrentTenant();

  if (!context) {
    return {
      error: NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      ),
    };
  }

  const { professional, tenant } = context;

  if (!professional) {
    return {
      error: NextResponse.json(
        { message: "No existe perfil profesional" },
        { status: 404 }
      ),
    };
  }

  return {
    session,
    professional,
    tenant,
  };
}

async function checkAvailabilityPermission(tenantId: string) {
  const permission = await requireTenantPermission(
    tenantId,
    "canManageAvailability"
  );

  if (!permission.allowed) {
    return NextResponse.json(
      { message: permission.message },
      { status: permission.status }
    );
  }

  return null;
}

export async function GET() {
  const context = await getAvailabilityContext();

  if ("error" in context) {
    return context.error;
  }

  const { professional, tenant } = context;

  const permissionError = await checkAvailabilityPermission(
    tenant._id.toString()
  );

  if (permissionError) {
    return permissionError;
  }

  const availability = await Availability.find({
    tenant: tenant._id,
    professional: professional._id,
  }).sort({
    dayOfWeek: 1,
    startTime: 1,
  });

  return NextResponse.json(availability);
}

export async function POST(request: Request) {
  const context = await getAvailabilityContext();

  if ("error" in context) {
    return context.error;
  }

  const { professional, tenant } = context;

  const permissionError = await checkAvailabilityPermission(
    tenant._id.toString()
  );

  if (permissionError) {
    return permissionError;
  }

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
  const context = await getAvailabilityContext();

  if ("error" in context) {
    return context.error;
  }

  const { professional, tenant } = context;

  const permissionError = await checkAvailabilityPermission(
    tenant._id.toString()
  );

  if (permissionError) {
    return permissionError;
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "Falta el ID del horario" },
      { status: 400 }
    );
  }

  await Availability.deleteOne({
    _id: id,
    tenant: tenant._id,
    professional: professional._id,
  });

  await deleteCacheByPattern("public:*");

  return NextResponse.json({
    message: "Horario eliminado correctamente",
  });
}