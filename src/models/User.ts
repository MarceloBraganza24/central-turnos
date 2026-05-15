import { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["super_admin", "professional"],
      default: "professional",
    },

    plan: {
      type: String,
      enum: ["free", "pro", "premium"],
      default: "free",
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

export const User = models.User || model("User", UserSchema);