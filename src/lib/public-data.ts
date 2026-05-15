import { Tenant } from "@/models/Tenant";
import { Category } from "@/models/Category";
import { Professional } from "@/models/Professional";
import { Availability } from "@/models/Availability";
import { createSlug } from "@/lib/slug";
import { getCache, setCache } from "@/lib/cache";

function getTodayDayOfWeek() {
  return new Date().getDay();
}

export async function getPublicCityData({
  province,
  city,
}: {
  province: string;
  city: string;
}) {
  const cacheKey = `public:city:${province}:${city}`;

  const cached = await getCache<any>(cacheKey);

  if (cached) return cached;

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

  const availableTodaySet = new Set(
    todayAvailableIds.map((id) => id.toString())
  );

  const availableToday = professionals.filter((p: any) =>
    availableTodaySet.has(p._id.toString())
  );

  const topRated = professionals
    .filter((p: any) => p.ratingAverage > 0)
    .slice(0, 6);

  const data = {
    matchingTenants,
    professionals,
    categories,
    availableToday,
    topRated,
    cityName: matchingTenants[0]?.city || city,
    provinceName: matchingTenants[0]?.province || province,
  };

  await setCache(cacheKey, data, 300);

  return data;
}