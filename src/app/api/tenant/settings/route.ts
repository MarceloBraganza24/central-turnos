import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Professional } from "@/models/Professional";
import { Tenant } from "@/models/Tenant";
import { createSlug } from "@/lib/slug";
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
    return NextResponse.json(
      { message: "Perfil profesional no encontrado" },
      { status: 404 }
    );
  }

  const tenant = await Tenant.findOne({
    professional: professional._id,
  });

  if (!tenant) {
    return NextResponse.json({
      name: professional.displayName || "",
      slug: professional.slug || "",
      subdomain: professional.slug || "",
      customDomain: "",
      logoUrl: "",
      primaryColor: "#8b5cf6",
      accentColor: "#7c3aed",
      welcomeMessage: "",
      cancellationPolicy: "",
      requiresDeposit: false,
      defaultDepositAmount: 0,
      city: professional.city || "",
      province: professional.province || "",
      country: "Argentina",
      neighborhood: professional.neighborhood || "",
      offersOnline: Boolean(professional.offersOnline),
      languages: Array.isArray(professional.languages)
        ? professional.languages
        : ["Español"],
      insuranceProviders: Array.isArray(professional.insuranceProviders)
        ? professional.insuranceProviders
        : [],
      exists: false,
    });
  }

  return NextResponse.json({
    _id: tenant._id.toString(),
    name: tenant.name || "",
    slug: tenant.slug || "",
    subdomain: tenant.subdomain || "",
    customDomain: tenant.customDomain || "",
    logoUrl: tenant.logoUrl || "",
    primaryColor: tenant.primaryColor || "#8b5cf6",
    accentColor: tenant.accentColor || "#7c3aed",
    welcomeMessage: tenant.welcomeMessage || "",
    cancellationPolicy: tenant.cancellationPolicy || "",
    requiresDeposit: Boolean(tenant.requiresDeposit),
    defaultDepositAmount: tenant.defaultDepositAmount || 0,
    city: tenant.city || "",
    province: tenant.province || "",
    country: tenant.country || "Argentina",
    neighborhood: tenant.neighborhood || "",
    offersOnline: Boolean(tenant.offersOnline),
    languages: Array.isArray(tenant.languages)
      ? tenant.languages
      : ["Español"],
    insuranceProviders: Array.isArray(tenant.insuranceProviders)
      ? tenant.insuranceProviders
      : [],
    exists: true,
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
      {
        message:
          "Nombre, slug, ciudad y provincia son obligatorios",
      },
      { status: 400 }
    );
  }

  const cleanSlug = createSlug(slug);
  const cleanSubdomain = subdomain ? createSlug(subdomain) : cleanSlug;

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

  const normalizedLanguages = Array.isArray(languages)
    ? languages
    : ["Español"];

  const normalizedInsuranceProviders = Array.isArray(insuranceProviders)
    ? insuranceProviders
    : [];

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
      customDomain: customDomain?.toLowerCase?.() || "",

      logoUrl: logoUrl || "",
      primaryColor: primaryColor || "#8b5cf6",
      accentColor: accentColor || "#7c3aed",
      welcomeMessage: welcomeMessage || "",
      cancellationPolicy: cancellationPolicy || "",

      requiresDeposit: Boolean(requiresDeposit),
      defaultDepositAmount: Number(defaultDepositAmount) || 0,

      city,
      province,
      country: country || "Argentina",
      neighborhood: neighborhood || "",
      offersOnline: Boolean(offersOnline),
      languages: normalizedLanguages,
      insuranceProviders: normalizedInsuranceProviders,

      isActive: true,
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  professional.slug = cleanSlug;
  professional.city = city;
  professional.province = province;
  professional.neighborhood = neighborhood || "";
  professional.offersOnline = Boolean(offersOnline);
  professional.languages = normalizedLanguages;
  professional.insuranceProviders = normalizedInsuranceProviders;

  await professional.save();

  await deleteCacheByPattern("public:*");

  return NextResponse.json({
    _id: tenant._id.toString(),
    name: tenant.name || "",
    slug: tenant.slug || "",
    subdomain: tenant.subdomain || "",
    customDomain: tenant.customDomain || "",
    logoUrl: tenant.logoUrl || "",
    primaryColor: tenant.primaryColor || "#8b5cf6",
    accentColor: tenant.accentColor || "#7c3aed",
    welcomeMessage: tenant.welcomeMessage || "",
    cancellationPolicy: tenant.cancellationPolicy || "",
    requiresDeposit: Boolean(tenant.requiresDeposit),
    defaultDepositAmount: tenant.defaultDepositAmount || 0,
    city: tenant.city || "",
    province: tenant.province || "",
    country: tenant.country || "Argentina",
    neighborhood: tenant.neighborhood || "",
    offersOnline: Boolean(tenant.offersOnline),
    languages: Array.isArray(tenant.languages)
      ? tenant.languages
      : ["Español"],
    insuranceProviders: Array.isArray(tenant.insuranceProviders)
      ? tenant.insuranceProviders
      : [],
    exists: true,
  });
}