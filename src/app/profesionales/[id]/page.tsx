import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Professional } from "@/models/Professional";
import { Availability } from "@/models/Availability";
import { Review } from "@/models/Review";
import "@/models/Category";

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

type ReviewItem = {
  _id: string;
  rating: number;
  comment?: string;
  professionalReply?: string;
  client?: {
    fullName?: string;
  };
};

type Props = {
  params: Promise<{ id: string }>;
};

type PopulatedCategory = {
  _id: string;
  name: string;
  slug: string;
};

type AvailabilityItem = {
  _id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type PublicProfessional = {
  _id: string;
  displayName: string;
  slug?: string;
  bio?: string;
  phone?: string;
  price?: number;
  appointmentDurationMinutes?: number;
  address?: string;
  city?: string;
  province?: string;
  category?: PopulatedCategory;
  ratingAverage?: number;
  ratingCount?: number;
};

export default async function ProfessionalDetailPage({ params }: Props) {
  const { id } = await params;

  await connectDB();

  const professional = await Professional.findById(id)
    .populate("category")
    .lean<PublicProfessional>();

  if (!professional) notFound();

  const availability = await Availability.find({
    professional: professional._id,
    isActive: true,
  })
    .sort({ dayOfWeek: 1, startTime: 1 })
    .lean<AvailabilityItem[]>();

  const reviews = await Review.find({
    professional: professional._id,
    isPublic: true,
  })
    .populate("client", "fullName")
    .sort({ createdAt: -1 })
    .limit(6)
    .lean<ReviewItem[]>();

  const whatsappLink = professional.phone
    ? `https://wa.me/${String(professional.phone).replace(/\D/g, "")}`
    : null;

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)]">
      <section className="mx-auto max-w-5xl">
        <Link
          href={`/categorias/${professional.category?.slug || ""}`}
          className="text-sm text-brand underline"
        >
          Volver
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)]">
          <div className="premium-card premium-card-hover premium-gradient bg-linear-to-br from-neutral-800 to-neutral-950 p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm text-neutral-300">
                  {professional.category?.name}
                </p>

                <h1 className="mt-5 text-4xl font-bold text-white">
                  {professional.displayName}
                </h1>

                {professional.city && (
                  <p className="mt-2 text-[var(--muted)]">
                    {professional.city}, {professional.province}
                  </p>
                )}
              </div>

              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-4xl font-bold text-black">
                {professional.displayName?.charAt(0)}
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-[1.5fr_1fr]">
            <div>
              <h2 className="text-xl font-semibold">Sobre el profesional</h2>

              <p className="mt-3 text-black">
                {professional.bio ||
                  "Profesional adherido al sistema de turnos."}
              </p>

              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                <h3 className="font-semibold">Horarios de atención</h3>

                {availability.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    Este profesional todavía no cargó horarios.
                  </p>
                ) : (
                  <div className="mt-3 divide-y divide-neutral-800">
                    {availability.map((item: AvailabilityItem) => (
                      <div
                        key={item._id.toString()}
                        className="flex justify-between py-3 text-sm"
                      >
                        <span>{days[item.dayOfWeek]}</span>
                        <span className="text-black">
                          {item.startTime} a {item.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                <p className="text-sm text-[var(--muted)]">Valor</p>
                {(professional.price ?? 0) > 0 && (
                  <p className="mt-1 text-3xl font-bold">
                    ${professional.price}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                <p className="text-sm text-[var(--muted)]">Duración</p>
                <p className="mt-1 text-xl font-semibold">
                  {professional.appointmentDurationMinutes} minutos
                </p>
              </div>

              {professional.address && (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                  <p className="text-sm text-[var(--muted)]">Dirección</p>
                  <p className="mt-1">{professional.address}</p>
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                <h3 className="font-semibold">Reseñas</h3>

                {(professional.ratingCount ?? 0) > 0 ? (
                  <>

                    {(professional.ratingCount ?? 0) > 0 && (
                      <p>
                        ⭐ {(professional.ratingAverage ?? 0).toFixed(1)} ·{" "}
                        {professional.ratingCount} reseñas
                      </p>
                    )}

                    <div className="mt-4 space-y-3">
                      {reviews.map((review: ReviewItem) => (
                        <div
                          key={review._id.toString()}
                          className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
                        >
                          <p className="text-sm font-medium">
                            {"★".repeat(review.rating)}
                          </p>

                          {review.comment && (
                            <p className="mt-2 text-sm text-[var(--muted)]">
                              {review.comment}
                            </p>
                          )}

                          <p className="mt-2 text-xs text-[var(--muted)]">
                            {review.client?.fullName || "Cliente"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Este profesional todavía no tiene reseñas.
                  </p>
                )}
              </div>

              <Link
                href={`/profesionales/${professional._id.toString()}/reservar`}
                className="block rounded-xl bg-brand text-white py-3 text-center font-medium  transition hover:bg-neutral-200 hover:bg-brand-hover"
              >
                Reservar turno
              </Link>

              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  className="block rounded-xl border border-[var(--border)] py-3 text-center font-medium bg-brand text-white transition hover:bg-brand-hover"
                >
                  Consultar por WhatsApp
                </a>
              )}

              {professional.slug && (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs text-black">Link público</p>
                  <p className="mt-1 break-all text-sm text-black">
                    /p/{professional.slug}
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}