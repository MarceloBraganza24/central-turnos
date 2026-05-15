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

    const normalizedEmail = email.toLowerCase();
    const slug = createSlug(fullName);

    const existingAdmin = await User.findOne({
      role: "super_admin",
      email: { $ne: normalizedEmail },
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          message: "Ya existe otro super admin. Seeder cancelado.",
        },
        { status: 409 }
      );
    }

    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (user) {
      user.fullName = fullName;
      user.role = "super_admin";
      user.plan = "premium";
      user.isActive = true;
      await user.save();
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await User.create({
        fullName,
        email: normalizedEmail,
        password: hashedPassword,
        role: "super_admin",
        plan: "premium",
        isActive: true,
      });
    }

    const userId = user._id.toString();

    const professional = await Professional.findOneAndUpdate(
      {
        user: userId,
      },
      {
        user: userId,
        displayName: fullName,
        slug,
        isActive: false,
      },
      {
        upsert: true,
        new: true,
      }
    );

    const tenant = await Tenant.findOneAndUpdate(
      {
        professional: professional._id,
      },
      {
        professional: professional._id,
        owner: userId,
        name: fullName,
        slug,
        subdomain: slug,
        isActive: true,
      },
      {
        upsert: true,
        new: true,
      }
    );

    await TenantMember.findOneAndUpdate(
      {
        tenant: tenant._id,
        user: userId,
      },
      {
        tenant: tenant._id,
        user: userId,
        role: "owner",
        permissions: ROLE_PERMISSIONS.owner,
        isActive: true,
      },
      {
        upsert: true,
      }
    );

    return NextResponse.json(
      {
        message: "Super admin creado/actualizado correctamente",
        email: user.email,
      },
      { status: user ? 200 : 201 }
    );
  } catch (error) {
    console.error("Error creando super admin:", error);

    return NextResponse.json(
      { message: "Error creando super admin" },
      { status: 500 }
    );
  }
}