import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import BreathingSession from "@/components/breathing-session";

export default async function BreathingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-200 to-sky-50 flex items-center justify-center p-6">
      <BreathingSession />
    </main>
  );
}
