import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { Location } from "@/models/Location";
import { createSlug } from "@/lib/slug";
import { getCache, setCache } from "@/lib/cache";

export const runtime = "nodejs";

type PublicLocationItem = {
  city: string;
  province: string;
  country: string;
  count: number;
};

type ManualLocationItem = {
  city: string;
  province: string;
  country?: string;
};

type TenantLocationCount = {
  _id: {
    city: string;
    province: string;
  };
  count: number;
};

export default async function PublicLocationsPage() {
  await connectDB();

  const cacheKey = "public:locations";

  const cachedLocations =
    await getCache<PublicLocationItem[]>(cacheKey);

  let locations: PublicLocationItem[] = cachedLocations || [];

  if (!cachedLocations) {
    const manualLocations = (await Location.find({
      isActive: true,
    })
      .sort({
        province: 1,
        city: 1,
      })
      .lean()) as ManualLocationItem[];

    const tenantCounts =
      (await Tenant.aggregate([
        {
          $match: {
            isActive: true,
            city: {
              $exists: true,
              $ne: "",
            },
            province: {
              $exists: true,
              $ne: "",
            },
          },
        },
        {
          $group: {
            _id: {
              city: "$city",
              province: "$province",
            },
            count: {
              $sum: 1,
            },
          },
        },
      ])) as TenantLocationCount[];

    const locationMap = new Map<string, PublicLocationItem>();

    for (const location of manualLocations) {
      const key = `${createSlug(location.province)}-${createSlug(
        location.city
      )}`;

      locationMap.set(key, {
        city: location.city,
        province: location.province,
        country: location.country || "Argentina",
        count: 0,
      });
    }

    for (const item of tenantCounts) {
      const key = `${createSlug(item._id.province)}-${createSlug(
        item._id.city
      )}`;

      const existing = locationMap.get(key);

      if (existing) {
        locationMap.set(key, {
          ...existing,
          count: item.count,
        });
      } else {
        locationMap.set(key, {
          city: item._id.city,
          province: item._id.province,
          country: "Argentina",
          count: item.count,
        });
      }
    }

    locations = Array.from(locationMap.values()).sort((a, b) => {
      const provinceCompare = a.province.localeCompare(b.province);

      if (provinceCompare !== 0) {
        return provinceCompare;
      }

      return a.city.localeCompare(b.city);
    });

    await setCache(cacheKey, locations, 300);
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-20 text-[var(--foreground)]">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm text-brand">Central Turnos</p>

        <h1 className="mt-4 text-5xl font-bold">
          ¿Dónde querés sacar turno?
        </h1>

        <p className="mt-4 max-w-2xl text-[var(--muted)]">
          Elegí tu ciudad para ver categorías y profesionales disponibles.
        </p>

        {locations.length === 0 ? (
          <div className="premium-card mt-10 rounded-3xl border-dashed p-10 text-center">
            <h2 className="text-xl font-bold">
              Todavía no hay ciudades disponibles
            </h2>

            <p className="mt-2 text-[var(--muted)]">
              Cuando el administrador cargue localidades, van a aparecer acá.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {locations.map((location) => (
              <Link
                key={`${location.province}-${location.city}`}
                href={`/turnos/${createSlug(location.province)}/${createSlug(
                  location.city
                )}`}
                className="premium-card premium-card-hover premium-gradient rounded-3xl p-6"
              >
                <h2 className="text-xl font-semibold">
                  {location.city}
                </h2>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  {location.province}, {location.country}
                </p>

                <p className="mt-4 text-sm text-neutral-500">
                  {location.count} profesionales
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}