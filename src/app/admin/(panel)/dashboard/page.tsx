import { Users, ShieldCheck, ClipboardCheck, ListPlus, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { GOALS } from "@/lib/questionnaire";
import { card } from "@/components/admin-panel/styles";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalUsers, admins, questionnaires, routinesCreated, routinesCompleted, responses] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.questionnaireResponse.count(),
    prisma.challengeParticipant.count(),
    prisma.challengeParticipant.count({ where: { completedAt: { not: null } } }),
    prisma.questionnaireResponse.findMany({
      orderBy: { createdAt: "desc" },
      select: { userId: true, primaryGoal: true },
    }),
  ]);

  // each user's latest primary goal
  const latestGoal = new Map<string, string>();
  for (const r of responses) if (!latestGoal.has(r.userId)) latestGoal.set(r.userId, r.primaryGoal);
  const goals = [...latestGoal.values()];

  const goalCounts = GOALS.map((g) => ({ id: g.id, label: g.label, count: goals.filter((v) => v === g.id).length }))
    .filter((g) => g.count > 0)
    .sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...goalCounts.map((g) => g.count));

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users },
    { label: "Admins", value: admins, icon: ShieldCheck },
    { label: "Questionnaires Completed", value: questionnaires, icon: ClipboardCheck },
    { label: "Routines Created", value: routinesCreated, icon: ListPlus, hint: "Challenges joined" },
    { label: "Routines Completed", value: routinesCompleted, icon: Trophy, hint: "Challenges finished" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={card}>
              <div className="flex items-start justify-between">
                <p className="text-3xl font-extrabold">{s.value}</p>
                <Icon size={20} className="text-sky-300/70" />
              </div>
              <p className="mt-1 text-sm text-slate-300">{s.label}</p>
              {s.hint && <p className="text-xs text-slate-500">{s.hint}</p>}
            </div>
          );
        })}
      </div>

      <section className={`${card} mt-6`}>
        <h2 className="text-lg font-bold">Users by Primary Goal</h2>
        {goalCounts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No questionnaires completed yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {goalCounts.map((g) => (
              <li key={g.id}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-200">{g.label}</span>
                  <span className="text-slate-400">{g.count}</span>
                </div>
                <div className="mt-1.5 h-2.5 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500"
                    style={{ width: `${(g.count / max) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
