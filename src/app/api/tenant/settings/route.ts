import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Professional } from "@/models/Professional";
import { Tenant } from "@/models/Tenant";
import { createSlug } from "@/lib/slug";
import { deleteCacheByPattern } from "@/lib/cache";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const professional = await Professional.findOne({
    user: session.user.id,
  });

  if (!professional) {
    return NextResponse.json(
      { message: "Perfil profesional no encontrado" },
      { status: 404 }
    );
  }

  let tenant = await Tenant.findOne({
    professional: professional._id,
  });

  if (!tenant) {
    tenant = await Tenant.create({
      professional: professional._id,
      owner: session.user.id,
      name: professional.displayName,
      slug: professional.slug || createSlug(professional.displayName),
      subdomain: professional.slug || createSlug(professional.displayName),
    });
  }

  await deleteCacheByPattern("public:*");

  return NextResponse.json(tenant);
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const professional = await Professional.findOne({
    user: session.user.id,
  });

  if (!professional) {
    return NextResponse.json(
      { message: "Perfil profesional no encontrado" },
      { status: 404 }
    );
  }

  const body = await request.json();

  const {
    name,
    slug,
    subdomain,
    customDomain,
    logoUrl,
    primaryColor,
    accentColor,
    welcomeMessage,
    cancellationPolicy,
    requiresDeposit,
    defaultDepositAmount,
    city,
    province,
    country,
    neighborhood,
    offersOnline,
    languages,
    insuranceProviders,
  } = body;

  if (!name || !slug || !city || !province) {
    return NextResponse.json(
      { message: "Nombre y slug son obligatorios" },
      { status: 400 }
    );
  }

  const cleanSlug = createSlug(slug);
  const cleanSubdomain = subdomain ? createSlug(subdomain) : "";

  const existingSlug = await Tenant.findOne({
    slug: cleanSlug,
    professional: { $ne: professional._id },
  });

  if (existingSlug) {
    return NextResponse.json(
      { message: "Ese slug ya está en uso" },
      { status: 409 }
    );
  }

  if (cleanSubdomain) {
    const existingSubdomain = await Tenant.findOne({
      subdomain: cleanSubdomain,
      professional: { $ne: professional._id },
    });

    if (existingSubdomain) {
      return NextResponse.json(
        { message: "Ese subdominio ya está en uso" },
        { status: 409 }
      );
    }
  }

  const tenant = await Tenant.findOneAndUpdate(
    {
      professional: professional._id,
    },
    {
      professional: professional._id,
      owner: session.user.id,
      name,
      slug: cleanSlug,
      subdomain: cleanSubdomain,
      customDomain: customDomain?.toLowerCase() || "",
      logoUrl,
      primaryColor,
      accentColor,
      welcomeMessage,
      cancellationPolicy,
      requiresDeposit: Boolean(requiresDeposit),
      defaultDepositAmount: Number(defaultDepositAmount) || 0,
      city,
      province,
      country: country || "Argentina",
      neighborhood,
      offersOnline: Boolean(offersOnline),
      languages: Array.isArray(languages) ? languages : ["Español"],
      insuranceProviders: Array.isArray(insuranceProviders)
        ? insuranceProviders
        : [],
    },
    {
      new: true,
      upsert: true,
    }
  );

  professional.slug = cleanSlug;
  professional.city = city;
  professional.province = province;
  professional.neighborhood = neighborhood;
  professional.offersOnline = Boolean(offersOnline);
  professional.languages = Array.isArray(languages) ? languages : ["Español"];
  professional.insuranceProviders = Array.isArray(insuranceProviders)
    ? insuranceProviders
    : [];
  await professional.save();

  return NextResponse.json(tenant);
}