import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentTenant } from "@/lib/get-current-tenant";
import { requireTenantPermission } from "@/lib/permissions";
import { ROLE_PERMISSIONS, TenantRole } from "@/lib/role-permissions";
import { User } from "@/models/User";
import { TenantMember } from "@/models/TenantMember";
import { createAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET() {
  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { tenant } = context;

  const permission = await requireTenantPermission(
    tenant._id.toString(),
    "canManageTeam"
  );

  if (!permission.allowed) {
    return NextResponse.json(
      { message: permission.message },
      { status: permission.status }
    );
  }

  const members = await TenantMember.find({
    tenant: tenant._id,
  })
    .populate("user", "fullName email role isActive")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(members);
}

export async function POST(request: Request) {
  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { tenant, session } = context;

  const permission = await requireTenantPermission(
    tenant._id.toString(),
    "canManageTeam"
  );

  if (!permission.allowed) {
    return NextResponse.json(
      { message: permission.message },
      { status: permission.status }
    );
  }

  const body = await request.json();

  const { fullName, email, password, role } = body;

  if (!fullName || !email || !password || !role) {
    return NextResponse.json(
      { message: "Faltan datos obligatorios" },
      { status: 400 }
    );
  }

  if (!ROLE_PERMISSIONS[role as TenantRole]) {
    return NextResponse.json({ message: "Rol inválido" }, { status: 400 });
  }

  let user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "professional",
      isActive: true,
    });
  }

  const member = await TenantMember.findOneAndUpdate(
    {
      tenant: tenant._id,
      user: user._id,
    },
    {
      tenant: tenant._id,
      user: user._id,
      role,
      permissions: ROLE_PERMISSIONS[role as TenantRole],
      isActive: true,
    },
    {
      new: true,
      upsert: true,
    }
  );

  await createAuditLog({
    tenant: tenant._id.toString(),
    actor: session.user.id,
    actorRole: "tenant_admin",
    action: "team.member_added",
    entityType: "TenantMember",
    entityId: member._id.toString(),
    message: "Se agregó un miembro al equipo",
    metadata: {
      email,
      role,
    },
  });

  return NextResponse.json(member, { status: 201 });
}

export async function PATCH(request: Request) {
  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { tenant, session } = context;

  const permission = await requireTenantPermission(
    tenant._id.toString(),
    "canManageTeam"
  );

  if (!permission.allowed) {
    return NextResponse.json(
      { message: permission.message },
      { status: permission.status }
    );
  }

  const body = await request.json();

  const { memberId, role, isActive } = body;

  if (!memberId) {
    return NextResponse.json({ message: "Falta memberId" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};

  if (role) {
    if (!ROLE_PERMISSIONS[role as TenantRole]) {
      return NextResponse.json({ message: "Rol inválido" }, { status: 400 });
    }

    updateData.role = role;
    updateData.permissions = ROLE_PERMISSIONS[role as TenantRole];
  }

  if (typeof isActive === "boolean") {
    updateData.isActive = isActive;
  }

  const member = await TenantMember.findOneAndUpdate(
    {
      _id: memberId,
      tenant: tenant._id,
    },
    updateData,
    { new: true }
  );

  if (!member) {
    return NextResponse.json(
      { message: "Miembro no encontrado" },
      { status: 404 }
    );
  }

  await createAuditLog({
    tenant: tenant._id.toString(),
    actor: session.user.id,
    actorRole: "tenant_admin",
    action: "team.member_updated",
    entityType: "TenantMember",
    entityId: member._id.toString(),
    message: "Se actualizó un miembro del equipo",
    metadata: {
      role,
      isActive,
    },
  });

  return NextResponse.json(member);
}