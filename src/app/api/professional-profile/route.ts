import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Professional } from "@/models/Professional";
import { Category } from "@/models/Category";
import { createSlug } from "@/lib/slug";
import QRCode from "qrcode";
import { deleteCacheByPattern } from "@/lib/cache";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "No autorizado" },
      { status: 401 }
    );
  }

  await connectDB();

  const professional = await Professional.findOne({
    user: session.user.id,
  });

  if (!professional) {
    return NextResponse.json({
      displayName: "",
      category: "",
      bio: "",
      phone: "",
      address: "",
      city: "",
      province: "",
      price: 0,
      appointmentDurationMinutes: 30,
      appointmentBufferMinutes: 0,
      publicUrl: "",
      qr: "",
    });
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const publicUrl = professional.slug
    ? `${appUrl}/p/${professional.slug}`
    : "";

  const qr = professional.slug
    ? await QRCode.toDataURL(publicUrl)
    : "";

  return NextResponse.json({
    _id: professional._id.toString(),
    displayName: professional.displayName || "",
    slug: professional.slug || "",
    category: professional.category?.toString?.() || "",
    bio: professional.bio || "",
    phone: professional.phone || "",
    address: professional.address || "",
    city: professional.city || "",
    province: professional.province || "",
    price: professional.price || 0,
    appointmentDurationMinutes:
      professional.appointmentDurationMinutes || 30,
    appointmentBufferMinutes:
      professional.appointmentBufferMinutes || 0,
    publicUrl,
    qr,
  });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "No autorizado" },
      { status: 401 }
    );
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
    appointmentBufferMinutes,
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
    {
      user: session.user.id,
    },
    {
      user: session.user.id,
      displayName,
      slug,
      category: category || null,
      bio: bio || "",
      phone: phone || "",
      address: address || "",
      city: city || "",
      province: province || "",
      price: Number(price) || 0,
      appointmentDurationMinutes:
        Number(appointmentDurationMinutes) || 30,
      appointmentBufferMinutes:
        Number(appointmentBufferMinutes) || 0,
      isActive: true,
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  await deleteCacheByPattern("public:*");

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const publicUrl = professional.slug
    ? `${appUrl}/p/${professional.slug}`
    : "";

  const qr = professional.slug
    ? await QRCode.toDataURL(publicUrl)
    : "";

  return NextResponse.json({
    _id: professional._id.toString(),
    displayName: professional.displayName || "",
    slug: professional.slug || "",
    category: professional.category?.toString?.() || "",
    bio: professional.bio || "",
    phone: professional.phone || "",
    address: professional.address || "",
    city: professional.city || "",
    province: professional.province || "",
    price: professional.price || 0,
    appointmentDurationMinutes:
      professional.appointmentDurationMinutes || 30,
    appointmentBufferMinutes:
      professional.appointmentBufferMinutes || 0,
    publicUrl,
    qr,
  });
}