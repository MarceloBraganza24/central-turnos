import { NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/get-current-tenant";
import { requireTenantPermission } from "@/lib/permissions";
import { ScheduleException } from "@/models/ScheduleException";

export const runtime = "nodejs";

export async function GET() {
  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json(
      { message: "No autorizado" },
      { status: 401 }
    );
  }

  const professional = context.professional;
  const tenant = context.tenant;

  const permission = await requireTenantPermission(
    tenant._id.toString(),
    "canManageAvailability"
  );

  if (!permission.allowed) {
    return NextResponse.json(
      { message: permission.message },
      { status: permission.status }
    );
  }

  const exceptions = await ScheduleException.find({
    tenant: tenant._id,
    professional: professional._id,
  }).sort({ date: 1 });

  return NextResponse.json(exceptions);
}

export async function POST(request: Request) {
  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json(
      { message: "No autorizado" },
      { status: 401 }
    );
  }

  const professional = context.professional;
  const tenant = context.tenant;

  const permission = await requireTenantPermission(
    tenant._id.toString(),
    "canManageAvailability"
  );

  if (!permission.allowed) {
    return NextResponse.json(
      { message: permission.message },
      { status: permission.status }
    );
  }

  const body = await request.json();

  const {
    date,
    type,
    isWorkingDay,
    startTime,
    endTime,
    reason,
  } = body;

  if (!date || !type) {
    return NextResponse.json(
      { message: "Faltan datos obligatorios" },
      { status: 400 }
    );
  }

  const exception = await ScheduleException.create({
    tenant: tenant._id,
    professional: professional._id,
    date,
    type,
    isWorkingDay,
    startTime,
    endTime,
    reason,
  });

  return NextResponse.json(exception, { status: 201 });
}

export async function DELETE(request: Request) {
  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json(
      { message: "No autorizado" },
      { status: 401 }
    );
  }

  const professional = context.professional;
  const tenant = context.tenant;

  const permission = await requireTenantPermission(
    tenant._id.toString(),
    "canManageAvailability"
  );

  if (!permission.allowed) {
    return NextResponse.json(
      { message: permission.message },
      { status: permission.status }
    );
  }

  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "Falta id" },
      { status: 400 }
    );
  }

  await ScheduleException.deleteOne({
    _id: id,
    tenant: tenant._id,
    professional: professional._id,
  });

  return NextResponse.json({
    message: "Excepción eliminada",
  });
}