"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

async function currentUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function enrollClass(classId: string) {
  const userId = await currentUserId();
  if (!userId) return;
  await prisma.classEnrollment.upsert({
    where: { classId_userId: { classId, userId } },
    update: {},
    create: { classId, userId },
  });
  await logActivity(userId, "CLASS_ENROLLED", classId);
  revalidatePath("/classes");
}

export async function leaveClass(classId: string) {
  const userId = await currentUserId();
  if (!userId) return;
  await prisma.classEnrollment.deleteMany({ where: { classId, userId } });
  await logActivity(userId, "CLASS_LEFT", classId);
  revalidatePath("/classes");
}
