import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Wind, Brain, ArrowRight, CheckCircle2, CircleStop } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTime } from "@/lib/ambient-sound";

const OPTIONS = [
  {
    href: "/meditation/breathing",
    title: "Deep Breathing",
    desc: "Follow the circle: inhale, hold, exhale. Great for quick stress relief.",
    icon: Wind,
    tint: "from-brand-400 to-brand-600",
  },
  {
    href: "/meditation/mindful",
    title: "Mindful Meditation",
    desc: "A calm timer with gentle breathing cues and a breath counter.",
    icon: Brain,
    tint: "from-sky-400 to-indigo-500",
  },
];

export default async function MeditationPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const recent = await prisma.meditationSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Breathing & Meditation</h1>
      <p className="mt-1 text-gray-600">Take a few minutes to calm your mind. Choose a session to begin.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {OPTIONS.map((o) => {
          const Icon = o.icon;
          return (
            <Link
              key={o.href}
              href={o.href}
              className="group overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`flex h-40 items-center justify-center bg-gradient-to-br ${o.tint}`}>
                <Icon size={64} className="text-white transition group-hover:scale-110" />
              </div>
              <div className="flex items-center justify-between p-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{o.title}</h2>
                  <p className="mt-1 text-sm text-gray-600">{o.desc}</p>
                </div>
                <ArrowRight className="shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-brand-600" />
              </div>
            </Link>
          );
        })}
      </div>

      <section className="mt-10 rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Your recent sessions</h2>
          <Link href="/progress" className="text-sm font-medium text-brand-600 hover:underline">Full progress →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No sessions yet. Start your first one above. 🌿</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {recent.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3 text-sm text-gray-700">
                <span className="flex items-center gap-2 font-medium">
                  {s.type === "breathing" ? <Wind size={16} className="text-brand-600" /> : <Brain size={16} className="text-indigo-500" />}
                  {s.type === "breathing" ? "Deep breathing" : "Mindful meditation"}
                </span>
                <span>{formatTime(s.durationSeconds)}</span>
                <span className="flex items-center gap-1">
                  {s.completed ? (
                    <><CheckCircle2 size={16} className="text-brand-600" /> Completed</>
                  ) : (
                    <><CircleStop size={16} className="text-gray-400" /> Stopped</>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
