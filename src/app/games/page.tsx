import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Trophy, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GAMES } from "@/lib/games";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const [bests, leaders] = await Promise.all([
    prisma.gameScore.groupBy({ by: ["game"], where: { userId: session.user.id }, _max: { score: true } }),
    Promise.all(
      GAMES.map((g) =>
        prisma.gameScore.findMany({
          where: { game: g.slug },
          orderBy: { score: "desc" },
          take: 5,
          include: { user: { select: { name: true } } },
        })
      )
    ),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Brain Games</h1>
      <p className="mt-1 text-gray-600">Short, calming games to train your focus and memory. 🧠</p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {GAMES.map((g, i) => {
          const best = bests.find((b) => b.game === g.slug)?._max.score;
          return (
            <div key={g.slug} className="flex flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-sm">
              <div className={`flex h-32 items-center justify-center bg-gradient-to-br text-6xl ${g.gradient}`}>{g.emoji}</div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-xl font-bold text-gray-900">{g.title}</h2>
                <p className="mt-1 flex-1 text-sm text-gray-600">{g.desc}</p>
                <p className="mt-3 text-sm text-gray-500">
                  Your best: <b className="text-gray-900">{best ?? "–"}</b>
                </p>
                <Link
                  href={`/games/${g.slug}`}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 py-2.5 font-semibold text-white hover:bg-brand-600"
                >
                  Play <ArrowRight size={16} />
                </Link>

                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <Trophy size={14} /> Top players
                  </p>
                  {leaders[i].length === 0 ? (
                    <p className="text-sm text-gray-400">No scores yet.</p>
                  ) : (
                    <ol className="space-y-1 text-sm">
                      {leaders[i].map((s, rank) => (
                        <li key={s.id} className="flex justify-between text-gray-700">
                          <span>{["🥇", "🥈", "🥉", "4.", "5."][rank]} {s.user.name}</span>
                          <span className="font-semibold">{s.score}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
