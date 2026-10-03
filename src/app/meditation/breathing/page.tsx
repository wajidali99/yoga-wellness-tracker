import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import BreathingSession from "@/components/breathing-session";

export default async function BreathingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-sand-50 flex items-center justify-center p-6">
      <BreathingSession />
    </main>
  );
}
