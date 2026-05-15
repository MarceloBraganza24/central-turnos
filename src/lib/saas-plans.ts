export const SAAS_PLANS = {
  free: {
    name: "Free",
    price: 0,
    mercadoPagoReason: "Central Turnos - Plan Free",
    monthlyAppointments: 20,
    canUsePayments: false,
    canUseReminders: false,
    highlighted: false,
  },

  pro: {
    name: "Pro",
    price: 9999,
    mercadoPagoReason: "Central Turnos - Plan Pro",
    monthlyAppointments: 300,
    canUsePayments: true,
    canUseReminders: true,
    highlighted: false,
  },

  premium: {
    name: "Premium",
    price: 19999,
    mercadoPagoReason: "Central Turnos - Plan Premium",
    monthlyAppointments: 1000,
    canUsePayments: true,
    canUseReminders: true,
    highlighted: true,
  },
};

export type SaasPlanName = keyof typeof SAAS_PLANS;