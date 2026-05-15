import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";

export const runtime = "nodejs";

export async function GET() {
  await connectDB();

  const locations = await Tenant.aggregate([
    {
      $match: {
        isActive: true,
        city: { $exists: true, $ne: "" },
        province: { $exists: true, $ne: "" },
      },
    },
    {
      $group: {
        _id: {
          city: "$city",
          province: "$province",
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.province": 1,
        "_id.city": 1,
      },
    },
  ]);

  return NextResponse.json(
    locations.map((item) => ({
      city: item._id.city,
      province: item._id.province,
      count: item.count,
    }))
  );
}