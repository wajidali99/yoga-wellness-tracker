import { prisma } from "@/lib/prisma";

// Records what a user did. Never breaks the main action if logging fails.
export async function logActivity(userId: string | null, action: string, details?: string) {
  try {
    await prisma.activityLog.create({ data: { userId, action, details } });
  } catch (e) {
    console.error("Failed to write activity log", e);
  }
}
