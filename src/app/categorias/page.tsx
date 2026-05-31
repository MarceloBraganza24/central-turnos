import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";

export const runtime = "nodejs";

type Categoryy = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
};

export default async function CategoriesPage() {
  await connectDB();

  const categories = await Category.find({ isActive: true })
    .sort({ name: 1 })
    .lean();

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)]">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Categorías profesionales</h1>

        <p className="mt-2 text-[var(--muted)]">
          Elegí una categoría para ver profesionales disponibles.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {categories.map((category: Categoryy) => (
            <Link
              key={category._id.toString()}
              href={`/categorias/${category.slug}`}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:bg-neutral-800"
            >
              <h2 className="text-lg font-semibold">{category.name}</h2>

              <p className="mt-2 text-sm text-[var(--muted)]">
                {category.description || "Ver profesionales disponibles."}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}