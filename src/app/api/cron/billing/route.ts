import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { createAuditLog } from "@/lib/audit";
import { acquireLock, releaseLock } from "@/lib/locks";

export const runtime = "nodejs";

const lockKey = "cron:billing";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const locked = await acquireLock(lockKey, 300);

    if (!locked) {
      return NextResponse.json({
        message: "Cron billing ya está en ejecución",
      });
    }

    await connectDB();

    const tenants = await Tenant.find({
      plan: { $in: ["pro", "premium"] },
      subscriptionStatus: { $in: ["payment_failed", "cancelled", "paused"] },
      blockedByBilling: false,
    });

    for (const tenant of tenants) {
      tenant.blockedByBilling = true;
      await tenant.save();

      await createAuditLog({
        tenant: tenant._id.toString(),
        actorRole: "system",
        action: "billing.tenant_blocked",
        entityType: "Tenant",
        entityId: tenant._id.toString(),
        message: "Tenant bloqueado por estado de facturación",
        metadata: {
          subscriptionStatus: tenant.subscriptionStatus,
        },
        severity: "warning",
      });
    }

    return NextResponse.json({
      message: "Billing cron ejecutado",
      blocked: tenants.length,
    });
  } finally {
    await releaseLock(lockKey);
  }
}