import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Tenant } from "@/models/Tenant";
import { TenantMember } from "@/models/TenantMember";

export type TenantPermission =
  | "canManageSettings"
  | "canManageAvailability"
  | "canManageAppointments"
  | "canManageClients"
  | "canManageTeam"
  | "canViewReports";

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) return null;

  await connectDB();

  const user = await User.findById(session.user.id);

  if (!user) return null;

  return {
    session,
    user,
  };
}

export async function isSuperAdmin() {
  const context = await getCurrentUser();

  if (!context) return false;

  return context.user.role === "super_admin";
}

export async function getTenantMembershipByTenantId(tenantId: string) {
  const context = await getCurrentUser();

  if (!context) return null;

  const { user } = context;

  if (user.role === "super_admin") {
    return {
      user,
      tenant: await Tenant.findById(tenantId),
      member: null,
      isSuperAdmin: true,
    };
  }

  const member = await TenantMember.findOne({
    tenant: tenantId,
    user: user._id,
    isActive: true,
  });

  if (!member) return null;

  return {
    user,
    tenant: await Tenant.findById(tenantId),
    member,
    isSuperAdmin: false,
  };
}

export async function requireTenantPermission(
  tenantId: string,
  permission: TenantPermission
) {
  const context = await getTenantMembershipByTenantId(tenantId);

  if (!context) {
    return {
      allowed: false,
      status: 401,
      message: "No autorizado",
    };
  }

  if (context.isSuperAdmin) {
    return {
      allowed: true,
      context,
    };
  }

  const hasPermission = Boolean(context.member?.permissions?.[permission]);

  if (!hasPermission) {
    return {
      allowed: false,
      status: 403,
      message: "No tenés permisos para realizar esta acción",
    };
  }

  return {
    allowed: true,
    context,
  };
}