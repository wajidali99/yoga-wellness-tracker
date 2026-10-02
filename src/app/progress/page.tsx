import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Flame, Trophy, Timer, CheckCircle2, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { getProgress } from "@/lib/progress";
import { getGoal } from "@/lib/questionnaire";
import { ActivityChart, MinutesChart, AccuracyChart } from "@/components/progress-charts";
import PrintButton from "@/components/print-button";

export const dynamic = "force-dynamic";

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm break-inside-avoid">
      <h2 className="font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-3 text-center text-sm text-gray-500">
      <p>{text}</p>
      <Link href={href} className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline print:hidden">
        {cta} <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export default async function ProgressPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const p = await getProgress(session.user.id);
  const hasActivity = p.daily.some((d) => d.poseChecks > 0 || d.sessions > 0);
  const hasMinutes = p.daily.some((d) => d.minutes > 0);

  const cards = [
    { label: "Current streak", value: `${p.currentStreak} day${p.currentStreak === 1 ? "" : "s"}`, icon: Flame, tint: "bg-orange-50 text-orange-600" },
    { label: "Best streak", value: `${p.bestStreak} day${p.bestStreak === 1 ? "" : "s"}`, icon: Trophy, tint: "bg-amber-50 text-amber-600" },
    { label: "Mindful minutes", value: p.totalMinutes, icon: Timer, tint: "bg-emerald-50 text-emerald-600" },
    { label: "Poses held correctly", value: `${p.correctChecks}/${p.totalChecks}`, icon: CheckCircle2, tint: "bg-brand-50 text-brand-600" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
          <p className="mt-1 text-gray-600">
            {session.user.name} · report generated {new Date().toLocaleDateString("en-GB", { timeZone: "Asia/Karachi" })}
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.tint}`}>
                <Icon size={24} />
              </span>
              <div>
                <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                <p className="text-sm text-gray-500">{c.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title="Daily activity" subtitle="Last 14 days">
          {hasActivity ? <ActivityChart data={p.daily} /> : <Empty text="No activity in the last 14 days." href="/pose-checker" cta="Start practicing" />}
        </Section>
        <Section title="Mindful minutes" subtitle="Breathing and meditation, last 14 days">
          {hasMinutes ? <MinutesChart data={p.daily} /> : <Empty text="No meditation yet." href="/meditation" cta="Try a breathing session" />}
        </Section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title="AI confidence trend" subtitle="How confidently the AI recognised your pose (last 20 checks)">
          {p.accuracy.length > 0 ? <AccuracyChart data={p.accuracy} /> : <Empty text="No pose checks yet." href="/pose-checker" cta="Open pose checker" />}
        </Section>

        <Section title="Pose report">
          {p.perPose.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr><th className="py-2">Pose</th><th>Attempts</th><th>Correct</th><th>Avg. AI</th><th>Best hold</th></tr>
              </thead>
              <tbody>
                {p.perPose.map((row) => (
                  <tr key={row.name} className="border-t border-gray-100 text-gray-700">
                    <td className="py-2 font-medium">{row.name}</td>
                    <td>{row.attempts}</td>
                    <td>{row.correct}</td>
                    <td>{row.avgConfidence}%</td>
                    <td>{row.bestHold}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty text="Your per-pose results will show here." href="/pose-checker" cta="Check your first pose" />
          )}
        </Section>
      </div>

      <div className="mt-6">
        <Section title="Plan history" subtitle="Your questionnaire results">
          {p.plans.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {p.plans.map((plan) => {
                const goal = getGoal(plan.goal);
                return (
                  <li key={plan.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <span className="text-gray-700">
                      {goal?.emoji} {goal?.label ?? plan.goal} → <span className="font-semibold text-gray-900">{plan.yogaType}</span>
                    </span>
                    <span className="flex items-center gap-4">
                      <span className="text-gray-500">{plan.date.toLocaleDateString("en-GB", { timeZone: "Asia/Karachi" })}</span>
                      <Link href={`/result/${plan.id}`} className="font-medium text-brand-600 hover:underline print:hidden">View</Link>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty text="You haven't created a yoga plan yet." href="/questionnaire" cta="Take the questionnaire" />
          )}
        </Section>
      </div>
    </main>
  );
}
