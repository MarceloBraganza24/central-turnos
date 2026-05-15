import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { createAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

async function getSubscription(subscriptionId: string) {
  const response = await fetch(
    `https://api.mercadopago.com/preapproval/${subscriptionId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const subscriptionId =
      body?.data?.id ||
      body?.id ||
      new URL(request.url).searchParams.get("data.id");

    if (!subscriptionId) {
      return NextResponse.json({ received: true });
    }

    const subscription = await getSubscription(subscriptionId);

    const tenantId = subscription.external_reference;

    if (!tenantId) {
      return NextResponse.json({ received: true });
    }

    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      return NextResponse.json({ received: true });
    }

    tenant.subscriptionId = subscription.id;
    tenant.subscriptionStatus = subscription.status;

    if (subscription.status === "authorized") {
      tenant.blockedByBilling = false;
      tenant.subscriptionStartedAt = tenant.subscriptionStartedAt || new Date();
      tenant.subscriptionLastPaymentAt = new Date();
    }

    if (
      ["paused", "cancelled", "payment_failed"].includes(
        String(subscription.status)
      )
    ) {
      tenant.subscriptionPaymentFailedAt = new Date();
    }

    await tenant.save();

    await createAuditLog({
      tenant: tenant._id.toString(),
      actorRole: "system",
      action: "billing.subscription_webhook_received",
      entityType: "Tenant",
      entityId: tenant._id.toString(),
      message: `Webhook de suscripción recibido con estado ${subscription.status}`,
      metadata: {
        subscriptionId,
        status: subscription.status,
      },
      severity:
        subscription.status === "authorized"
          ? "info"
          : subscription.status === "payment_failed"
            ? "error"
            : "warning",
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    await createAuditLog({
      actorRole: "system",
      action: "billing.subscription_webhook_failed",
      entityType: "Subscription",
      message: "Falló webhook de suscripción",
      metadata: {
        error: error instanceof Error ? error.message : error,
      },
      severity: "error",
    });

    return NextResponse.json({ received: true });
  }
}