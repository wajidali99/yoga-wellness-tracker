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
        <div className="mt-6 text-center">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
