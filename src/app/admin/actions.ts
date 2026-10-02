"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logActivity } from "@/lib/activity";

export async function deleteReview(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.review.delete({ where: { id } }).catch(() => null);
  await logActivity(admin.id, "ADMIN_DELETED_REVIEW", id);
  revalidatePath("/admin");
}

export async function setUserRole(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (role !== "USER" && role !== "ADMIN") return;
  if (userId === admin.id) return; // admins cannot change their own role

  await prisma.user.update({ where: { id: userId }, data: { role } });
  await logActivity(admin.id, "ADMIN_CHANGED_ROLE", `${userId} -> ${role}`);
  revalidatePath("/admin");
}
