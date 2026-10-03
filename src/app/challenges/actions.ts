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

function refresh(slug: string) {
  revalidatePath("/challenges");
  revalidatePath(`/challenges/${slug}`);
}

export async function joinChallenge(slug: string) {
  const userId = await currentUserId();
  if (!userId) return;
  const challenge = await prisma.challenge.findUnique({ where: { slug } });
  if (!challenge) return;

  await prisma.challengeParticipant.upsert({
    where: { userId_challengeId: { userId, challengeId: challenge.id } },
    update: {},
    create: { userId, challengeId: challenge.id },
  });
  await logActivity(userId, "CHALLENGE_JOINED", slug);
  refresh(slug);
}

export async function completeDay(slug: string, day: number) {
  const userId = await currentUserId();
  if (!userId) return;
  const challenge = await prisma.challenge.findUnique({ where: { slug } });
  if (!challenge) return;

  const p = await prisma.challengeParticipant.findUnique({
    where: { userId_challengeId: { userId, challengeId: challenge.id } },
  });
  if (!p) return;

  // days must be done in order: only the next day can be completed
  if (day !== p.completedDays.length + 1 || day > challenge.durationDays) return;

  const completedDays = [...p.completedDays, day];
  const finished = completedDays.length >= challenge.durationDays;

  await prisma.challengeParticipant.update({
    where: { id: p.id },
    data: { completedDays, completedAt: finished ? new Date() : null },
  });
  await logActivity(userId, "CHALLENGE_DAY_COMPLETED", `${slug} day ${day}`);
  if (finished) await logActivity(userId, "CHALLENGE_COMPLETED", slug);
  refresh(slug);
}

export async function leaveChallenge(slug: string) {
  const userId = await currentUserId();
  if (!userId) return;
  const challenge = await prisma.challenge.findUnique({ where: { slug } });
  if (!challenge) return;

  await prisma.challengeParticipant.deleteMany({ where: { userId, challengeId: challenge.id } });
  await logActivity(userId, "CHALLENGE_LEFT", slug);
  refresh(slug);
}
