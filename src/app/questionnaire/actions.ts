"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { getGoal, validateAnswers, recommend } from "@/lib/questionnaire";

type Result = { ok: true; id: string } | { ok: false; error: string };

export async function submitQuestionnaire(goalId: string, answers: Record<string, string>): Promise<Result> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false, error: "Your session has expired. Please sign in again." };

  if (!getGoal(goalId) || !validateAnswers(goalId, answers)) {
    return { ok: false, error: "Please answer all questions before submitting." };
  }

  const slug = recommend(goalId, answers);
  const yogaType = await prisma.yogaType.findUnique({ where: { slug } });
  if (!yogaType) return { ok: false, error: "Recommendation data is missing. Please try again later." };

  const response = await prisma.questionnaireResponse.create({
    data: { userId: session.user.id, primaryGoal: goalId, answers, yogaTypeId: yogaType.id },
  });

  await logActivity(session.user.id, "QUESTIONNAIRE_SUBMITTED", `${goalId} -> ${slug}`);
  return { ok: true, id: response.id };
}
