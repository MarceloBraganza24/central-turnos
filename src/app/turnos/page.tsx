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
    const manualLocations = await Location.find({
      isActive: true,
    })
      .sort({
        province: 1,
        city: 1,
      })
      .lean();

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

    const countMap = new Map<string, number>();

    tenantCounts.forEach((item) => {
      const key = `${createSlug(item._id.province)}-${createSlug(
        item._id.city
      )}`;

      countMap.set(key, item.count);
    });

    locations = manualLocations.map((location) => {
      const key = `${createSlug(location.province)}-${createSlug(
        location.city
      )}`;

      return {
        city: location.city,
        province: location.province,
        country: location.country || "Argentina",
        count: countMap.get(key) || 0,
      };
    });

    await setCache(cacheKey, locations, 300);
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-20 text-white">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm text-brand">Central Turnos</p>

        <h1 className="mt-4 text-5xl font-bold">
          ¿Dónde querés sacar turno?
        </h1>

        <p className="mt-4 max-w-2xl text-neutral-400">
          Elegí tu ciudad para ver categorías y profesionales disponibles.
        </p>

        {locations.length === 0 ? (
          <div className="premium-card mt-10 rounded-3xl border-dashed p-10 text-center">
            <h2 className="text-xl font-bold">
              Todavía no hay ciudades disponibles
            </h2>

            <p className="mt-2 text-neutral-400">
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

                <p className="mt-1 text-sm text-neutral-400">
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