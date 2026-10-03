import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Lets INSTRUCTOR and ADMIN users through. Everyone else goes back to the dashboard.
export async function requireInstructor() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") redirect("/dashboard");
  return session.user;
}
