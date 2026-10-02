"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function submitReview(input: { rating: number; content: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false, error: "Please sign in again." };

  const rating = Math.round(input.rating);
  const content = input.content.trim();
  if (rating < 1 || rating > 5) return { ok: false, error: "Please choose a rating from 1 to 5 stars." };
  if (content.length < 5) return { ok: false, error: "Please write at least a few words." };
  if (content.length > 1000) return { ok: false, error: "Review is too long (max 1000 characters)." };

  await prisma.review.create({ data: { userId: session.user.id, rating, content } });
  await logActivity(session.user.id, "REVIEW_SUBMITTED", `${rating} stars`);
  revalidatePath("/reviews");
  return { ok: true };
}
