import { Schema, models, model } from "mongoose";

const AppointmentSchema = new Schema(
  {
    professional: {
      type: Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
    },

    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    appointmentDate: {
      type: String,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed"],
      default: "unpaid",
    },

    paymentPreferenceId: {
      type: String,
      default: "",
    },

    paymentId: {
      type: String,
      default: "",
    },

    depositAmount: {
      type: Number,
      default: 0,
    },

    reminder24hSent: {
      type: Boolean,
      default: false,
    },

    reminder2hSent: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: "",
    },

    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    whatsappClientStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },

    whatsappProfessionalStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },

    paymentProcessedAt: {
      type: Date,
      default: null,
    },

    webhookEvents: {
      type: [String],
      default: [],
    },
    reminder24hProcessing: {
      type: Boolean,
      default: false,
    },

    reminder2hProcessing: {
      type: Boolean,
      default: false,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      default: null,
    },

    serviceName: {
      type: String,
      default: "",
    },

    servicePrice: {
      type: Number,
      default: 0,
    },

    serviceDurationMinutes: {
      type: Number,
      default: 0,
    },
    publicToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Appointment =
  models.Appointment || model("Appointment", AppointmentSchema);