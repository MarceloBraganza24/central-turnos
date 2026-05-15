import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import { Review } from "@/models/Review";
import { recalculateProfessionalRating } from "@/lib/reviews";
import { createAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { appointmentId, rating, comment } = await request.json();

    if (!appointmentId || !rating) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "La calificación debe ser entre 1 y 5" },
        { status: 400 }
      );
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return NextResponse.json(
        { message: "Turno no encontrado" },
        { status: 404 }
      );
    }

    if (appointment.status !== "completed") {
      return NextResponse.json(
        { message: "Solo se pueden reseñar turnos completados" },
        { status: 400 }
      );
    }

    const existingReview = await Review.findOne({
      appointment: appointment._id,
    });

    if (existingReview) {
      return NextResponse.json(
        { message: "Este turno ya tiene una reseña" },
        { status: 409 }
      );
    }

    const review = await Review.create({
      tenant: appointment.tenant,
      professional: appointment.professional,
      appointment: appointment._id,
      client: appointment.client,
      rating: Number(rating),
      comment,
      isPublic: true,
    });

    const summary = await recalculateProfessionalRating({
      tenantId: appointment.tenant.toString(),
      professionalId: appointment.professional.toString(),
    });

    await createAuditLog({
      tenant: appointment.tenant.toString(),
      actorRole: "public_user",
      action: "review.created",
      entityType: "Review",
      entityId: review._id.toString(),
      message: "Cliente creó una reseña",
      metadata: {
        appointmentId,
        rating,
      },
    });

    return NextResponse.json(
      {
        message: "Reseña enviada correctamente",
        review,
        summary,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error al enviar reseña", error },
      { status: 500 }
    );
  }
}