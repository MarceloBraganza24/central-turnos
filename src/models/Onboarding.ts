import { Schema, models, model } from "mongoose";

const OnboardingSchema = new Schema(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      unique: true,
    },

    completedSteps: {
      profileCompleted: {
        type: Boolean,
        default: false,
      },

      categorySelected: {
        type: Boolean,
        default: false,
      },

      tenantConfigured: {
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

    dismissed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Onboarding =
  models.Onboarding ||
  model("Onboarding", OnboardingSchema);