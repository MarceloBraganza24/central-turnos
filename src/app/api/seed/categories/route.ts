import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";

export const runtime = "nodejs";

const categories = [
  {
    name: "Nutrición",
    slug: "nutricion",
    description: "Nutricionistas y profesionales de alimentación.",
  },
  {
    name: "Psicología",
    slug: "psicologia",
    description: "Psicólogos y terapeutas.",
  },
  {
    name: "Kinesiología",
    slug: "kinesiologia",
    description: "Kinesiólogos, rehabilitación y tratamiento físico.",
  },
  {
    name: "Entrenamiento",
    slug: "entrenamiento",
    description: "Entrenadores personales y preparadores físicos.",
  },
  {
    name: "Estética",
    slug: "estetica",
    description: "Servicios de estética, belleza y cuidado personal.",
  },
  {
    name: "Medicina",
    slug: "medicina",
    description: "Médicos y especialistas de salud.",
  },
  {
    name: "Abogacía",
    slug: "abogacia",
    description: "Abogados y asesoramiento legal.",
  },
  {
    name: "Contabilidad",
    slug: "contabilidad",
    description: "Contadores y asesoramiento impositivo.",
  },
];

export async function GET() {
  await connectDB();

  for (const category of categories) {
    await Category.updateOne(
      { slug: category.slug },
      { $setOnInsert: category },
      { upsert: true }
    );
  }

  return NextResponse.json({
    message: "Categorías iniciales creadas correctamente",
  });
}