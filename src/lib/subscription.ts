import { PLAN_LIMITS } from "./plans";

export function getMonthlyAppointmentLimit(
  plan: string
) {
  return (
    PLAN_LIMITS[
      plan as keyof typeof PLAN_LIMITS
    ]?.monthlyAppointments ?? 20
  );
}