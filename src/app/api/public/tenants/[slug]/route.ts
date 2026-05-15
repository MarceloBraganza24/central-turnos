import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { Professional } from "@/models/Professional";
import { Availability } from "@/models/Availability";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: Props) {
  const { slug } = await params;

  await connectDB();

  const tenant = await Tenant.findOne({
    slug,
    isActive: true,
  })
    .populate("professional")
    .lean();

  if (!tenant) {
    return NextResponse.json(
      { message: "Espacio no encontrado" },
      { status: 404 }
    );
  }

  const professional = await Professional.findById(tenant.professional)
    .populate("category")
    .lean();

  if (!professional || !professional.isActive) {
    return NextResponse.json(
      { message: "Profesional no disponible" },
      { status: 404 }
    );
  }

  const availability = await Availability.find({
    professional: professional._id,
    isActive: true,
  })
    .sort({ dayOfWeek: 1, startTime: 1 })
    .lean();

  return NextResponse.json({
    tenant,
    professional,
    availability,
  });
}