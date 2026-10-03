import Link from "next/link";
import { CalendarPlus, Users, Video, Trash2, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireInstructor } from "@/lib/roles";
import { scheduleClass, startClass, cancelClass } from "./actions";

export const dynamic = "force-dynamic";

const fmt = (d: Date) => d.toLocaleString("en-GB", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" });
const input = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-brand-500 focus:outline-none";

export default async function InstructorPage() {
  const me = await requireInstructor();

  const [classes, enrollments] = await Promise.all([
    prisma.yogaClass.findMany({
      where: { instructorId: me.id },
      orderBy: { startsAt: "asc" },
      include: { _count: { select: { enrollments: true } } },
    }),
    prisma.classEnrollment.findMany({
      where: { yogaClass: { instructorId: me.id } },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);
  const students = [...new Map(enrollments.map((e) => [e.user.id, e.user])).values()];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Instructor Studio</h1>
      <p className="mt-1 text-gray-600">Schedule classes, teach live, and guide your students.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* schedule form */}
        <form action={scheduleClass} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900"><CalendarPlus size={18} className="text-brand-600" /> Schedule a class</h2>
          <label className="mt-4 block text-sm text-gray-600">Title</label>
          <input name="title" required maxLength={80} placeholder="Morning Hatha Flow" className={input} />
          <label className="mt-3 block text-sm text-gray-600">Description</label>
          <textarea name="description" rows={3} maxLength={500} placeholder="Gentle stretching for beginners..." className={input} />
          <label className="mt-3 block text-sm text-gray-600">Date & time (Pakistan time)</label>
          <input name="startsAt" type="datetime-local" required className={input} />
          <label className="mt-3 block text-sm text-gray-600">Duration (minutes)</label>
          <input name="durationMinutes" type="number" min={10} max={180} defaultValue={30} className={input} />
          <button className="mt-5 w-full rounded-full bg-brand-500 py-2.5 font-semibold text-white hover:bg-brand-600">Schedule class</button>
        </form>

        {/* my classes */}
        <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-gray-900">My classes</h2>
          {classes.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No classes yet. Schedule your first one.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {classes.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-4">
                  <div>
                    <p className="font-semibold text-gray-900">{c.title}</p>
                    <p className="text-sm text-gray-500">{fmt(c.startsAt)} · {c.durationMinutes} min · {c._count.enrollments} enrolled</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={startClass.bind(null, c.id)}>
                      <button className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
                        <Video size={16} /> {c.sessionCode ? "Open live room" : "Start class"}
                      </button>
                    </form>
                    <form action={cancelClass.bind(null, c.id)}>
                      <button className="rounded-full p-2 text-red-500 hover:bg-red-50" title="Cancel class"><Trash2 size={18} /></button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* students */}
      <section className="mt-6 rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold text-gray-900"><Users size={18} className="text-brand-600" /> My students</h2>
        {students.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">Students who enroll in your classes will appear here.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((s) => (
              <li key={s.id}>
                <Link href={`/instructor/students/${s.id}`} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:bg-brand-50">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">{s.name.charAt(0).toUpperCase()}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-gray-900">{s.name}</span>
                    <span className="block truncate text-xs text-gray-500">{s.email}</span>
                  </span>
                  <ArrowRight size={16} className="text-gray-300" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
