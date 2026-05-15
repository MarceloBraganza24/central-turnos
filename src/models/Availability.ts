import { Schema, models, model } from "mongoose";

const AvailabilitySchema = new Schema(
  {
    professional: {
      type: Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
    },

    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Availability =
  models.Availability || model("Availability", AvailabilitySchema);