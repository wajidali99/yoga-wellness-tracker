"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

type Result = { ok: true; message: string } | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

async function currentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function updateName(name: string): Promise<Result> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const clean = name.trim();
  if (clean.length < 2 || clean.length > 50) return { ok: false, error: "Name must be between 2 and 50 characters." };

  await prisma.user.update({ where: { id: user.id }, data: { name: clean } });
  await logActivity(user.id, "PROFILE_NAME_UPDATED", clean);
  revalidatePath("/", "layout");
  return { ok: true, message: "Your name has been updated." };
}

export async function updateEmail(email: string): Promise<Result> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const clean = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(clean)) return { ok: false, error: "Please enter a valid email address." };
  if (clean === user.email) return { ok: false, error: "This is already your email address." };

  const taken = await prisma.user.findUnique({ where: { email: clean } });
  if (taken) return { ok: false, error: "This email is already used by another account." };

  await prisma.user.update({ where: { id: user.id }, data: { email: clean, emailVerified: false } });
  await logActivity(user.id, "PROFILE_EMAIL_UPDATED", `${user.email} -> ${clean}`);
  revalidatePath("/", "layout");
  return { ok: true, message: "Your email has been updated. Use the new email next time you sign in." };
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<Result> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  if (!STRONG_PASSWORD.test(newPassword)) {
    return { ok: false, error: "New password must be at least 8 characters and include a letter, a number and a special character." };
  }
  if (newPassword === currentPassword) return { ok: false, error: "New password must be different from the current one." };

  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: true },
      headers: await headers(),
    });
  } catch {
    return { ok: false, error: "Your current password is incorrect." };
  }

  await logActivity(user.id, "PASSWORD_CHANGED");
  return { ok: true, message: "Password changed. You have been signed out on other devices." };
}
