import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Professional } from "@/models/Professional";

export const runtime = "nodejs";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type Professionall = {
  _id: string;
  displayName: string;
  bio?: string;
  profileImage?: string;
  city?: string;

  ratingAverage?: number;
  ratingCount?: number;

  neighborhood?: string;
  offersOnline?: boolean;

  price?: number;
};

export default async function CategoryProfessionalsPage({ params }: Props) {
  const { slug } = await params;

  await connectDB();

  const category = await Category.findOne({
    slug,
    isActive: true,
  }).lean();

  if (!category) {
    notFound();
  }

  const professionals = await Professional.find({
    category: category._id,
    isActive: true,
  })
    .populate("category")
    .sort({ displayName: 1 })
    .lean();

  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-white">
      <section className="mx-auto max-w-6xl">
        <Link href="/categorias" className="text-sm text-neutral-400 underline">
          Volver a categorías
        </Link>

        <h1 className="mt-4 text-3xl font-bold">{category.name}</h1>

        <p className="mt-2 text-neutral-400">
          Profesionales disponibles en esta categoría.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {professionals.length === 0 ? (
            <p className="text-neutral-400">
              Todavía no hay profesionales activos en esta categoría.
            </p>
          ) : (
            professionals.map((professional: Professionall) => (
              <Link
                key={professional._id.toString()}
                href={`/profesionales/${professional._id.toString()}`}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition hover:bg-neutral-800"
              >
                <h2 className="text-lg font-semibold">
                  {professional.displayName}
                </h2>

                <p className="mt-2 line-clamp-3 text-sm text-neutral-400">
                  {professional.bio || "Profesional adherido al sistema."}
                </p>

                <div className="mt-4 text-sm text-neutral-300">
                  {professional.city && <p>{professional.city}</p>}

                  {(professional.price ?? 0) > 0 && (
                    <p className="mt-1">
                      Consulta desde ${professional.price}
                    </p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}