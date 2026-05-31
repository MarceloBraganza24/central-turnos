import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Professional } from "@/models/Professional";
import { createSlug } from "@/lib/slug";
import { sendProfessionalWelcomeWhatsApp } from "@/lib/whatsapp-onboarding";
import { authRateLimit, getIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const ip = getIp(request);

    const rateLimit = await authRateLimit.limit(`register:${ip}`);

    if (!rateLimit.success) {
      return NextResponse.json(
        { message: "Demasiados intentos. Probá nuevamente en unos minutos." },
        { status: 429 }
      );
    }

    await connectDB();

    const body = await request.json();

    const { fullName, email, password, phone } = body;

    if (!fullName || !email || !password || !phone) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Ese email ya está registrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "professional",
      isActive: true,
      plan: "free",
    });

    const slug = createSlug(fullName);

    await Professional.create({
      user: user._id,
      displayName: fullName,
      phone,
      slug,
      isActive: false,
    });

    await sendProfessionalWelcomeWhatsApp({
      to: phone,
      fullName,
      tenantSlug: slug,
    });

    return NextResponse.json(
      {
        message:
          "Usuario creado correctamente. Ahora completá la configuración de tu espacio.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER_ERROR", error);

    return NextResponse.json(
      { message: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}