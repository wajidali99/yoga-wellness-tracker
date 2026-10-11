"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { saveQuestionTexts } from "@/app/admin/actions";

const ROLES = ["USER", "INSTRUCTOR", "ADMIN"];
const refresh = () => revalidatePath("/admin", "layout"); // refreshes every admin page

export async function changeRole(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!ROLES.includes(role) || userId === admin.id) return; // admins can't change their own role

  const user = await prisma.user.update({ where: { id: userId }, data: { role } });
  await logActivity(admin.id, "ADMIN_CHANGED_ROLE", `${user.email} → ${role}`);
  refresh();
}

export async function deleteUser(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === admin.id) return; // admins can't delete themselves

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) return;

  // remove everything that belongs to this user, then the user
  await prisma.$transaction([
    prisma.classEnrollment.deleteMany({ where: { userId } }),
    prisma.instructorFeedback.deleteMany({ where: { OR: [{ studentId: userId }, { instructorId: userId }] } }),
    prisma.yogaClass.deleteMany({ where: { instructorId: userId } }),
    prisma.challengeParticipant.deleteMany({ where: { userId } }),
    prisma.gameScore.deleteMany({ where: { userId } }),
    prisma.review.deleteMany({ where: { userId } }),
    prisma.poseCheck.deleteMany({ where: { userId } }),
    prisma.meditationSession.deleteMany({ where: { userId } }),
    prisma.questionnaireResponse.deleteMany({ where: { userId } }),
    prisma.groupSession.deleteMany({ where: { hostId: userId } }),
    prisma.activityLog.deleteMany({ where: { userId } }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.account.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  await logActivity(admin.id, "ADMIN_DELETED_USER", user.email);
  refresh();
}

export async function removeReview(formData: FormData) {
  const admin = await requireAdmin();
  const reviewId = String(formData.get("reviewId") ?? "");
  if (!reviewId) return;
  await prisma.review.deleteMany({ where: { id: reviewId } });
  await logActivity(admin.id, "ADMIN_DELETED_REVIEW", reviewId);
  refresh();
}

export async function saveTexts(formData: FormData) {
  await saveQuestionTexts(formData); // checks admin + saves wording
  refresh();
}
