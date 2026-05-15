import { NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/get-current-tenant";
import { requireTenantPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST() {
  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { tenant, session } = context;

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

  tenant.plan = "free";
  tenant.subscriptionStatus = "cancelled";
  tenant.blockedByBilling = false;

  await tenant.save();

  await createAuditLog({
    tenant: tenant._id.toString(),
    actor: session.user.id,
    actorRole: "tenant_admin",
    action: "billing.downgraded_to_free",
    entityType: "Tenant",
    entityId: tenant._id.toString(),
    message: "El tenant bajó al plan Free",
  });

  return NextResponse.json({
    message: "Plan cambiado a Free",
  });
}