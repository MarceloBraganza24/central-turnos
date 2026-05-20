import { NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/get-current-tenant";
import { requireTenantPermission } from "@/lib/permissions";
import { Service } from "@/models/Service";
import { createAuditLog } from "@/lib/audit";
import { deleteCacheByPattern } from "@/lib/cache";

export const runtime = "nodejs";

export async function GET() {
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

  const { tenant, professional } = context;

  const services = await Service.find({
    tenant: tenant._id,
    professional: professional._id,
  })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(services);
}

export async function POST(request: Request) {
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
    "canManageSettings"
  );

  if (!permission.allowed) {
    return NextResponse.json(
      { message: permission.message },
      { status: permission.status }
    );
  }

  const body = await request.json();

  const {
    name,
    description,
    durationMinutes,
    price,
    requiresDeposit,
    depositAmount,
  } = body;

  if (!name || !durationMinutes) {
    return NextResponse.json(
      { message: "Nombre y duración son obligatorios" },
      { status: 400 }
    );
  }

  const service = await Service.create({
    tenant: tenant._id,
    professional: professional._id,
    name,
    description,
    durationMinutes: Number(durationMinutes),
    price: Number(price) || 0,
    requiresDeposit: Boolean(requiresDeposit),
    depositAmount: Number(depositAmount) || 0,
    isActive: true,
  });

  await deleteCacheByPattern("public:*");

  await createAuditLog({
    tenant: tenant._id.toString(),
    actor: session.user.id,
    actorRole: "professional",
    action: "service.created",
    entityType: "Service",
    entityId: service._id.toString(),
    message: "Profesional creó un servicio",
    metadata: { name, durationMinutes, price },
  });

  return NextResponse.json(service, { status: 201 });
}

export async function PATCH(request: Request) {
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

  const { tenant, professional } = context;

  const body = await request.json();
  const { serviceId, ...data } = body;

  const service = await Service.findOneAndUpdate(
    {
      _id: serviceId,
      tenant: tenant._id,
      professional: professional._id,
    },
    {
      ...data,
      durationMinutes: Number(data.durationMinutes),
      price: Number(data.price) || 0,
      depositAmount: Number(data.depositAmount) || 0,
      requiresDeposit: Boolean(data.requiresDeposit),
    },
    { new: true }
  );

  if (!service) {
    return NextResponse.json({ message: "Servicio no encontrado" }, { status: 404 });
  }

  return NextResponse.json(service);
}