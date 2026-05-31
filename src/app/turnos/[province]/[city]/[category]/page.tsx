import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { Category } from "@/models/Category";
import { Professional } from "@/models/Professional";
import { Availability } from "@/models/Availability";
import { createSlug } from "@/lib/slug";

export const runtime = "nodejs";

type TenantItem = {
  _id: string;
  city: string;
  province: string;
  neighborhood?: string;
  offersOnline?: boolean;
};

type CategoryItem = {
  _id: string;
  name: string;
  slug: string;
};

type ProfessionalItem = {
  _id: string;
  displayName: string;
  bio?: string;
  city?: string;
  province?: string;
  neighborhood?: string;
  offersOnline?: boolean;
  languages?: string[];
  insuranceProviders?: string[];
  price?: number;
  ratingAverage?: number;
  ratingCount?: number;
};

type ProfessionalQuery = {
  tenant: {
    $in: string[];
  };
  category: string;
  isActive: boolean;
  languages?: string;
  insuranceProviders?: string;
  price?: {
    $lte: number;
  };
};

type Props = {
  params: Promise<{
    province: string;
    city: string;
    category: string;
  }>;
  searchParams: Promise<{
    online?: string;
    neighborhood?: string;
    language?: string;
    insurance?: string;
    maxPrice?: string;
    availableToday?: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { province, city, category } = await params;

  return {
    title: `${category} en ${city} | Central Turnos`,
    description: `Reservá turnos online con profesionales de ${category} en ${city}, ${province}.`,
    openGraph: {
      title: `${category} en ${city} | Central Turnos`,
      description: `Encontrá profesionales y reservá turnos online en ${city}.`,
      type: "website",
    },
  };
}

function getTodayDayOfWeek() {
  return new Date().getDay();
}

export default async function CityProfessionalsPage({
  params,
  searchParams,
}: Props) {
  const { province, city, category } = await params;
  const filters = await searchParams;

  await connectDB();

  const selectedCategory = (await Category.findOne({
    slug: category,
    isActive: true,
  }).lean()) as CategoryItem | null;

  if (!selectedCategory) {
    return null;
  }

  const tenants = (await Tenant.find({
    isActive: true,
  }).lean()) as TenantItem[];

  const matchingTenants = tenants.filter(
    (tenant: TenantItem) =>
      createSlug(tenant.province) === province &&
      createSlug(tenant.city) === city
  );

  let tenantIds = matchingTenants.map((tenant: TenantItem) =>
    tenant._id.toString()
  );

  if (filters.online === "true") {
    tenantIds = matchingTenants
      .filter((tenant: TenantItem) => tenant.offersOnline)
      .map((tenant: TenantItem) => tenant._id.toString());
  }

  if (filters.neighborhood) {
    tenantIds = matchingTenants
      .filter(
        (tenant: TenantItem) =>
          createSlug(tenant.neighborhood || "") ===
          createSlug(filters.neighborhood || "")
      )
      .map((tenant: TenantItem) => tenant._id.toString());
  }

  const professionalQuery: ProfessionalQuery = {
    tenant: {
      $in: tenantIds,
    },
    category: selectedCategory._id.toString(),
    isActive: true,
  };

  if (filters.language) {
    professionalQuery.languages = filters.language;
  }

  if (filters.insurance) {
    professionalQuery.insuranceProviders = filters.insurance;
  }

  if (filters.maxPrice) {
    professionalQuery.price = {
      $lte: Number(filters.maxPrice),
    };
  }

  let professionals = (await Professional.find({
    isActive: true,
    category: selectedCategory._id,
  })
    .sort({
      ratingAverage: -1,
      displayName: 1,
    })
    .lean()) as ProfessionalItem[];

  professionals = professionals.filter(
    (professional) =>
      createSlug(professional.province || "") === province &&
      createSlug(professional.city || "") === city
  );

  if (filters.availableToday === "true") {
    const today = getTodayDayOfWeek();

    const professionalIds = professionals.map(
      (professional: ProfessionalItem) => professional._id
    );

    const availableToday = await Availability.find({
      professional: {
        $in: professionalIds,
      },
      dayOfWeek: today,
      isActive: true,
    }).distinct("professional");

    const availableSet = new Set(
      availableToday.map((id) => id.toString())
    );

    professionals = professionals.filter(
      (professional: ProfessionalItem) =>
        availableSet.has(professional._id.toString())
    );
  }

  const cityName = matchingTenants[0]?.city || city;
  const provinceName = matchingTenants[0]?.province || province;

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-20 text-[var(--foreground)]">
      <section className="mx-auto max-w-7xl">
        <Link
          href={`/turnos/${province}/${city}`}
          className="text-sm text-[var(--muted)] underline"
        >
          Volver a categorías
        </Link>

        <h1 className="mt-4 text-5xl font-bold">
          {selectedCategory.name} en {cityName}
        </h1>

        <p className="mt-4 text-[var(--muted)]">{provinceName}</p>

        <form className="premium-card mt-8 grid gap-3 rounded-3xl p-5 md:grid-cols-6">
          <input
            name="neighborhood"
            placeholder="Barrio"
            defaultValue={filters.neighborhood || ""}
            className="rounded-xl border border-neutral-700 bg-[var(--background)] px-4 py-3"
          />

          <select
            name="online"
            defaultValue={filters.online || ""}
            className="rounded-xl border border-neutral-700 bg-[var(--background)] px-4 py-3"
          >
            <option value="">Modalidad</option>
            <option value="true">Online</option>
          </select>

          <input
            name="language"
            placeholder="Idioma"
            defaultValue={filters.language || ""}
            className="rounded-xl border border-neutral-700 bg-[var(--background)] px-4 py-3"
          />

          <input
            name="insurance"
            placeholder="Obra social"
            defaultValue={filters.insurance || ""}
            className="rounded-xl border border-neutral-700 bg-[var(--background)] px-4 py-3"
          />

          <input
            name="maxPrice"
            type="number"
            placeholder="Precio máx."
            defaultValue={filters.maxPrice || ""}
            className="rounded-xl border border-neutral-700 bg-[var(--background)] px-4 py-3"
          />

          <select
            name="availableToday"
            defaultValue={filters.availableToday || ""}
            className="rounded-xl border border-neutral-700 bg-[var(--background)] px-4 py-3"
          >
            <option value="">Disponibilidad</option>
            <option value="true">Disponible hoy</option>
          </select>

          <button className="rounded-xl bg-brand px-5 py-3 font-medium text-[var(--foreground)] md:col-span-6">
            Aplicar filtros
          </button>
        </form>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {professionals.length === 0 ? (
            <div className="premium-card rounded-3xl border-dashed p-10 text-center md:col-span-3">
              <h2 className="text-xl font-bold">
                No encontramos profesionales
              </h2>

              <p className="mt-2 text-[var(--muted)]">
                Probá quitando filtros o cambiando de categoría.
              </p>
            </div>
          ) : (
            professionals.map((professional: ProfessionalItem) => (
              <Link
                key={professional._id.toString()}
                href={`/profesionales/${professional._id.toString()}`}
                className="premium-card premium-card-hover premium-gradient rounded-3xl p-6"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-xl font-bold text-[var(--foreground)]">
                  {professional.displayName.charAt(0)}
                </div>

                <h2 className="mt-5 text-xl font-semibold">
                  {professional.displayName}
                </h2>

                <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">
                  {professional.bio ||
                    "Profesional adherido a Central Turnos."}
                </p>

                <div className="mt-5 space-y-1 text-sm text-neutral-500">
                  {professional.neighborhood && (
                    <p>{professional.neighborhood}</p>
                  )}

                  {professional.offersOnline && <p>Atiende online</p>}

                  {(professional.price ?? 0) > 0 && (
                    <p>Desde ${professional.price}</p>
                  )}

                  {(professional.ratingAverage ?? 0) > 0 && (
                    <p>
                      ⭐ {(professional.ratingAverage ?? 0).toFixed(1)} ·{" "}
                      {professional.ratingCount ?? 0} reseñas
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