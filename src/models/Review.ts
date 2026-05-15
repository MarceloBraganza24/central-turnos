import { Schema, models, model } from "mongoose";

const ReviewSchema = new Schema(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    professional: {
      type: Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
    },

    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },

    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      default: "",
      maxlength: 500,
    },

    isPublic: {
      type: Boolean,
      default: true,
    },
    professionalReply: {
      type: String,
      default: "",
      maxlength: 500,
    },

    repliedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ tenant: 1, professional: 1 });
ReviewSchema.index({ professional: 1, rating: -1 });

export const Review = models.Review || model("Review", ReviewSchema);