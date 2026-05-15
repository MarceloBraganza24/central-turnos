import { Schema, models, model } from "mongoose";

const ServiceSchema = new Schema(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    professional: {
      type: Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    durationMinutes: {
      type: Number,
      required: true,
      default: 30,
    },

    price: {
      type: Number,
      default: 0,
    },

    requiresDeposit: {
      type: Boolean,
      default: false,
    },

    depositAmount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

ServiceSchema.index({ tenant: 1, professional: 1, isActive: 1 });

export const Service = models.Service || model("Service", ServiceSchema);