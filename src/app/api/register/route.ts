import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Professional } from "@/models/Professional";
import { Tenant } from "@/models/Tenant";
import { createSlug } from "@/lib/slug";
import { TenantMember } from "@/models/TenantMember";
import { ROLE_PERMISSIONS } from "@/lib/role-permissions";
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

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
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
      email,
      password: hashedPassword,
      role: "professional",
    });

    const professional = await Professional.create({
      user: user._id,
      displayName: fullName,
      phone,
      slug: createSlug(fullName),
    });

    const tenant = await Tenant.create({
      professional: professional._id,
      owner: user._id,
      name: fullName,
      slug: createSlug(fullName),
      subdomain: createSlug(fullName),
    });

    await TenantMember.create({
      tenant: tenant._id,
      user: user._id,
      role: "owner",
      permissions: ROLE_PERMISSIONS.owner,
    });

    await sendProfessionalWelcomeWhatsApp({
      to: phone,
      fullName,
      tenantSlug: tenant.slug,
    });

    return NextResponse.json(
      { message: "Usuario creado correctamente" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}