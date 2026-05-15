import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Professional } from "@/models/Professional";
import { createAuditLog } from "@/lib/audit";
import { Tenant } from "@/models/Tenant";
import { deleteCacheByPattern } from "@/lib/cache";

export const runtime = "nodejs";

async function checkSuperAdmin(userId: string) {
  const user = await User.findById(userId);

  return user?.role === "super_admin";
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const isSuperAdmin = await checkSuperAdmin(session.user.id);

  if (!isSuperAdmin) {
    return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
  }

  const professionals = await Professional.find()
    .populate("user", "fullName email role isActive plan")
    .populate("category")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(professionals);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const isSuperAdmin = await checkSuperAdmin(session.user.id);

  if (!isSuperAdmin) {
    return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
  }

  const body = await request.json();

  const { professionalId, isActive } = body;

  if (!professionalId || typeof isActive !== "boolean") {
    return NextResponse.json(
      { message: "Faltan datos obligatorios" },
      { status: 400 }
    );
  }

  const professional = await Professional.findByIdAndUpdate(
    professionalId,
    { isActive },
    { new: true }
  );

  if (!professional) {
    return NextResponse.json(
      { message: "Profesional no encontrado" },
      { status: 404 }
    );
  }

  const tenant = await Tenant.findOne({
    professional: professional._id,
  });

  await deleteCacheByPattern("public:*");

  await createAuditLog({
    tenant: tenant?._id?.toString() || null,
    actor: session.user.id,
    actorRole: "super_admin",
    action: isActive ? "professional.approved" : "professional.disabled",
    entityType: "Professional",
    entityId: professional._id.toString(),
    message: isActive
      ? "Super admin aprobó un profesional"
      : "Super admin desactivó un profesional",
    metadata: {
      professionalId,
      isActive,
    },
  });

  return NextResponse.json({
    message: isActive
      ? "Profesional aprobado correctamente"
      : "Profesional desactivado correctamente",
    professional,
  });
}