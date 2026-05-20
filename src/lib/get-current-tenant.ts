import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Professional } from "@/models/Professional";
import { Tenant } from "@/models/Tenant";

export async function getCurrentTenant() {
  const session = await getServerSession(authOptions);

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

  const tenant = await Tenant.findOne({
    professional: professional._id,
  });

  if (!tenant) {
    return {
      session,
      professional,
      tenant: null,
    };
  }

  return {
    session,
    professional,
    tenant,
  };
}