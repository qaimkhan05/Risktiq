import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    include: {
      profile: true
    }
  });
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
}
