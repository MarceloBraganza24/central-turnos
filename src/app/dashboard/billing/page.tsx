"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type PlanName = "free" | "pro" | "premium";

type Plan = {
  name: string;
  price: number;
  monthlyAppointments: number;
  canUsePayments: boolean;
  canUseReminders: boolean;
  highlighted: boolean;
};

type BillingStatus = {
  plan: PlanName;
  subscriptionStatus: string;
  blockedByBilling: boolean;
  plans: Record<PlanName, Plan>;
};

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<PlanName | null>(null);

  const router = useRouter();

  const loadBilling = useCallback(async () => {
    try {
      const response = await fetch("/api/billing/status");
      const data = await response.json();

      setBilling(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBilling();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadBilling]);

  async function subscribe(plan: PlanName) {
    if (plan === "free") return;

    setLoadingPlan(plan);

    const response = await fetch("/api/billing/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan }),
    });

    const data = await response.json();

    setLoadingPlan(null);

    if (!response.ok) {
      toast.error(data.message || "No se pudo iniciar la suscripción");
      return;
    }

    router.push(data.initPoint);
  }

  if (!billing) {
    return <section className="text-[var(--foreground)]">Cargando facturación...</section>;
  }

  return (
    <section className="max-w-7xl text-[var(--foreground)]">
      <h1 className="text-3xl font-bold">Facturación</h1>

      <p className="mt-2 text-[var(--muted)]">
        Elegí el plan de Central Turnos que mejor se adapta a tu volumen de
        trabajo.
      </p>

      {billing.blockedByBilling && (
        <div className="mt-6 rounded-2xl border border-red-900 bg-red-950 p-5 text-red-300">
          Tu espacio está bloqueado por falta de pago. Regularizá tu plan para
          volver a recibir turnos.
        </div>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {Object.entries(billing.plans).map(([key, plan]) => {
          const planKey = key as PlanName;
          const current = billing.plan === planKey;

          return (
            <div
              key={key}
              className={`rounded-3xl border p-6 ${
                plan.highlighted
                  ? "border-brand bg-brand text-[var(--foreground)]"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              <p className="text-sm opacity-80">
                {current ? "Plan actual" : "Plan disponible"}
              </p>

              <h2 className="mt-3 text-3xl font-bold">{plan.name}</h2>

              <p className="mt-4 text-4xl font-bold">
                ${plan.price}
                <span className="text-sm font-normal opacity-80"> / mes</span>
              </p>

              <ul className="mt-6 space-y-3 text-sm">
                <li>✓ {plan.monthlyAppointments} turnos mensuales</li>
                <li>
                  {plan.canUsePayments
                    ? "✓ Pagos y señas"
                    : "✕ Sin pagos y señas"}
                </li>
                <li>
                  {plan.canUseReminders
                    ? "✓ Recordatorios automáticos"
                    : "✕ Sin recordatorios"}
                </li>
                <li>
                  {plan.highlighted
                    ? "✓ Perfil destacado"
                    : "Perfil estándar"}
                </li>
              </ul>

              {planKey === "free" ? (
                <button
                  disabled
                  className="mt-8 w-full rounded-xl border border-neutral-700 px-5 py-3 font-medium opacity-60"
                >
                  Plan gratuito
                </button>
              ) : (
                <button
                  disabled={current || loadingPlan === planKey}
                  onClick={() => subscribe(planKey)}
                  className={`mt-8 w-full rounded-xl px-5 py-3 font-medium ${
                    plan.highlighted
                      ? "bg-white text-black"
                      : "bg-brand text-[var(--foreground)]"
                  } disabled:opacity-60`}
                >
                  {current
                    ? "Plan actual"
                    : loadingPlan === planKey
                      ? "Redirigiendo..."
                      : `Pasar a ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-sm text-neutral-500">Estado de suscripción</p>
        <p className="mt-1 font-medium">
          {billing.subscriptionStatus || "none"}
        </p>
      </div>
    </section>
  );
}