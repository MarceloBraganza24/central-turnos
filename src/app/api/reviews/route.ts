import { NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/get-current-tenant";
import { requireTenantPermission } from "@/lib/permissions";
import { Review } from "@/models/Review";
import { recalculateProfessionalRating } from "@/lib/reviews";
import { createAuditLog } from "@/lib/audit";
import { deleteCacheByPattern } from "@/lib/cache";

export const runtime = "nodejs";

export async function GET() {
  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { tenant, professional } = context;

  const reviews = await Review.find({
    tenant: tenant._id,
    professional: professional._id,
  })
    .populate("client", "fullName phone")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(reviews);
}

export async function PATCH(request: Request) {
  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { tenant, professional, session } = context;

  const permission = await requireTenantPermission(
    tenant._id.toString(),
    "canManageClients"
  );

  if (!permission.allowed) {
    return NextResponse.json(
      { message: permission.message },
      { status: permission.status }
    );
  }

  const { reviewId, isPublic, professionalReply } = await request.json();

  const updateData: Record<string, unknown> = {};

  if (typeof isPublic === "boolean") updateData.isPublic = isPublic;

  if (typeof professionalReply === "string") {
    updateData.professionalReply = professionalReply;
    updateData.repliedAt = new Date();
  }

  const review = await Review.findOneAndUpdate(
    {
      _id: reviewId,
      tenant: tenant._id,
      professional: professional._id,
    },
    updateData,
    { new: true }
  );

  if (!review) {
    return NextResponse.json({ message: "Reseña no encontrada" }, { status: 404 });
  }

  await deleteCacheByPattern("public:*");

  await recalculateProfessionalRating({
    tenantId: tenant._id.toString(),
    professionalId: professional._id.toString(),
  });

  await createAuditLog({
    tenant: tenant._id.toString(),
    actor: session.user.id,
    actorRole: "professional",
    action: "review.updated",
    entityType: "Review",
    entityId: review._id.toString(),
    message: "Profesional actualizó una reseña",
    metadata: { isPublic, hasReply: Boolean(professionalReply) },
  });

  return NextResponse.json(review);
}