import { Schema, models, model } from "mongoose";

const ProfessionalSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    bio: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      default: 0,
    },

    appointmentDurationMinutes: {
      type: Number,
      default: 30,
    },
    appointmentBufferMinutes: {
      type: Number,
      default: 0,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    city: {
      type: String,
      default: "",
      index: true,
    },

    province: {
      type: String,
      default: "",
      index: true,
    },

    neighborhood: {
      type: String,
      default: "",
    },

    offersOnline: {
      type: Boolean,
      default: false,
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
    imageUrl: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Professional =
  models.Professional || model("Professional", ProfessionalSchema);