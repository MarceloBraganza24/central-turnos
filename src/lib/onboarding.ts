export type CompletedSteps = {
  profileCompleted: boolean;
  categorySelected: boolean;
  tenantConfigured: boolean;
  availabilityConfigured: boolean;
  firstAppointmentReceived: boolean;
};

export function calculateOnboardingProgress(steps: CompletedSteps) {
  const values = Object.values(steps);

  if (values.length === 0) {
    return 0;
  }

  const completed = values.filter(Boolean).length;

  return Math.round((completed / values.length) * 100);
}