import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { createSlug } from "@/lib/slug";
import { getCache, setCache } from "@/lib/cache";

export const runtime = "nodejs";

type LocationItem = {
  _id: {
    city: string;
    province: string;
  };
  count: number;
};

export default async function PublicLocationsPage() {
  
  await connectDB();

  const cacheKey = "public:locations";

  const cachedLocations = await getCache<LocationItem[]>(cacheKey);

  const locations =
    cachedLocations ||
    (await Tenant.aggregate([
      {
        $match: {
          isActive: true,
          city: { $exists: true, $ne: "" },
          province: { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: {
            city: "$city",
            province: "$province",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.province": 1,
          "_id.city": 1,
        },
      },
    ]));

  if (!cachedLocations) {
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
          <div className="mt-10 rounded-3xl border border-dashed border-neutral-800 bg-neutral-900 p-10 text-center">
            <h2 className="text-xl font-bold">Todavía no hay ciudades disponibles</h2>
            <p className="mt-2 text-neutral-400">
              Cuando un profesional complete su ciudad y sea aprobado, va a aparecer acá.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {locations.map((item) => {
              const city = item._id.city;
              const province = item._id.province;

              return (
                <Link
                  key={`${province}-${city}`}
                  href={`/turnos/${createSlug(province)}/${createSlug(city)}`}
                  className="premium-card premium-card-hover rounded-3xl p-6"
                >
                  <h2 className="text-xl font-semibold">{city}</h2>
                  <p className="mt-1 text-sm text-neutral-400">{province}</p>
                  <p className="mt-4 text-sm text-neutral-500">
                    {item.count} profesionales
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {locations.map((item) => {
            const city = item._id.city;
            const province = item._id.province;

            return (
              <Link
                key={`${province}-${city}`}
                href={`/turnos/${createSlug(province)}/${createSlug(city)}`}
                className="premium-card premium-card-hover rounded-3xl p-6"
              >
                <h2 className="text-xl font-semibold">{city}</h2>
                <p className="mt-1 text-sm text-neutral-400">{province}</p>
                <p className="mt-4 text-sm text-neutral-500">
                  {item.count} profesionales
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}