import { prisma } from "@/lib/prisma";
import { GOALS, getGoal, getQuestions } from "@/lib/questionnaire";
import { getQuestionnaireTexts } from "@/lib/questionnaire-texts";
import { card, input } from "@/components/admin-panel/styles";
import { saveTexts } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminQuestionnairePage() {
  const [total, userGroups, byType, types, recent, texts] = await Promise.all([
    prisma.questionnaireResponse.count(),
    prisma.questionnaireResponse.groupBy({ by: ["userId"] }),
    prisma.questionnaireResponse.groupBy({ by: ["yogaTypeId"], _count: { _all: true } }),
    prisma.yogaType.findMany({ select: { id: true, name: true } }),
    prisma.questionnaireResponse.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } }, yogaType: { select: { name: true } } },
    }),
    getQuestionnaireTexts(),
  ]);

  const allGoals = await prisma.questionnaireResponse.groupBy({ by: ["primaryGoal"], _count: { _all: true } });
  const topGoal = [...allGoals].sort((a, b) => b._count._all - a._count._all)[0];
  const typeName = (id: string | null) => types.find((t) => t.id === id)?.name ?? "—";
  const typeRows = [...byType].sort((a, b) => b._count._all - a._count._all);
  const maxType = Math.max(1, ...typeRows.map((t) => t._count._all));

  // every question once (some are shared by several goals)
  const questions = [...new Map(GOALS.flatMap((g) => getQuestions(g.id)).map((q) => [q.id, q])).values()];

  const stats = [
    { label: "Responses", value: total },
    { label: "Unique users", value: userGroups.length },
    { label: "Most common goal", value: topGoal ? getGoal(topGoal.primaryGoal)?.label ?? topGoal.primaryGoal : "—" },
    { label: "Top recommendation", value: typeRows[0] ? typeName(typeRows[0].yogaTypeId) : "—" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Questionnaire</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={card}>
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="mt-1 text-sm text-slate-300">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <h2 className="text-lg font-bold">Recommended yoga types</h2>
          {typeRows.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No responses yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {typeRows.map((t) => (
                <li key={t.yogaTypeId ?? "none"}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-200">{typeName(t.yogaTypeId)}</span>
                    <span className="text-slate-400">{t._count._all}</span>
                  </div>
                  <div className="mt-1.5 h-2.5 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500" style={{ width: `${(t._count._all / maxType) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`${card} overflow-x-auto`}>
          <h2 className="text-lg font-bold">Recent submissions</h2>
          {recent.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No responses yet.</p>
          ) : (
            <table className="mt-3 w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr><th className="py-2">User</th><th>Goal</th><th>Plan</th><th>Date</th></tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="border-t border-white/5">
                    <td className="py-2 pr-2">
                      <p className="text-slate-100">{r.user.name}</p>
                      <p className="text-xs text-slate-500">{r.user.email}</p>
                    </td>
                    <td className="pr-2 text-slate-300">{getGoal(r.primaryGoal)?.label ?? r.primaryGoal}</td>
                    <td className="pr-2 text-slate-300">{r.yogaType?.name ?? "—"}</td>
                    <td className="text-slate-400">{r.createdAt.toLocaleDateString("en-GB", { timeZone: "Asia/Karachi" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {/* wording editor (folded so the page stays tidy) */}
      <details className={`${card} mt-6`}>
        <summary className="cursor-pointer text-lg font-bold">Edit question wording</summary>
        <p className="mt-2 text-sm text-slate-400">Leave a box empty to use the default (shown in grey). Scoring rules stay the same.</p>

        <form action={saveTexts} className="mt-4 rounded-xl border border-white/10 p-4">
          <h3 className="mb-3 font-semibold">Goals</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {GOALS.map((g) => (
              <input key={g.id} name={`t:g:${g.id}`} defaultValue={texts[`g:${g.id}`] ?? ""} placeholder={g.label} className={input} />
            ))}
          </div>
          <button className="mt-3 rounded-lg bg-gradient-to-r from-emerald-400 to-sky-500 px-4 py-1.5 text-sm font-semibold text-slate-900">Save goals</button>
        </form>

        {questions.map((q) => (
          <form key={q.id} action={saveTexts} className="mt-4 rounded-xl border border-white/10 p-4">
            <p className="font-mono text-xs text-slate-500">{q.id}</p>
            <input name={`t:q:${q.id}`} defaultValue={texts[`q:${q.id}`] ?? ""} placeholder={q.text} className={`${input} mt-1 w-full font-medium`} />
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {q.options.map((o) => (
                <input key={o.value} name={`t:o:${q.id}:${o.value}`} defaultValue={texts[`o:${q.id}:${o.value}`] ?? ""} placeholder={o.label} className={input} />
              ))}
            </div>
            <button className="mt-3 rounded-lg bg-gradient-to-r from-emerald-400 to-sky-500 px-4 py-1.5 text-sm font-semibold text-slate-900">Save</button>
          </form>
        ))}
      </details>
    </div>
  );
}
