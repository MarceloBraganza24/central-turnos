import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Professional } from "@/models/Professional";
import { Tenant } from "@/models/Tenant";
import { TenantMember } from "@/models/TenantMember";
import { ROLE_PERMISSIONS } from "@/lib/role-permissions";
import { createSlug } from "@/lib/slug";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
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

    const fullName = process.env.SEED_ADMIN_NAME;
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        {
          message:
            "Faltan SEED_ADMIN_NAME, SEED_ADMIN_EMAIL o SEED_ADMIN_PASSWORD",
        },
        { status: 500 }
      );
    }

    await connectDB();

    const existingAdmin = await User.findOne({
      role: "super_admin",
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          message: "Ya existe un super admin. Seeder cancelado.",
        },
        { status: 409 }
      );
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      existingUser.role = "super_admin";
      existingUser.plan = "premium";
      existingUser.isActive = true;
      await existingUser.save();

      const professional = await Professional.findOneAndUpdate(
        { user: user._id },
        {
          displayName: fullName,
          slug: createSlug(fullName),
          isActive: false,
        },
        { upsert: true, new: true }
      );

      const tenant = await Tenant.findOneAndUpdate(
        { professional: professional._id },
        {
          professional: professional._id,
          owner: user._id,
          name: fullName,
          slug: createSlug(fullName),
          subdomain: createSlug(fullName),
        },
        { upsert: true, new: true }
      );

      await TenantMember.findOneAndUpdate(
        {
          tenant: tenant._id,
          user: user._id,
        },
        {
          tenant: tenant._id,
          user: user._id,
          role: "owner",
          permissions: ROLE_PERMISSIONS.owner,
          isActive: true,
        },
        { upsert: true }
      );

      return NextResponse.json({
        message: "Usuario existente actualizado como super admin",
        email: existingUser.email,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "super_admin",
      plan: "premium",
      isActive: true,
    });

    await Professional.create({
      user: user._id,
      displayName: fullName,
      isActive: false,
    });

    return NextResponse.json(
      {
        message: "Super admin creado correctamente",
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando super admin:", error);

    return NextResponse.json(
      { message: "Error creando super admin" },
      { status: 500 }
    );
  }
}