"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUPPORTED_POSES } from "@/lib/pose-classifier";

type Input = { poseSlug: string; bestConfidence: number; heldSeconds: number };

export async function savePoseCheck(input: Input) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false };
  if (!SUPPORTED_POSES.includes(input.poseSlug)) return { ok: false };

  const heldSeconds = Math.max(0, Math.min(3600, Math.round(input.heldSeconds)));
  const bestConfidence = Math.max(0, Math.min(1, input.bestConfidence));

  await prisma.poseCheck.create({
    data: {
      userId: session.user.id,
      poseSlug: input.poseSlug,
      bestConfidence,
      heldSeconds,
      correct: heldSeconds >= 3, // held correctly for at least 3 seconds
    },
  });
  return { ok: true };
}
