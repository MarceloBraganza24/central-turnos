import { Schema, models, model } from "mongoose";

const TenantSchema = new Schema(
  {
    professional: {
      type: Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
      unique: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    subdomain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    customDomain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    logoUrl: {
      type: String,
      default: "",
    },

    primaryColor: {
      type: String,
      default: "#ffffff",
    },

    accentColor: {
      type: String,
      default: "#a3a3a3",
    },

    welcomeMessage: {
      type: String,
      default: "Reservá tu turno de forma simple y rápida.",
    },

    cancellationPolicy: {
      type: String,
      default: "Podés cancelar o reprogramar tu turno con anticipación.",
    },

    requiresDeposit: {
      type: Boolean,
      default: false,
    },

    defaultDepositAmount: {
      type: Number,
      default: 0,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "premium"],
      default: "free",
    },

    subscriptionStatus: {
      type: String,
      enum: ["none", "pending", "authorized", "paused", "cancelled", "payment_failed"],
      default: "none",
    },

    subscriptionId: {
      type: String,
      default: "",
    },

    subscriptionInitPoint: {
      type: String,
      default: "",
    },

    subscriptionStartedAt: {
      type: Date,
      default: null,
    },

    subscriptionEndsAt: {
      type: Date,
      default: null,
    },

    subscriptionLastPaymentAt: {
      type: Date,
      default: null,
    },

    subscriptionPaymentFailedAt: {
      type: Date,
      default: null,
    },

    blockedByBilling: {
      type: Boolean,
      default: false,
    },
    city: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    province: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    country: {
      type: String,
      default: "Argentina",
    },

    neighborhood: {
      type: String,
      default: "",
      index: true,
    },

    offersOnline: {
      type: Boolean,
      default: false,
      index: true,
    },

    languages: {
      type: [String],
      default: ["Español"],
    },

    insuranceProviders: {
      type: [String],
      default: [],
    },

    ratingAverage: {
      type: Number,
      default: 0,
    },

    ratingCount: {
      type: Number,
      default: 0,
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

export const Tenant = models.Tenant || model("Tenant", TenantSchema);