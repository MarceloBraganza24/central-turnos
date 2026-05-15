import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Professional } from "@/models/Professional";
import { Category } from "@/models/Category";
import { createSlug } from "@/lib/slug";
import QRCode from "qrcode";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const professional = await Professional.findOne({ user: session.user.id });

  if (!professional?.slug) {
    return NextResponse.json(
      { message: "Primero completá tu perfil profesional" },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const publicUrl = `${appUrl}/p/${professional.slug}`;

  const qr = await QRCode.toDataURL(publicUrl);

  return NextResponse.json({
    publicUrl,
    qr,
  });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const body = await request.json();

  const {
    displayName,
    category,
    bio,
    phone,
    address,
    city,
    province,
    price,
    appointmentDurationMinutes,
  } = body;

  if (!displayName) {
    return NextResponse.json(
      { message: "El nombre profesional es obligatorio" },
      { status: 400 }
    );
  }

  if (category) {
    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return NextResponse.json(
        { message: "Categoría inválida" },
        { status: 400 }
      );
    }
  }

  const slug = createSlug(displayName);

  const professional = await Professional.findOneAndUpdate(
    { user: session.user.id },
    {
      displayName,
      slug,
      category: category || null,
      bio,
      phone,
      address,
      city,
      province,
      price: Number(price) || 0,
      appointmentDurationMinutes: Number(appointmentDurationMinutes) || 30,
    },
    {
      new: true,
      upsert: true,
    }
  );

  return NextResponse.json(professional);
}