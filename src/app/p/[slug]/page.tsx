import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Professional } from "@/models/Professional";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PublicShortProfessionalPage({ params }: Props) {
  const { slug } = await params;

  await connectDB();

  const professional = await Professional.findOne({
    slug,
    isActive: true,
  }).lean();

  if (!professional) {
    notFound();
  }

  redirect(`/profesionales/${professional._id.toString()}`);
}