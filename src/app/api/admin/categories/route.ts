import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Category } from "@/models/Category";
import { deleteCacheByPattern } from "@/lib/cache";

export const runtime = "nodejs";

function createSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function checkSuperAdmin(userId: string) {
  const user = await User.findById(userId);
  return user?.role === "super_admin";
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const isSuperAdmin = await checkSuperAdmin(session.user.id);

  if (!isSuperAdmin) {
    return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
  }

  const categories = await Category.find().sort({ name: 1 }).lean();

  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const isSuperAdmin = await checkSuperAdmin(session.user.id);

  if (!isSuperAdmin) {
    return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
  }

  const body = await request.json();
  const { name, description } = body;

  if (!name) {
    return NextResponse.json(
      { message: "El nombre es obligatorio" },
      { status: 400 }
    );
  }

  const slug = createSlug(name);

  const existingCategory = await Category.findOne({ slug });

  if (existingCategory) {
    return NextResponse.json(
      { message: "Ya existe una categoría con ese nombre" },
      { status: 400 }
    );
  }

  const category = await Category.create({
    name,
    slug,
    description,
    isActive: true,
  });
  
  await deleteCacheByPattern("public:*");

  return NextResponse.json(category, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const isSuperAdmin = await checkSuperAdmin(session.user.id);

  if (!isSuperAdmin) {
    return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
  }

  const body = await request.json();

  const { categoryId, name, description, isActive } = body;

  if (!categoryId || !name) {
    return NextResponse.json(
      { message: "Faltan datos obligatorios" },
      { status: 400 }
    );
  }

  const slug = createSlug(name);

  const existingCategory = await Category.findOne({
    slug,
    _id: { $ne: categoryId },
  });

  if (existingCategory) {
    return NextResponse.json(
      { message: "Ya existe otra categoría con ese nombre" },
      { status: 400 }
    );
  }

  const category = await Category.findByIdAndUpdate(
    categoryId,
    {
      name,
      slug,
      description,
      isActive: Boolean(isActive),
    },
    { new: true }
  );

  await deleteCacheByPattern("public:*");

  if (!category) {
    return NextResponse.json(
      { message: "Categoría no encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(category);
}