import { Schema, models, model } from "mongoose";

const ScheduleExceptionSchema = new Schema(
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

    date: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "vacation",
        "holiday",
        "manual_block",
        "special_hours",
      ],
      required: true,
    },

    isWorkingDay: {
      type: Boolean,
      default: false,
    },

    startTime: {
      type: String,
      default: "",
    },

    endTime: {
      type: String,
      default: "",
    },

    reason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

ScheduleExceptionSchema.index({
  tenant: 1,
  professional: 1,
  date: 1,
});

export const ScheduleException =
  models.ScheduleException ||
  model("ScheduleException", ScheduleExceptionSchema);