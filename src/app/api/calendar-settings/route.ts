import { NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/get-current-tenant";
import { requireTenantPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET() {
  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  return NextResponse.json({
    appointmentBufferMinutes: context.professional.appointmentBufferMinutes || 0,
  });
}

export async function PUT(request: Request) {
  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  
  if (!context?.tenant) {
    return NextResponse.json(
      {
        message:
          "Primero completá la configuración de tu espacio",
      },
      { status: 400 }
    );
  }

  const { tenant, professional, session } = context;

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

  const { appointmentBufferMinutes } = await request.json();

  professional.appointmentBufferMinutes =
    Number(appointmentBufferMinutes) || 0;

  await professional.save();

  await createAuditLog({
    tenant: tenant._id.toString(),
    actor: session.user.id,
    actorRole: "professional",
    action: "calendar.buffer_updated",
    entityType: "Professional",
    entityId: professional._id.toString(),
    message: "Se actualizó el buffer entre turnos",
    metadata: {
      appointmentBufferMinutes,
    },
  });

  return NextResponse.json({
    message: "Configuración actualizada",
    appointmentBufferMinutes: professional.appointmentBufferMinutes,
  });
}