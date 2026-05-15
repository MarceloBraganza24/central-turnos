import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Professional } from "@/models/Professional";
import { Tenant } from "@/models/Tenant";

export async function getCurrentTenant() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  await connectDB();

  const professional = await Professional.findOne({
    user: session.user.id,
  });

  if (!professional) {
    return null;
  }

  let tenant = await Tenant.findOne({
    professional: professional._id,
  });

  if (!tenant) {
    tenant = await Tenant.create({
      professional: professional._id,
      owner: session.user.id,
      name: professional.displayName,
      slug: professional.slug,
      subdomain: professional.slug,
    });
  }

  return {
    session,
    professional,
    tenant,
  };
}