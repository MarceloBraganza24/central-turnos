import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { Professional } from "@/models/Professional";
import { Availability } from "@/models/Availability";
import Image from "next/image";

export const runtime = "nodejs";

const days = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

type Props = {
  params: Promise<{ slug: string }>;
};

type AvailabilityItem = {
  _id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export default async function TenantPublicPage({ params }: Props) {
  const { slug } = await params;

  await connectDB();

  const tenant = await Tenant.findOne({
    slug,
    isActive: true,
  }).lean();

  if (!tenant) notFound();

  const professional = await Professional.findOne({
    _id: tenant.professional,
    isActive: true,
  })
    .populate("category")
    .lean();

  if (!professional) notFound();

  const availability = await Availability.find({
    professional: professional._id,
    isActive: true,
  })
    .sort({ dayOfWeek: 1, startTime: 1 })
    .lean();

  return (
    <main
      className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)]"
      style={
        {
          "--tenant-primary": tenant.primaryColor,
          "--tenant-accent": tenant.accentColor,
        } as React.CSSProperties
      }
    >
      <section className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)]">
          <div className="p-8" style={{ backgroundColor: tenant.primaryColor }}>
            <div className="flex items-center gap-5">
              {tenant.logoUrl && (
                <Image
                  src={tenant.logoUrl}
                  alt={tenant.name || "Logo"}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-3xl object-cover"
                />
              )} : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--card)]/20 text-3xl font-bold">
                  {tenant.name.charAt(0)}
                </div>
              )

              <div>
                <p className="text-sm font-medium text-black/70">
                  {professional?.category?.name}
                </p>

                <h1 className="text-4xl font-bold text-black">
                  {tenant.name}
                </h1>

                <p className="mt-2 text-black/70">
                  {tenant.welcomeMessage}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_0.8fr]">
            <div>
              <h2 className="text-xl font-semibold">Sobre mí</h2>

              <p className="mt-3 text-neutral-300">
                {professional.bio || "Profesional adherido al sistema."}
              </p>

              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                <h3 className="font-semibold">Horarios de atención</h3>

                <div className="mt-3 divide-y divide-neutral-800">
                  {availability.map((item: AvailabilityItem) => (
                    <div
                      key={item._id.toString()}
                      className="flex justify-between py-3 text-sm"
                    >
                      <span>{days[item.dayOfWeek]}</span>
                      <span className="text-[var(--muted)]">
                        {item.startTime} a {item.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                <h3 className="font-semibold">Política de cancelación</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {tenant.cancellationPolicy}
                </p>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                <p className="text-sm text-[var(--muted)]">Profesional</p>
                <p className="mt-1 text-xl font-semibold">
                  {professional.displayName}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                <p className="text-sm text-[var(--muted)]">Valor</p>
                <p className="mt-1 text-3xl font-bold">
                  {professional.price > 0 ? `$${professional.price}` : "Consultar"}
                </p>
              </div>

              {tenant.requiresDeposit && (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                  <p className="text-sm text-[var(--muted)]">Seña requerida</p>
                  <p className="mt-1 text-xl font-semibold">
                    ${tenant.defaultDepositAmount}
                  </p>
                </div>
              )}

              <Link
                href={`/profesionales/${professional._id.toString()}/reservar?tenant=${tenant.slug}`}
                className="block rounded-xl py-3 text-center font-medium text-black"
                style={{ backgroundColor: tenant.primaryColor }}
              >
                Reservar turno
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}