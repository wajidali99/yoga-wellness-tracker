import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Flame, Timer, CheckCircle2, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireInstructor } from "@/lib/roles";
import { getProgress } from "@/lib/progress";
import { getGoal } from "@/lib/questionnaire";
import { sendFeedback } from "../../actions";

export const dynamic = "force-dynamic";

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireInstructor();
  const { id } = await params;

  const student = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } });
  if (!student) notFound();

  if (me.role !== "ADMIN") {
    const linked = await prisma.classEnrollment.findFirst({ where: { userId: id, yogaClass: { instructorId: me.id } } });
    if (!linked) notFound();
  }

  const [p, feedback] = await Promise.all([
    getProgress(id),
    prisma.instructorFeedback.findMany({
      where: { studentId: id },
      orderBy: { createdAt: "desc" },
      include: { instructor: { select: { name: true } } },
    }),
  ]);
  const latestPlan = p.plans[0];

  const cards = [
    { label: "Current streak", value: `${p.currentStreak} days`, icon: Flame },
    { label: "Mindful minutes", value: p.totalMinutes, icon: Timer },
    { label: "Poses held correctly", value: `${p.correctChecks}/${p.totalChecks}`, icon: CheckCircle2 },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/instructor" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
        <ArrowLeft size={16} /> Instructor Studio
      </Link>

      <div className="mt-6 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">{student.name.charAt(0).toUpperCase()}</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-500">{student.email}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="flex items-center gap-3 rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
              <Icon size={22} className="text-brand-600" />
              <div>
                <p className="text-xl font-bold text-gray-900">{c.value}</p>
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <section className="mt-6 rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">Current plan</h2>
        <p className="mt-2 text-gray-700">
          {latestPlan ? <>{getGoal(latestPlan.goal)?.label} → <b>{latestPlan.yogaType}</b></> : "No plan yet."}
        </p>

        <h2 className="mt-6 font-semibold text-gray-900">Pose results</h2>
        {p.perPose.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No pose checks yet.</p>
        ) : (
          <table className="mt-2 w-full text-left text-sm">
            <thead className="text-gray-500"><tr><th className="py-2">Pose</th><th>Attempts</th><th>Correct</th><th>Avg. AI</th></tr></thead>
            <tbody>
              {p.perPose.map((r) => (
                <tr key={r.name} className="border-t border-gray-100 text-gray-700">
                  <td className="py-2 font-medium">{r.name}</td><td>{r.attempts}</td><td>{r.correct}</td><td>{r.avgConfidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold text-gray-900"><MessageSquare size={18} className="text-brand-600" /> Feedback</h2>
        <form action={sendFeedback} className="mt-4">
          <input type="hidden" name="studentId" value={student.id} />
          <textarea
            name="message"
            rows={3}
            required
            maxLength={1000}
            placeholder="e.g. Great progress on Tree Pose! Next, try to bend your front knee more in Warrior II."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-brand-500 focus:outline-none"
          />
          <button className="mt-3 rounded-full bg-brand-500 px-5 py-2 font-semibold text-white hover:bg-brand-600">Send feedback</button>
        </form>

        {feedback.length > 0 && (
          <ul className="mt-6 space-y-3">
            {feedback.map((f) => (
              <li key={f.id} className="rounded-xl bg-sand-50 p-4 text-sm">
                <p className="text-gray-800">{f.message}</p>
                <p className="mt-1 text-xs text-gray-400">{f.instructor.name} · {f.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Karachi" })}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
