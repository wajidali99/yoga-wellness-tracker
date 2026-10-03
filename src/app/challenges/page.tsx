import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Users, CalendarDays, ArrowRight, Award } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { joinChallenge } from "./actions";

export const dynamic = "force-dynamic";

const GRADIENTS = ["from-brand-400 to-brand-700", "from-sky-400 to-indigo-500", "from-purple-400 to-fuchsia-600"];

export default async function ChallengesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const challenges = await prisma.challenge.findMany({
    orderBy: { durationDays: "desc" },
    include: {
      participants: { where: { userId: session.user.id } },
      _count: { select: { participants: true } },
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Yoga Challenges</h1>
      <p className="mt-1 text-gray-600">Join a challenge, complete one task each day, and earn a badge. 🏅</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((c, i) => {
          const me = c.participants[0];
          const done = me?.completedDays.length ?? 0;
          const percent = Math.round((done / c.durationDays) * 100);

          return (
            <div key={c.id} className="flex flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-sm">
              <div className={`flex h-32 items-center justify-center bg-gradient-to-br text-6xl ${GRADIENTS[i % GRADIENTS.length]}`}>
                {c.emoji}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-xl font-bold text-gray-900">{c.title}</h2>
                <p className="mt-1 flex-1 text-sm text-gray-600">{c.description}</p>

                <div className="mt-4 flex gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><CalendarDays size={16} /> {c.durationDays} days</span>
                  <span className="flex items-center gap-1"><Users size={16} /> {c._count.participants} joined</span>
                </div>

                {me && (
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs text-gray-500">
                      <span>{done}/{c.durationDays} days</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-sand-100">
                      <div className="h-2 rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )}

                <div className="mt-5">
                  {!me ? (
                    <form action={joinChallenge.bind(null, c.slug)}>
                      <button className="w-full rounded-full bg-brand-500 py-2.5 font-semibold text-white hover:bg-brand-600">
                        Join challenge
                      </button>
                    </form>
                  ) : me.completedAt ? (
                    <Link href={`/challenges/${c.slug}`} className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-50 py-2.5 font-semibold text-amber-700">
                      <Award size={18} /> Completed – view badge
                    </Link>
                  ) : (
                    <Link href={`/challenges/${c.slug}`} className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-500 py-2.5 font-semibold text-brand-700 hover:bg-brand-50">
                      Continue – Day {done + 1} <ArrowRight size={16} />
                    </Link>
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
