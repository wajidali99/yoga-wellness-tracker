import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignOutButton from "@/components/sign-out-button";

const FEATURES = [
  { href: "/questionnaire", label: "Take the questionnaire", emoji: "📝", color: "bg-sky-500 hover:bg-sky-600" },
  { href: "/poses", label: "Yoga poses", emoji: "🧘", color: "bg-teal-500 hover:bg-teal-600" },
  { href: "/pose-checker", label: "Pose Checker", emoji: "📷", color: "bg-purple-500 hover:bg-purple-600" },
  { href: "/meditation", label: "Meditation", emoji: "🌬️", color: "bg-green-500 hover:bg-green-600" },
  { href: "/group-session", label: "Group Session", emoji: "👥", color: "bg-orange-500 hover:bg-orange-600" },
  { href: "/reviews", label: "Reviews", emoji: "⭐", color: "bg-yellow-500 hover:bg-yellow-600" },
];

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { user } = session;

  const rows = [
    { label: "ID", value: user.id },
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Role", value: user.role },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-200 to-sky-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="rounded-xl bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-center text-xl font-semibold text-gray-800">User Details</h1>
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3">
                <span className="text-gray-600">{row.label}</span>
                <span className="text-sm text-gray-900">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <Link key={f.href} href={f.href} className={`rounded-xl p-5 text-center text-white shadow ${f.color}`}>
              <div className="text-3xl">{f.emoji}</div>
              <div className="mt-2 text-sm font-medium">{f.label}</div>
            </Link>
          ))}
          {user.role === "ADMIN" && (
            <Link href="/admin" className="rounded-xl bg-gray-800 p-5 text-center text-white shadow hover:bg-gray-900">
              <div className="text-3xl">🛠️</div>
              <div className="mt-2 text-sm font-medium">Admin Panel</div>
            </Link>
          )}
        </div>

        <div className="text-center">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
