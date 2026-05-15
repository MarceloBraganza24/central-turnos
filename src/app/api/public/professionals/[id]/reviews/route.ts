import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Review } from "@/models/Review";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Props) {
  const { id } = await params;

  await connectDB();

  const reviews = await Review.find({
    professional: id,
    isPublic: true,
  })
    .populate("client", "fullName")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return NextResponse.json(reviews);
}