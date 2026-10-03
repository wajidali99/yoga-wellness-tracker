"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { GAME_SLUGS } from "@/lib/games";

export async function saveGameScore(input: { game: string; score: number; durationSeconds?: number }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false };
  if (!GAME_SLUGS.includes(input.game)) return { ok: false };

  const score = Math.max(0, Math.min(10000, Math.round(input.score)));
  await prisma.gameScore.create({
    data: { userId: session.user.id, game: input.game, score, durationSeconds: input.durationSeconds ?? null },
  });
  await logActivity(session.user.id, "GAME_PLAYED", `${input.game}: ${score} points`);
  revalidatePath("/games");
  return { ok: true };
}
