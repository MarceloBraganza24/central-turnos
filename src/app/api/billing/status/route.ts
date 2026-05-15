import { NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/get-current-tenant";
import { SAAS_PLANS } from "@/lib/saas-plans";

export const runtime = "nodejs";

export async function GET() {
  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { tenant } = context;

  return NextResponse.json({
    plan: tenant.plan || "free",
    subscriptionStatus: tenant.subscriptionStatus || "none",
    subscriptionId: tenant.subscriptionId || "",
    blockedByBilling: tenant.blockedByBilling || false,
    plans: SAAS_PLANS,
  });
}