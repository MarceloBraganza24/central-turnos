import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Location } from "@/models/Location";
import { createSlug } from "@/lib/slug";

export const runtime = "nodejs";

export async function GET() {
  await connectDB();

  const locations = await Location.find()
    .sort({ province: 1, city: 1 })
    .lean();

  return NextResponse.json(locations);
}

export async function POST(request: Request) {
  await connectDB();

  const { city, province, country } = await request.json();

  if (!city || !province) {
    return NextResponse.json(
      { message: "Ciudad y provincia son obligatorias" },
      { status: 400 }
    );
  }

  const location = await Location.findOneAndUpdate(
    {
      city,
      province,
      country: country || "Argentina",
    },
    {
      city,
      province,
      country: country || "Argentina",
      isActive: true,
      citySlug: createSlug(city),
      provinceSlug: createSlug(province),
    },
    { upsert: true, new: true }
  );

  return NextResponse.json(location, { status: 201 });
}

export async function PATCH(request: Request) {
  await connectDB();

  const { locationId, isActive } = await request.json();

  const location = await Location.findByIdAndUpdate(
    locationId,
    { isActive },
    { new: true }
  );

  return NextResponse.json(location);
}