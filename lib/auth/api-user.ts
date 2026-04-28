import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { syncPermanentAdminUser } from "@/lib/auth/permanent-admin";

export async function getApiUser() {
  await syncPermanentAdminUser();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return session.user;
}
