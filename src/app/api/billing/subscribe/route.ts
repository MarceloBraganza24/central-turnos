import { NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/get-current-tenant";
import { SAAS_PLANS, SaasPlanName } from "@/lib/saas-plans";
import { requireTenantPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(request: Request) {
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

  const { plan } = await request.json();

  if (!["pro", "premium"].includes(plan)) {
    return NextResponse.json(
      { message: "Plan inválido para suscripción" },
      { status: 400 }
    );
  }

  const selectedPlan = SAAS_PLANS[plan as SaasPlanName];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const response = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason: selectedPlan.mercadoPagoReason,
      external_reference: tenant._id.toString(),
      payer_email: session.user.email,
      back_url: `${appUrl}/dashboard/billing?status=subscription_return`,
      notification_url: `${appUrl}/api/webhooks/mercadopago/subscriptions`,
      status: "pending",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: selectedPlan.price,
        currency_id: "ARS",
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    await createAuditLog({
      tenant: tenant._id.toString(),
      actor: session.user.id,
      actorRole: "tenant_admin",
      action: "billing.subscription_create_failed",
      entityType: "Tenant",
      entityId: tenant._id.toString(),
      message: "Falló la creación de suscripción en Mercado Pago",
      metadata: data,
      severity: "error",
    });

    return NextResponse.json(
      { message: "No se pudo crear la suscripción", error: data },
      { status: 500 }
    );
  }

  tenant.plan = plan;
  tenant.subscriptionStatus = "pending";
  tenant.subscriptionId = data.id;
  tenant.subscriptionInitPoint = data.init_point;
  tenant.blockedByBilling = false;

  await tenant.save();

  await createAuditLog({
    tenant: tenant._id.toString(),
    actor: session.user.id,
    actorRole: "tenant_admin",
    action: "billing.subscription_created",
    entityType: "Tenant",
    entityId: tenant._id.toString(),
    message: `Se creó suscripción para plan ${plan}`,
    metadata: {
      plan,
      subscriptionId: data.id,
    },
  });

  return NextResponse.json({
    initPoint: data.init_point,
    subscriptionId: data.id,
  });
}