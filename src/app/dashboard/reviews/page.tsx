"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Review = {
  _id: string;
  rating: number;
  comment?: string;
  isPublic: boolean;
  professionalReply?: string;
  createdAt: string;
  client?: {
    fullName: string;
    phone?: string;
  };
};

export default function DashboardReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyById, setReplyById] = useState<Record<string, string>>({});

  async function loadReviews() {
    const response = await fetch("/api/reviews");
    const data = await response.json();
    setReviews(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function updateReview(reviewId: string, body: Record<string, unknown>) {
    const response = await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, ...body }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Error al actualizar reseña");
      return;
    }

    toast.success("Reseña actualizada");
    await loadReviews();
  }

  return (
    <section className="max-w-7xl text-white">
      <h1 className="text-3xl font-bold">Reseñas</h1>
      <p className="mt-2 text-neutral-400">
        Revisá opiniones, ocultá reseñas si corresponde y respondé comentarios.
      </p>

      <div className="mt-8 space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-800 bg-neutral-900 p-10 text-center">
            <h2 className="text-xl font-bold">Todavía no tenés reseñas</h2>
            <p className="mt-2 text-neutral-400">
              Cuando completes turnos, tus clientes podrán dejar una opinión.
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <p className="text-xl text-brand">
                    {"★".repeat(review.rating)}
                    <span className="text-neutral-700">
                      {"★".repeat(5 - review.rating)}
                    </span>
                  </p>

                  <p className="mt-3 text-neutral-300">
                    {review.comment || "Sin comentario"}
                  </p>

                  <p className="mt-3 text-sm text-neutral-500">
                    {review.client?.fullName || "Cliente"} ·{" "}
                    {new Date(review.createdAt).toLocaleDateString("es-AR")}
                  </p>
                </div>

                <button
                  onClick={() =>
                    updateReview(review._id, { isPublic: !review.isPublic })
                  }
                  className={`h-fit rounded-xl border px-4 py-2 text-sm ${
                    review.isPublic
                      ? "border-yellow-900 text-yellow-400 hover:bg-yellow-950"
                      : "border-green-900 text-green-400 hover:bg-green-950"
                  }`}
                >
                  {review.isPublic ? "Ocultar" : "Publicar"}
                </button>
              </div>

              {review.professionalReply && (
                <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                  <p className="text-sm text-neutral-500">Tu respuesta</p>
                  <p className="mt-2 text-sm text-neutral-300">
                    {review.professionalReply}
                  </p>
                </div>
              )}

              <div className="mt-5">
                <textarea
                  value={replyById[review._id] ?? review.professionalReply ?? ""}
                  onChange={(e) =>
                    setReplyById({
                      ...replyById,
                      [review._id]: e.target.value,
                    })
                  }
                  className="min-h-24 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
                  placeholder="Responder reseña..."
                />

                <button
                  onClick={() =>
                    updateReview(review._id, {
                      professionalReply: replyById[review._id] ?? "",
                    })
                  }
                  className="mt-3 rounded-xl bg-brand px-5 py-3 font-medium text-white hover:bg-brand-hover"
                >
                  Guardar respuesta
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}