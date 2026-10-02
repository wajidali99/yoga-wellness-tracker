import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignOutButton from "@/components/sign-out-button";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // Not logged in? Send to sign-in page.
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
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-xl font-semibold text-gray-800">User Details</h1>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3">
              <span className="text-gray-600">{row.label}</span>
              <span className="text-sm text-gray-900">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <a href="/questionnaire" className="rounded-md bg-sky-500 px-4 py-2 text-sm text-white hover:bg-sky-600">
            Take the questionnaire
          </a>
          <a href="/meditation" className="rounded-md bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600">
            Meditation
          </a>
          <a href="/pose-checker" className="rounded-md bg-purple-500 px-4 py-2 text-sm text-white hover:bg-purple-600">
            Pose Checker
          </a>
          <a href="/group-session" className="rounded-md bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600">
            Group Session
          </a>
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
