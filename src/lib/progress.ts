import { prisma } from "@/lib/prisma";

const TIME_ZONE = "Asia/Karachi";
const DAY_MS = 24 * 60 * 60 * 1000;

// "2026-10-03" style key in the app's time zone
export const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });

const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS);

export async function getProgress(userId: string, days = 14) {
  const [checks, meditations, responses] = await Promise.all([
    prisma.poseCheck.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.meditationSession.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.questionnaireResponse.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { yogaType: true },
    }),
  ]);

  // ---- daily activity for the last N days ----
  const keys = Array.from({ length: days }, (_, i) => dayKey(new Date(Date.now() - (days - 1 - i) * DAY_MS)));
  const daily = keys.map((k) => {
    const dayChecks = checks.filter((c) => dayKey(c.createdAt) === k);
    const dayMeditations = meditations.filter((m) => dayKey(m.createdAt) === k);
    return {
      day: k.slice(5), // "10-03"
      poseChecks: dayChecks.length,
      sessions: dayMeditations.length,
      minutes: Math.round((dayMeditations.reduce((s, m) => s + m.durationSeconds, 0) / 60) * 10) / 10,
    };
  });

  // ---- AI confidence trend (last 20 checks) ----
  const accuracy = checks.slice(-20).map((c, i) => ({
    attempt: i + 1,
    pose: c.poseSlug,
    confidence: Math.round(c.bestConfidence * 100),
  }));

  // ---- per-pose summary ----
  const poseNames = await prisma.yogaPose.findMany({
    where: { slug: { in: [...new Set(checks.map((c) => c.poseSlug))] } },
    select: { slug: true, name: true },
  });
  const perPose = poseNames.map((p) => {
    const list = checks.filter((c) => c.poseSlug === p.slug);
    return {
      name: p.name,
      attempts: list.length,
      correct: list.filter((c) => c.correct).length,
      avgConfidence: Math.round((list.reduce((s, c) => s + c.bestConfidence, 0) / list.length) * 100),
      bestHold: Math.max(...list.map((c) => c.heldSeconds)),
    };
  }).sort((a, b) => b.attempts - a.attempts);

  // ---- streaks (a day counts if the user did anything) ----
  const active = new Set([...checks, ...meditations, ...responses].map((x) => dayKey(x.createdAt)));

  let currentStreak = 0;
  let cursor = Date.now();
  if (!active.has(dayKey(new Date(cursor)))) cursor -= DAY_MS; // today not done yet? start from yesterday
  while (active.has(dayKey(new Date(cursor)))) {
    currentStreak++;
    cursor -= DAY_MS;
  }

  let bestStreak = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of [...active].sort()) {
    run = prev && daysBetween(prev, k) === 1 ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    prev = k;
  }

  return {
    daily,
    accuracy,
    perPose,
    plans: responses.map((r) => ({ id: r.id, goal: r.primaryGoal, yogaType: r.yogaType.name, date: r.createdAt })),
    currentStreak,
    bestStreak,
    totalMinutes: Math.round(meditations.reduce((s, m) => s + m.durationSeconds, 0) / 60),
    totalChecks: checks.length,
    correctChecks: checks.filter((c) => c.correct).length,
  };
}
