import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createGroupSession, joinGroupSession } from "./actions";

export const dynamic = "force-dynamic";

export default async function GroupSessionPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // active sessions started in the last 12 hours
  const live = await prisma.groupSession.findMany({
    where: { isActive: true, createdAt: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) } },
    include: { host: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-sand-50 flex flex-col items-center gap-8 p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-sand-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800">Live Yoga Group Session</h1>
        <p className="mt-1 text-sm text-gray-500">Practice together with friends or join an instructor&apos;s class.</p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <form action={createGroupSession} className="rounded-lg border border-gray-200 p-4">
            <h2 className="font-medium text-gray-800">Host a Session</h2>
            <input
              name="title"
              placeholder="e.g. Morning stretch class"
              maxLength={80}
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            />
            <button className="mt-3 w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600">Host a Session</button>
          </form>

          <form action={joinGroupSession} className="rounded-lg border border-gray-200 p-4">
            <h2 className="font-medium text-gray-800">Join a Session</h2>
            <input
              name="code"
              required
              placeholder="Enter 6-letter code"
              maxLength={6}
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono uppercase text-gray-900"
            />
            <button className="mt-3 w-full rounded-lg bg-brand-500 py-2 text-white hover:bg-brand-600">Join a Session</button>
          </form>
        </div>
      </div>

      {live.length > 0 && (
        <div className="w-full max-w-2xl rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-800">Live now</h2>
          <ul className="space-y-2">
            {live.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                <div>
                  <p className="font-medium text-gray-800">{s.title}</p>
                  <p className="text-xs text-gray-500">Host: {s.host.name} · Code: <span className="font-mono">{s.code}</span></p>
                </div>
                <Link href={`/group-session/${s.code}`} className="rounded-lg bg-brand-500 px-4 py-1.5 text-sm text-white hover:bg-brand-600">
                  Join
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link href="/dashboard" className="text-sm text-brand-700 hover:underline">← Dashboard</Link>
    </main>
  );
}
