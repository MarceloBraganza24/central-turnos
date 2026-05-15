import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Service } from "@/models/Service";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Props) {
  const { id } = await params;

  await connectDB();

  const services = await Service.find({
    professional: id,
    isActive: true,
  })
    .sort({ price: 1 })
    .lean();

  return NextResponse.json(services);
}