import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight, Camera, ClipboardList, PersonStanding, Wind, Users, Star, ShieldCheck, Trophy, Gamepad2,
  Target, CheckCircle2, Timer, Sparkles,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SignOutButton from "@/components/sign-out-button";
import FeedbackPanel from "@/components/feedback-panel";
import VerifyEmailBanner from "@/components/verify-email-banner";

const FEATURES = [
  { href: "/questionnaire", title: "My Yoga Plan", desc: "Get a yoga style made for your goal.", icon: ClipboardList, tint: "bg-sky-50 text-sky-600" },
  { href: "/poses", title: "Pose Library", desc: "Steps and benefits for every pose.", icon: PersonStanding, tint: "bg-brand-50 text-brand-600" },
  { href: "/pose-checker", title: "AI Pose Checker", desc: "Real-time feedback on your form.", icon: Camera, tint: "bg-purple-50 text-purple-600" },
  { href: "/meditation", title: "Breathing & Meditation", desc: "Calm your mind in a few minutes.", icon: Wind, tint: "bg-emerald-50 text-emerald-600" },
  { href: "/group-session", title: "Group Sessions", desc: "Practice live with others.", icon: Users, tint: "bg-orange-50 text-orange-600" },
  { href: "/challenges", title: "Challenges", desc: "Daily tasks and badges.", icon: Trophy, tint: "bg-rose-50 text-rose-600" },
  { href: "/games", title: "Brain Games", desc: "Train your focus and memory.", icon: Gamepad2, tint: "bg-indigo-50 text-indigo-600" },
  { href: "/reviews", title: "Reviews", desc: "Share your experience.", icon: Star, tint: "bg-amber-50 text-amber-600" },
];

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { user } = session;
  const userId = user.id;

  const [latest, questionnaireCount, poseChecks, correctChecks, meditation] = await Promise.all([
    prisma.questionnaireResponse.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, include: { yogaType: true } }),
    prisma.questionnaireResponse.count({ where: { userId } }),
    prisma.poseCheck.count({ where: { userId } }),
    prisma.poseCheck.count({ where: { userId, correct: true } }),
    prisma.meditationSession.aggregate({ where: { userId }, _sum: { durationSeconds: true } }),
  ]);
  const meditationMinutes = Math.round((meditation._sum.durationSeconds ?? 0) / 60);

  const stats = [
    { label: "Plans created", value: questionnaireCount, icon: Target },
    { label: "Poses held correctly", value: `${correctChecks}/${poseChecks}`, icon: CheckCircle2 },
    { label: "Mindful minutes", value: meditationMinutes, icon: Timer },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-600">Welcome back</p>
          <h1 className="text-3xl font-bold text-gray-900">Hi, {user.name.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-gray-600">Ready for today&apos;s practice?</p>
        </div>
        <Link
          href="/pose-checker"
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600"
        >
          <Camera size={18} /> Start practicing
        </Link>
      </div>

      {!user.emailVerified && <VerifyEmailBanner email={user.email} />}

      {/* stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon size={24} />
              </span>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* latest plan */}
        <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-lg lg:col-span-2">
          <p className="flex items-center gap-2 text-sm text-brand-100">
            <Sparkles size={16} /> Your yoga plan
          </p>
          {latest ? (
            <>
              <h2 className="mt-2 text-2xl font-bold">{latest.yogaType.name}</h2>
              <p className="mt-2 max-w-xl text-brand-50">{latest.yogaType.primaryBenefit}</p>
              <p className="mt-1 text-sm text-brand-100">
                {latest.yogaType.frequency} · {latest.yogaType.durationMinutes} min sessions
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/result/${latest.id}`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                  View my plan <ArrowRight size={16} />
                </Link>
                <Link href="/questionnaire" className="rounded-full border border-white/40 px-4 py-2 text-sm hover:bg-white/10">
                  Retake questionnaire
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-2 text-2xl font-bold">You don&apos;t have a plan yet</h2>
              <p className="mt-2 text-brand-50">Answer a few quick questions to get a yoga style made for you.</p>
              <Link href="/questionnaire" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                Get my plan <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>

        {/* profile */}
        <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">{user.name}</p>
              <p className="truncate text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-sand-50 px-3 py-2 text-sm">
            <span className="text-gray-500">Role</span>
            <span className="font-medium text-gray-800">{user.role}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {user.role === "ADMIN" && (
              <Link href="/admin" className="inline-flex items-center gap-1.5 rounded-md bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-900">
                <ShieldCheck size={16} /> Admin Panel
              </Link>
            )}
            <Link href="/profile" className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Edit profile
            </Link>
            <Link href="/profile" className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Edit profile
            </Link>
            <SignOutButton />
          </div>
        </div>
      </div>

      <FeedbackPanel userId={userId} />

      {/* features */}
      <h2 className="mt-12 text-xl font-bold text-gray-900">Explore</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Link
              key={f.href}
              href={f.href}
              className="group flex items-start gap-4 rounded-2xl border border-sand-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${f.tint}`}>
                <Icon size={24} />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{f.title}</p>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
              <ArrowRight size={18} className="mt-1 text-gray-300 transition group-hover:translate-x-1 group-hover:text-brand-600" />
            </Link>
          );
        })}
      </div>
    </main>
  );
}
