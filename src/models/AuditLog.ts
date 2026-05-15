import { Schema, models, model } from "mongoose";

const AuditLogSchema = new Schema(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
    },

    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    actorRole: {
      type: String,
      default: "system",
    },

    action: {
      type: String,
      required: true,
    },

    entityType: {
      type: String,
      required: true,
    },

    entityId: {
      type: String,
      default: "",
    },

    message: {
      type: String,
      default: "",
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      default: "",
    },

    userAgent: {
      type: String,
      default: "",
    },

    severity: {
      type: String,
      enum: ["info", "warning", "error"],
      default: "info",
    },
  },
  {
    timestamps: true,
  }
);

export const AuditLog = models.AuditLog || model("AuditLog", AuditLogSchema);