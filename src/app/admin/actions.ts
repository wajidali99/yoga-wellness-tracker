"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { toYouTubeEmbed } from "@/lib/youtube";

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
  if (!["USER", "INSTRUCTOR", "ADMIN"].includes(role)) return;
  if (userId === admin.id) return; // admins cannot change their own role

  await prisma.user.update({ where: { id: userId }, data: { role } });
  await logActivity(admin.id, "ADMIN_CHANGED_ROLE", `${userId} -> ${role}`);
  revalidatePath("/admin");
}

export async function updatePoseMedia(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();

  // image: empty, a file in /public (starts with "/"), or an https link
  const imageOk = imageUrl === "" || imageUrl.startsWith("/") || imageUrl.startsWith("https://");
  // video: empty or a valid YouTube link
  const videoOk = videoUrl === "" || toYouTubeEmbed(videoUrl) !== null;
  if (!imageOk || !videoOk) return;

  const pose = await prisma.yogaPose.update({
    where: { id },
    data: { imageUrl: imageUrl || null, videoUrl: videoUrl || null },
  });
  await logActivity(admin.id, "ADMIN_UPDATED_POSE_MEDIA", pose.slug);
  revalidatePath("/admin");
  revalidatePath("/poses");
  revalidatePath(`/poses/${pose.slug}`);
}
