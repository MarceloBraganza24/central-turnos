import { Schema, models, model } from "mongoose";

const TenantMemberSchema = new Schema(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: [
        "owner",
        "manager",
        "professional",
        "receptionist",
        "staff",
        "collaborator",
      ],
      default: "staff",
    },

    permissions: {
      canManageSettings: {
        type: Boolean,
        default: false,
      },
      canManageAvailability: {
        type: Boolean,
        default: false,
      },
      canManageAppointments: {
        type: Boolean,
        default: false,
      },
      canManageClients: {
        type: Boolean,
        default: false,
      },
      canManageTeam: {
        type: Boolean,
        default: false,
      },
      canViewReports: {
        type: Boolean,
        default: false,
      },
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

TenantMemberSchema.index({ tenant: 1, user: 1 }, { unique: true });

export const TenantMember =
  models.TenantMember || model("TenantMember", TenantMemberSchema);