type CompletedSteps = {
  profileCompleted: boolean;
  categorySelected: boolean;
  availabilityConfigured: boolean;
  publicProfileShared: boolean;
  firstAppointmentReceived: boolean;
  whatsappSent: {
    welcome: {
      type: Boolean,
      default: false,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    availabilityConfigured: {
      type: Boolean,
      default: false,
    },
    firstAppointmentReceived: {
      type: Boolean,
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