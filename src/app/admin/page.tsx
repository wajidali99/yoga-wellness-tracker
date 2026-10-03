import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { GOALS } from "@/lib/questionnaire";
import { deleteReview, setUserRole, updatePoseMedia, saveQuestionTexts, updateYogaType } from "./actions";
import { getQuestionnaireTexts } from "@/lib/questionnaire-texts";
import { getQuestions } from "@/lib/questionnaire";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "users", label: "Users" },
  { id: "reviews", label: "Reviews" },
  { id: "logs", label: "Activity Logs" },
  { id: "insights", label: "Insights" },
  { id: "poses", label: "Poses & media" },
  { id: "questionnaire", label: "Questionnaire" },
  { id: "yogatypes", label: "Yoga types" },
];

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const admin = await requireAdmin();
  const { tab = "users" } = await searchParams;

  const [userCount, reviewCount, responseCount, poseCheckCount] = await Promise.all([
    prisma.user.count(),
    prisma.review.count(),
    prisma.questionnaireResponse.count(),
    prisma.poseCheck.count(),
  ]);

  const stats = [
    { label: "Users", value: userCount },
    { label: "Reviews", value: reviewCount },
    { label: "Questionnaires", value: responseCount },
    { label: "Pose checks", value: poseCheckCount },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">Admin Panel</h1>
          <Link href="/dashboard" className="text-sm text-sky-700 hover:underline">← Dashboard</Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-white p-5 shadow">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="mt-1 text-3xl font-semibold text-gray-800">{s.value}</p>
            </div>
          ))}
        </div>

        <nav className="mt-8 flex gap-2 border-b border-gray-200">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={`/admin?tab=${t.id}`}
              className={`px-4 py-2 text-sm ${tab === t.id ? "border-b-2 border-sky-500 font-medium text-sky-700" : "text-gray-500 hover:text-gray-800"}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          {tab === "users" && <UsersTab adminId={admin.id} />}
          {tab === "reviews" && <ReviewsTab />}
          {tab === "logs" && <LogsTab />}
          {tab === "insights" && <InsightsTab />}
          {tab === "poses" && <PosesTab />}
          {tab === "questionnaire" && <QuestionnaireTab />}
          {tab === "yogatypes" && <YogaTypesTab />}
        </div>
      </div>
    </main>
  );
}

async function UsersTab({ adminId }: { adminId: string }) {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <table className="w-full text-left text-sm">
      <thead className="text-gray-500">
        <tr><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} className="border-t border-gray-100 text-gray-700">
            <td className="py-2">{u.name}</td>
            <td>{u.email}</td>
            <td>{u.role}</td>
            <td>{u.createdAt.toLocaleDateString()}</td>
            <td className="text-right">
              {u.id !== adminId && (
                <form action={setUserRole} className="flex justify-end gap-2">
                  <input type="hidden" name="userId" value={u.id} />
                  <select name="role" defaultValue={u.role} className="rounded-md border border-gray-300 px-2 py-1 text-xs"><option value="USER">USER</option><option value="INSTRUCTOR">INSTRUCTOR</option><option value="ADMIN">ADMIN</option></select>
                  <button className="rounded-md bg-brand-500 px-3 py-1 text-xs text-white hover:bg-brand-600">Save</button>
                </form>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

async function ReviewsTab() {
  const reviews = await prisma.review.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  if (reviews.length === 0) return <p className="text-gray-500">No reviews yet.</p>;
  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <li key={r.id} className="flex items-start justify-between gap-4 rounded-md border border-gray-200 p-4">
          <div>
            <p className="text-sm text-gray-500">{r.user.name} ({r.user.email}) · {r.createdAt.toLocaleString()}</p>
            <p className="text-yellow-400">{"★".repeat(r.rating)}<span className="text-gray-300">{"★".repeat(5 - r.rating)}</span></p>
            <p className="mt-1 text-gray-700">{r.content}</p>
          </div>
          <form action={deleteReview}>
            <input type="hidden" name="id" value={r.id} />
            <button className="rounded-md bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600">Delete</button>
          </form>
        </li>
      ))}
    </ul>
  );
}

async function LogsTab() {
  const logs = await prisma.activityLog.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  if (logs.length === 0) return <p className="text-gray-500">No activity yet.</p>;
  return (
    <table className="w-full text-left text-sm">
      <thead className="text-gray-500">
        <tr><th className="py-2">Time</th><th>User</th><th>Action</th><th>Details</th></tr>
      </thead>
      <tbody>
        {logs.map((l) => (
          <tr key={l.id} className="border-t border-gray-100 text-gray-700">
            <td className="py-2 whitespace-nowrap">{l.createdAt.toLocaleString()}</td>
            <td>{l.user?.email ?? "deleted user"}</td>
            <td><span className="rounded bg-sky-50 px-2 py-0.5 font-mono text-xs text-sky-700">{l.action}</span></td>
            <td className="text-gray-500">{l.details ?? ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

async function InsightsTab() {
  const [goals, types, yogaTypes, checks] = await Promise.all([
    prisma.questionnaireResponse.groupBy({ by: ["primaryGoal"], _count: { _all: true } }),
    prisma.questionnaireResponse.groupBy({ by: ["yogaTypeId"], _count: { _all: true } }),
    prisma.yogaType.findMany({ select: { id: true, name: true } }),
    prisma.poseCheck.groupBy({
      by: ["poseSlug"],
      _count: { _all: true },
      _avg: { bestConfidence: true, heldSeconds: true },
    }),
  ]);

  const goalLabel = (id: string) => GOALS.find((g) => g.id === id)?.label ?? id;
  const typeName = (id: string) => yogaTypes.find((t) => t.id === id)?.name ?? id;

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div>
        <h2 className="mb-3 font-semibold text-gray-800">Most chosen goals</h2>
        <ul className="space-y-1 text-sm text-gray-700">
          {goals.sort((a, b) => b._count._all - a._count._all).map((g) => (
            <li key={g.primaryGoal} className="flex justify-between"><span>{goalLabel(g.primaryGoal)}</span><span>{g._count._all}</span></li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="mb-3 font-semibold text-gray-800">Recommended yoga types</h2>
        <ul className="space-y-1 text-sm text-gray-700">
          {types.sort((a, b) => b._count._all - a._count._all).map((t) => (
            <li key={t.yogaTypeId} className="flex justify-between"><span>{typeName(t.yogaTypeId)}</span><span>{t._count._all}</span></li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="mb-3 font-semibold text-gray-800">AI pose checks</h2>
        <ul className="space-y-1 text-sm text-gray-700">
          {checks.map((c) => (
            <li key={c.poseSlug} className="flex justify-between">
              <span>{c.poseSlug}</span>
              <span>{c._count._all} checks · avg {Math.round((c._avg.bestConfidence ?? 0) * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

async function PosesTab() {
  const poses = await prisma.yogaPose.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Image: a file in <code>/public/poses</code> (e.g. <code>/poses/tree.jpg</code>) or an https link. Video: any YouTube link.
      </p>
      {poses.map((p) => (
        <form key={p.id} action={updatePoseMedia} className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3">
          <input type="hidden" name="id" value={p.id} />
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl">🧘</div>
            )}
          </div>
          <span className="w-36 font-medium text-gray-800">{p.name}</span>
          <input name="imageUrl" defaultValue={p.imageUrl ?? ""} placeholder="/poses/name.jpg" className="min-w-40 flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
          <input name="videoUrl" defaultValue={p.videoUrl ?? ""} placeholder="https://www.youtube.com/watch?v=..." className="min-w-52 flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
          <button className="rounded-md bg-brand-500 px-3 py-1.5 text-sm text-white hover:bg-brand-600">Save</button>
        </form>
      ))}
    </div>
  );
}

const field = "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900";

async function QuestionnaireTab() {
  const texts = await getQuestionnaireTexts();
  // every question once (some, like "severity", are shared by several goals)
  const questions = [...new Map(GOALS.flatMap((g) => getQuestions(g.id)).map((q) => [q.id, q])).values()];

  return (
    <div className="space-y-6">
      <p className="rounded-lg bg-sky-50 p-3 text-sm text-sky-800">
        Change the wording users see. Leave a box empty to use the default (shown in grey). Scoring rules stay the same, so
        recommendations remain valid.
      </p>

      <form action={saveQuestionTexts} className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-3 font-semibold text-gray-800">Goals</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GOALS.map((g) => (
            <input key={g.id} name={`t:g:${g.id}`} defaultValue={texts[`g:${g.id}`] ?? ""} placeholder={g.label} className={field} />
          ))}
        </div>
        <button className="mt-3 rounded-md bg-brand-500 px-4 py-1.5 text-sm text-white hover:bg-brand-600">Save goals</button>
      </form>

      {questions.map((q) => (
        <form key={q.id} action={saveQuestionTexts} className="rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-mono text-gray-400">{q.id}</p>
          <input name={`t:q:${q.id}`} defaultValue={texts[`q:${q.id}`] ?? ""} placeholder={q.text} className={`${field} mt-1 font-medium`} />
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {q.options.map((o) => (
              <input
                key={o.value}
                name={`t:o:${q.id}:${o.value}`}
                defaultValue={texts[`o:${q.id}:${o.value}`] ?? ""}
                placeholder={o.label}
                className={field}
              />
            ))}
          </div>
          <button className="mt-3 rounded-md bg-brand-500 px-4 py-1.5 text-sm text-white hover:bg-brand-600">Save</button>
        </form>
      ))}
    </div>
  );
}

async function YogaTypesTab() {
  const types = await prisma.yogaType.findMany({ orderBy: { name: "asc" } });
  const poses = await prisma.yogaPose.findMany({ select: { slug: true }, orderBy: { slug: "asc" } });

  return (
    <div className="space-y-6">
      <p className="rounded-lg bg-sky-50 p-3 text-sm text-sky-800">
        Available pose slugs: <span className="font-mono">{poses.map((p) => p.slug).join(", ")}</span>
      </p>
      {types.map((t) => (
        <form key={t.id} action={updateYogaType} className="rounded-lg border border-gray-200 p-4">
          <input type="hidden" name="id" value={t.id} />
          <h3 className="font-semibold text-gray-800">{t.name}</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-gray-500 sm:col-span-2">Description
              <textarea name="description" defaultValue={t.description} rows={2} className={field} />
            </label>
            <label className="text-xs text-gray-500">Primary benefit
              <input name="primaryBenefit" defaultValue={t.primaryBenefit} className={field} />
            </label>
            <label className="text-xs text-gray-500">How often
              <input name="frequency" defaultValue={t.frequency} className={field} />
            </label>
            <label className="text-xs text-gray-500">Focus area
              <input name="focusArea" defaultValue={t.focusArea} className={field} />
            </label>
            <label className="text-xs text-gray-500">Session length (minutes)
              <input name="durationMinutes" type="number" min={5} max={120} defaultValue={t.durationMinutes} className={field} />
            </label>
            <label className="text-xs text-gray-500 sm:col-span-2">Poses (comma separated slugs, in order)
              <input name="poseSlugs" defaultValue={t.poseSlugs.join(", ")} className={`${field} font-mono`} />
            </label>
          </div>
          <button className="mt-3 rounded-md bg-brand-500 px-4 py-1.5 text-sm text-white hover:bg-brand-600">Save</button>
        </form>
      ))}
    </div>
  );
}
