import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUPPORTED_POSES } from "@/lib/pose-classifier";
import PoseChecker from "@/components/pose-checker";

export default async function PoseCheckerPage({ searchParams }: { searchParams: Promise<{ pose?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { pose } = await searchParams;

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
    <main className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-10">
      <PoseChecker poses={poses} initialPose={pose} />

      {recent.length > 0 && (
        <div className="w-full max-w-5xl rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Your recent checks</h2>
            <Link href="/progress" className="text-sm font-medium text-brand-600 hover:underline">Full progress →</Link>
          </div>
          <ul className="space-y-2 text-sm">
            {recent.map((r) => (
              <li key={r.id} className="flex flex-wrap justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-gray-700">
                <span className="font-medium">{poses.find((p) => p.slug === r.poseSlug)?.name ?? r.poseSlug}</span>
                <span>Best: {Math.round(r.bestConfidence * 100)}%</span>
                <span>Held: {r.heldSeconds}s</span>
                <span>{r.correct ? "✅ Correct" : "❌ Keep practicing"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
