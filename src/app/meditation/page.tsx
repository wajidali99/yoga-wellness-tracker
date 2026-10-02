import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTime } from "@/lib/ambient-sound";

export default async function MeditationPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const recent = await prisma.meditationSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-200 to-sky-50 flex flex-col items-center justify-center gap-8 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800">Select one option!</h1>
        <div className="space-y-4">
          <Link href="/meditation/breathing" className="block rounded-md bg-red-400 py-3 text-center text-white hover:bg-red-500">
            Deep Breathing
          </Link>
          <Link href="/meditation/mindful" className="block rounded-md bg-red-400 py-3 text-center text-white hover:bg-red-500">
            Mindful Meditation
          </Link>
        </div>
      </div>

      {recent.length > 0 && (
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-3 font-semibold text-gray-800">Your recent sessions</h2>
          <ul className="space-y-2 text-sm">
            {recent.map((s) => (
              <li key={s.id} className="flex justify-between rounded-md border border-gray-200 px-3 py-2 text-gray-700">
                <span>{s.type === "breathing" ? "🌬️ Breathing" : "🧘 Meditation"}</span>
                <span>{formatTime(s.durationSeconds)}</span>
                <span>{s.completed ? "✅ Completed" : "⏹ Stopped"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link href="/dashboard" className="text-sm text-sky-700 hover:underline">← Dashboard</Link>
    </main>
  );
}
