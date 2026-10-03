import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lock, Award, Camera, Wind } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { joinChallenge, completeDay, leaveChallenge } from "../actions";

export const dynamic = "force-dynamic";

export default async function ChallengeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { slug } = await params;
  const challenge = await prisma.challenge.findUnique({
    where: { slug },
    include: { participants: { where: { userId: session.user.id } } },
  });
  if (!challenge) notFound();

  const me = challenge.participants[0];
  const done = me?.completedDays ?? [];
  const nextDay = done.length + 1;
  const percent = Math.round((done.length / challenge.durationDays) * 100);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/challenges" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
        <ArrowLeft size={16} /> All challenges
      </Link>

      <div className="mt-6 flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-4xl">{challenge.emoji}</span>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
          <p className="text-gray-600">{challenge.description}</p>
        </div>
      </div>

      {me?.completedAt && (
        <div className="mt-8 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-white shadow-lg">
          <Award size={48} />
          <div>
            <p className="text-xl font-bold">Challenge complete! 🎉</p>
            <p className="text-amber-50">
              You earned the <b>{challenge.title}</b> badge on {me.completedAt.toLocaleDateString("en-GB", { timeZone: "Asia/Karachi" })}.
            </p>
          </div>
        </div>
      )}

      {me ? (
        <div className="mt-8">
          <div className="mb-1 flex justify-between text-sm text-gray-600">
            <span>{done.length} of {challenge.durationDays} days done</span>
            <span>{percent}%</span>
          </div>
          <div className="h-3 rounded-full bg-sand-100">
            <div className="h-3 rounded-full bg-brand-500 transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
      ) : (
        <form action={joinChallenge.bind(null, challenge.slug)} className="mt-8">
          <button className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600">Join this challenge</button>
        </form>
      )}

      <ol className="mt-8 space-y-3">
        {challenge.tasks.map((task, i) => {
          const day = i + 1;
          const isDone = done.includes(day);
          const isNext = !!me && day === nextDay;
          const locked = !isDone && !isNext;

          return (
            <li
              key={day}
              className={`flex items-center gap-4 rounded-2xl border p-4 ${
                isDone ? "border-brand-200 bg-brand-50" : isNext ? "border-brand-400 bg-white shadow-sm" : "border-sand-200 bg-white opacity-70"
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                isDone ? "bg-brand-500 text-white" : isNext ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-400"
              }`}>
                {isDone ? <CheckCircle2 size={20} /> : locked ? <Lock size={16} /> : day}
              </span>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Day {day}</p>
                <p className="text-gray-800">{task}</p>
              </div>
              {isNext && (
                <form action={completeDay.bind(null, challenge.slug, day)}>
                  <button className="whitespace-nowrap rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
                    Mark as done
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/pose-checker" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          <Camera size={16} /> Open Pose Checker
        </Link>
        <Link href="/meditation" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          <Wind size={16} /> Open Meditation
        </Link>
        {me && !me.completedAt && (
          <form action={leaveChallenge.bind(null, challenge.slug)}>
            <button className="rounded-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">Leave challenge</button>
          </form>
        )}
      </div>
    </main>
  );
}
