import { NextResponse } from "next/server";
import { Location } from "@/models/Location";
import { connectDB } from "@/lib/mongodb";
import { createSlug } from "@/lib/slug";

export const runtime = "nodejs";

const DEFAULT_LOCATIONS = [
  {
    city: "Coronel Suárez",
    province: "Buenos Aires",
    country: "Argentina",
  },
  {
    city: "Pigüé",
    province: "Buenos Aires",
    country: "Argentina",
  },
  {
    city: "Huanguelén",
    province: "Buenos Aires",
    country: "Argentina",
  },
  {
    city: "Carhué",
    province: "Buenos Aires",
    country: "Argentina",
  },
  {
    city: "Bahía Blanca",
    province: "Buenos Aires",
    country: "Argentina",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!process.env.SEED_ADMIN_SECRET) {
    return NextResponse.json(
      { message: "Falta configurar SEED_ADMIN_SECRET" },
      { status: 500 }
    );
  }

  if (secret !== process.env.SEED_ADMIN_SECRET) {
    return NextResponse.json(
      { message: "No autorizado" },
      { status: 401 }
    );
  }

  await connectDB();

  for (const location of DEFAULT_LOCATIONS) {
    await Location.findOneAndUpdate(
      {
        citySlug: createSlug(location.city),
        provinceSlug: createSlug(location.province),
        country: location.country,
      },
      {
        ...location,
        citySlug: createSlug(location.city),
        provinceSlug: createSlug(location.province),
        isActive: true,
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );
  }

  return NextResponse.json({
    message: "Localidades base creadas correctamente",
    count: DEFAULT_LOCATIONS.length,
  });
}