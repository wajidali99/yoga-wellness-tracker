"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Input = {
  type: "breathing" | "meditation";
  durationSeconds: number;
  breaths?: number;
  completed: boolean;
};

export async function saveMeditationSession(input: Input) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false };

  const validType = input.type === "breathing" || input.type === "meditation";
  if (!validType || input.durationSeconds <= 0 || input.durationSeconds > 3600) return { ok: false };

  await prisma.meditationSession.create({
    data: {
      userId: session.user.id,
      type: input.type,
      durationSeconds: Math.round(input.durationSeconds),
      breaths: input.breaths ?? null,
      completed: input.completed,
    },
  });
  return { ok: true };
}
