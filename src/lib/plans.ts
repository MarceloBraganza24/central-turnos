export const PLAN_LIMITS = {
  free: {
    monthlyAppointments: 20,
    canUsePayments: false,
    canUseReminders: false,
    highlighted: false,
  },
  pro: {
    monthlyAppointments: 300,
    canUsePayments: true,
    canUseReminders: true,
    highlighted: false,
  },
  premium: {
    monthlyAppointments: 1000,
    canUsePayments: true,
    canUseReminders: true,
    highlighted: true,
  },
};

export type PlanName = keyof typeof PLAN_LIMITS;