import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CalendarDays, Clock, Users, Video } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enrollClass, leaveClass } from "./actions";

export const dynamic = "force-dynamic";

const fmt = (d: Date) => d.toLocaleString("en-GB", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" });

export default async function ClassesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const classes = await prisma.yogaClass.findMany({
    where: { startsAt: { gte: new Date(Date.now() - 3 * 60 * 60 * 1000) } }, // upcoming, or started in the last 3 hours
    orderBy: { startsAt: "asc" },
    include: {
      instructor: { select: { name: true } },
      _count: { select: { enrollments: true } },
      enrollments: { where: { userId: session.user.id } },
    },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
      <p className="mt-1 text-gray-600">Join instructor-led yoga classes and practice together.</p>

      {classes.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-sand-200 bg-white p-8 text-center text-gray-500">No upcoming classes right now. Check back soon! 🧘</p>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {classes.map((c) => {
            const enrolled = c.enrollments.length > 0;
            return (
              <div key={c.id} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900">{c.title}</h2>
                <p className="text-sm text-brand-700">with {c.instructor.name}</p>
                {c.description && <p className="mt-3 text-sm text-gray-600">{c.description}</p>}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><CalendarDays size={16} /> {fmt(c.startsAt)}</span>
                  <span className="flex items-center gap-1"><Clock size={16} /> {c.durationMinutes} min</span>
                  <span className="flex items-center gap-1"><Users size={16} /> {c._count.enrollments} enrolled</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {enrolled && c.sessionCode && (
                    <Link href={`/group-session/${c.sessionCode}`} className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
                      <Video size={16} /> Join live class
                    </Link>
                  )}
                  {enrolled ? (
                    <form action={leaveClass.bind(null, c.id)}>
                      <button className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">✓ Enrolled – leave</button>
                    </form>
                  ) : (
                    <form action={enrollClass.bind(null, c.id)}>
                      <button className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600">Enroll</button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
