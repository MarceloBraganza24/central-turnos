import { Schema, models, model } from "mongoose";

const LocationSchema = new Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },

    citySlug: {
      type: String,
      required: true,
      index: true,
    },

    province: {
      type: String,
      required: true,
      trim: true,
    },

    provinceSlug: {
      type: String,
      required: true,
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
  {
    timestamps: true,
  }
);

LocationSchema.index(
  {
    citySlug: 1,
    provinceSlug: 1,
    country: 1,
  },
  {
    unique: true,
  }
);

export const Location =
  models.Location || model("Location", LocationSchema);