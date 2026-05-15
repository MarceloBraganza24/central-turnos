import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { Category } from "@/models/Category";
import { Professional } from "@/models/Professional";
import { Availability } from "@/models/Availability";
import { createSlug } from "@/lib/slug";
import { getCache, setCache } from "@/lib/cache";
import { getPublicCityData } from "@/lib/public-data";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ province: string; city: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { province, city } = await params;

  return {
    title: `Turnos en ${city} | Central Turnos`,
    description: `Encontrá profesionales y reservá turnos online en ${city}, ${province}.`,
  };
}

function getTodayDayOfWeek() {
  return new Date().getDay();
}

export default async function CityCategoriesPage({ params }: Props) {
  const { province, city } = await params;

  const cacheKey = `public:city:${province}:${city}`;

  const cached = await getCache<any>(cacheKey);

  if (cached) {
    // Ojo: esto sirve mejor si separás esta página en componente,
    // pero por ahora podés cachear solo queries individuales.
  }

  await connectDB();

  const tenants = await Tenant.find({ isActive: true }).lean();

  const matchingTenants = tenants.filter(
    (tenant: any) =>
      createSlug(tenant.province) === province &&
      createSlug(tenant.city) === city
  );

  const tenantIds = matchingTenants.map((tenant: any) => tenant._id);

  const professionals = await Professional.find({
    tenant: { $in: tenantIds },
    isActive: true,
    category: { $ne: null },
  })
    .sort({ ratingAverage: -1 })
    .lean();

  const categoryIds = [
    ...new Set(professionals.map((item: any) => item.category?.toString())),
  ];

  const categories = await Category.find({
    _id: { $in: categoryIds },
    isActive: true,
  }).lean();

  const todayAvailableIds = await Availability.find({
    tenant: { $in: tenantIds },
    dayOfWeek: getTodayDayOfWeek(),
    isActive: true,
  }).distinct("professional");

  const availableTodaySet = new Set(todayAvailableIds.map((id) => id.toString()));

  const availableToday = professionals.filter((p: any) =>
    availableTodaySet.has(p._id.toString())
  );

  const topRated = professionals
    .filter((p: any) => p.ratingAverage > 0)
    .slice(0, 6);

  const cityName = matchingTenants[0]?.city || city;
  const provinceName = matchingTenants[0]?.province || province;

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-20 text-white">
      <section className="mx-auto max-w-7xl">
        <Link href="/turnos" className="text-sm text-neutral-400 underline">
          Cambiar ciudad
        </Link>

        <div className="mt-6 rounded-3xl border border-neutral-800 bg-linear-to-br from-brand/20 to-neutral-900 p-8">
          <p className="text-sm text-brand">Central Turnos</p>

          <h1 className="mt-4 text-5xl font-bold">
            Turnos en {cityName}
          </h1>

          <p className="mt-4 max-w-2xl text-neutral-300">
            Elegí una categoría y reservá con profesionales disponibles en{" "}
            {cityName}, {provinceName}.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-neutral-950 p-5">
              <p className="text-sm text-neutral-500">Profesionales</p>
              <p className="mt-2 text-3xl font-bold">{professionals.length}</p>
            </div>

            <div className="rounded-2xl bg-neutral-950 p-5">
              <p className="text-sm text-neutral-500">Categorías</p>
              <p className="mt-2 text-3xl font-bold">{categories.length}</p>
            </div>

            <div className="rounded-2xl bg-neutral-950 p-5">
              <p className="text-sm text-neutral-500">Disponibles hoy</p>
              <p className="mt-2 text-3xl font-bold">{availableToday.length}</p>
            </div>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-3xl font-bold">Categorías destacadas</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {categories.map((category: any) => (
              <Link
                key={category._id.toString()}
                href={`/turnos/${province}/${city}/${category.slug}`}
                className="premium-card premium-card-hover rounded-3xl p-6"
              >
                <h3 className="text-xl font-semibold">{category.name}</h3>
                <p className="mt-2 text-sm text-neutral-400">
                  {category.description || "Ver profesionales disponibles"}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {availableToday.length > 0 && (
          <section className="mt-12">
            <h2 className="text-3xl font-bold">Disponibles hoy</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {availableToday.slice(0, 6).map((professional: any) => (
                <Link
                  key={professional._id.toString()}
                  href={`/profesionales/${professional._id.toString()}`}
                  className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6"
                >
                  <h3 className="text-xl font-semibold">
                    {professional.displayName}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-400">
                    {professional.bio || "Profesional disponible para turnos."}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {topRated.length > 0 && (
          <section className="mt-12">
            <h2 className="text-3xl font-bold">Mejor valorados</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {topRated.map((professional: any) => (
                <Link
                  key={professional._id.toString()}
                  href={`/profesionales/${professional._id.toString()}`}
                  className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6"
                >
                  <h3 className="text-xl font-semibold">
                    {professional.displayName}
                  </h3>
                  <p className="mt-2 text-brand">
                    ⭐ {professional.ratingAverage.toFixed(1)} ·{" "}
                    {professional.ratingCount} reseñas
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}