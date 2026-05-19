import { Schema, models, model } from "mongoose";

const LocationSchema = new Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    province: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    country: {
      type: String,
      default: "Argentina",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

LocationSchema.index(
  { city: 1, province: 1, country: 1 },
  { unique: true }
);

export const Location =
  models.Location || model("Location", LocationSchema);