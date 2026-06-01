export type PlanName = "free" | "pro" | "premium";

export type PlanLimits = {
  monthlyAppointments: number;
  canUsePayments: boolean;
};

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  free: {
    monthlyAppointments: 20,
    canUsePayments: false,
  },

  pro: {
    monthlyAppointments: -1,
    canUsePayments: true,
  },

  premium: {
    monthlyAppointments: -1,
    canUsePayments: true,
  },
};