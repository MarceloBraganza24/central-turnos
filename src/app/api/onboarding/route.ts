import { NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/get-current-tenant";
import { Onboarding } from "@/models/Onboarding";
import { Availability } from "@/models/Availability";
import { Appointment } from "@/models/Appointment";
import { calculateOnboardingProgress } from "@/lib/onboarding";
import {
  sendProfileCompletedWhatsApp,
  sendAvailabilityCompletedWhatsApp,
  sendFirstAppointmentWhatsApp,
} from "@/lib/whatsapp-onboarding-steps";

export const runtime = "nodejs";

function getDefaultCompletedSteps() {
  return {
    profileCompleted: false,
    categorySelected: false,
    availabilityConfigured: false,
    firstAppointmentReceived: false,
  };
}

function getDefaultWhatsappSent() {
  return {
    profileCompleted: false,
    servicesCompleted: false,
    availabilityConfigured: false,
    firstAppointmentReceived: false,
    onboardingCompleted: false,
  };
}

export async function GET() {
  const context = await getCurrentTenant();

  if (!context?.tenant) {
    return NextResponse.json(
      {
        message:
          "Primero completá la configuración de tu espacio",
      },
      { status: 400 }
    );
  }

  if (!context) {
    return NextResponse.json(
      { message: "No autorizado" },
      { status: 401 }
    );
  }

  const { tenant, professional } = context;

  let onboarding = await Onboarding.findOne({
    tenant: tenant._id,
  });

  if (!onboarding) {
    onboarding = await Onboarding.create({
      tenant: tenant._id,
      completedSteps: getDefaultCompletedSteps(),
      whatsappSent: getDefaultWhatsappSent(),
    });
  }

  if (!onboarding.completedSteps) {
    onboarding.completedSteps = getDefaultCompletedSteps();
  }

  if (!onboarding.whatsappSent) {
    onboarding.whatsappSent = getDefaultWhatsappSent();
  }

  const hasAvailability = await Availability.exists({
    tenant: tenant._id,
    professional: professional._id,
  });

  const hasAppointments = await Appointment.exists({
    tenant: tenant._id,
    professional: professional._id,
  });

  const profileCompleted = Boolean(
    professional.displayName &&
      professional.bio &&
      professional.phone &&
      professional.city &&
      professional.province
  );

  onboarding.completedSteps.profileCompleted = profileCompleted;

  onboarding.completedSteps.categorySelected = Boolean(
    professional.category
  );

  onboarding.completedSteps.availabilityConfigured =
    Boolean(hasAvailability);

  onboarding.completedSteps.firstAppointmentReceived =
    Boolean(hasAppointments);

  if (
    onboarding.completedSteps.profileCompleted &&
    !onboarding.whatsappSent.profileCompleted &&
    professional.phone
  ) {
    await sendProfileCompletedWhatsApp({
      to: professional.phone,
      tenantSlug: tenant.slug,
    });

    onboarding.whatsappSent.profileCompleted = true;
  }

  if (
    onboarding.completedSteps.availabilityConfigured &&
    !onboarding.whatsappSent.availabilityConfigured &&
    professional.phone
  ) {
    await sendAvailabilityCompletedWhatsApp({
      to: professional.phone,
      tenantSlug: tenant.slug,
    });

    onboarding.whatsappSent.availabilityConfigured = true;
  }

  if (
    onboarding.completedSteps.firstAppointmentReceived &&
    !onboarding.whatsappSent.firstAppointmentReceived &&
    professional.phone
  ) {
    await sendFirstAppointmentWhatsApp({
      to: professional.phone,
      tenantSlug: tenant.slug,
    });

    onboarding.whatsappSent.firstAppointmentReceived = true;
  }

  await onboarding.save();

  const progress = calculateOnboardingProgress(
    onboarding.completedSteps
  );

  return NextResponse.json({
    steps: onboarding.completedSteps,
    progress,
    dismissed: onboarding.dismissed,
  });
}

export async function PATCH(request: Request) {
  const context = await getCurrentTenant();

  if (!context) {
    return NextResponse.json(
      { message: "No autorizado" },
      { status: 401 }
    );
  }

  const { tenant } = context;

  const body = await request.json();

  const onboarding = await Onboarding.findOneAndUpdate(
    {
      tenant: tenant._id,
    },
    body,
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  return NextResponse.json(onboarding);
}