"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { toYouTubeEmbed } from "@/lib/youtube";
import { allTextDefaults } from "@/lib/questionnaire-texts";

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

export async function saveQuestionTexts(formData: FormData) {
  const admin = await requireAdmin();
  const defaults = allTextDefaults();

  for (const [name, raw] of formData.entries()) {
    if (!name.startsWith("t:")) continue;
    const key = name.slice(2);
    if (!(key in defaults)) continue; // only known questions/options can be edited

    const text = String(raw).trim().slice(0, 200);
    if (!text || text === defaults[key]) {
      await prisma.questionText.deleteMany({ where: { key } }); // back to default wording
    } else {
      await prisma.questionText.upsert({ where: { key }, update: { text }, create: { key, text } });
    }
  }

  await logActivity(admin.id, "ADMIN_EDITED_QUESTIONNAIRE");
  revalidatePath("/admin");
  revalidatePath("/questionnaire");
}

export async function updateYogaType(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const durationMinutes = Number(formData.get("durationMinutes") ?? 0);
  if (durationMinutes < 5 || durationMinutes > 120) return;

  // keep only pose slugs that really exist, in the admin's order
  const wanted = String(formData.get("poseSlugs") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const existing = await prisma.yogaPose.findMany({ where: { slug: { in: wanted } }, select: { slug: true } });
  const poseSlugs = wanted.filter((s) => existing.some((e) => e.slug === s));

  const text = (field: string) => String(formData.get(field) ?? "").trim().slice(0, 500);

  const type = await prisma.yogaType.update({
    where: { id },
    data: {
      description: text("description"),
      primaryBenefit: text("primaryBenefit"),
      frequency: text("frequency"),
      focusArea: text("focusArea"),
      durationMinutes,
      poseSlugs,
    },
  });
  await logActivity(admin.id, "ADMIN_UPDATED_YOGA_TYPE", type.slug);
  revalidatePath("/admin");
}
