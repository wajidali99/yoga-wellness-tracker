import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUPPORTED_POSES } from "@/lib/pose-classifier";
import PoseChecker from "@/components/pose-checker";

export default async function PoseCheckerPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const poses = await prisma.yogaPose.findMany({
    where: { slug: { in: SUPPORTED_POSES } },
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });

  const recent = await prisma.poseCheck.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-200 to-sky-50 flex flex-col items-center gap-8 p-6">
      <PoseChecker poses={poses} />

      {recent.length > 0 && (
        <div className="w-full max-w-5xl rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-3 font-semibold text-gray-800">Your recent checks</h2>
          <ul className="space-y-2 text-sm">
            {recent.map((r) => (
              <li key={r.id} className="flex justify-between rounded-md border border-gray-200 px-3 py-2 text-gray-700">
                <span>{poses.find((p) => p.slug === r.poseSlug)?.name ?? r.poseSlug}</span>
                <span>Best: {Math.round(r.bestConfidence * 100)}%</span>
                <span>Held: {r.heldSeconds}s</span>
                <span>{r.correct ? "✅ Correct" : "❌ Keep practicing"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link href="/dashboard" className="text-sm text-sky-700 hover:underline">← Dashboard</Link>
    </main>
  );
}
