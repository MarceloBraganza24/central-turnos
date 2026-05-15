type CompletedSteps = {
  profileCompleted: boolean;
  categorySelected: boolean;
  availabilityConfigured: boolean;
  publicProfileShared: boolean;
  firstAppointmentReceived: boolean;
  whatsappSent: {
    welcome: {
      type: boolean,
      default: false,
    },
    profileCompleted: {
      type: boolean,
      default: false,
    },
    availabilityConfigured: {
      type: boolean,
      default: false,
    },
    firstAppointmentReceived: {
      type: boolean,
      default: false,
    },
  },
};

export function calculateOnboardingProgress(
  steps: CompletedSteps
) {
  const values = Object.values(steps);

  const completed = values.filter(Boolean).length;

  return Math.round((completed / values.length) * 100);
}