import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { GOALS } from "@/lib/questionnaire";
import { deleteReview, setUserRole } from "./actions";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "users", label: "Users" },
  { id: "reviews", label: "Reviews" },
  { id: "logs", label: "Activity Logs" },
  { id: "insights", label: "Insights" },
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
                <form action={setUserRole}>
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="role" value={u.role === "ADMIN" ? "USER" : "ADMIN"} />
                  <button className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50">
                    {u.role === "ADMIN" ? "Remove admin" : "Make admin"}
                  </button>
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
