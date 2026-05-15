import { Tenant } from "@/models/Tenant";

export function isTenantBillingBlocked(tenant: typeof Tenant.prototype) {
  if (!tenant) return true;

  if (tenant.plan === "free") return false;

  if (tenant.blockedByBilling) return true;

  if (["cancelled", "payment_failed", "paused"].includes(tenant.subscriptionStatus)) {
    return true;
  }

  return false;
}