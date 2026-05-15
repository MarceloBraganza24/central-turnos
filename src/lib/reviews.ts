import { Types } from "mongoose";
import { Review } from "@/models/Review";
import { Professional } from "@/models/Professional";
import { Tenant } from "@/models/Tenant";

export async function recalculateProfessionalRating({
  tenantId,
  professionalId,
}: {
  tenantId: string;
  professionalId: string;
}) {
  const result = await Review.aggregate([
    {
      $match: {
        tenant: new Types.ObjectId(tenantId),
        professional: new Types.ObjectId(professionalId),
        isPublic: true,
      },
    },
    {
      $group: {
        _id: "$professional",
        ratingAverage: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  const ratingAverage = result[0]?.ratingAverage || 0;
  const ratingCount = result[0]?.ratingCount || 0;

  await Professional.findByIdAndUpdate(professionalId, {
    ratingAverage: Number(ratingAverage.toFixed(1)),
    ratingCount,
  });

  await Tenant.findByIdAndUpdate(tenantId, {
    ratingAverage: Number(ratingAverage.toFixed(1)),
    ratingCount,
  });

  return {
    ratingAverage: Number(ratingAverage.toFixed(1)),
    ratingCount,
  };
}