import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import NavbarClient from "@/components/navbar-client";

export default async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role;
  const user = session
    ? { name: session.user.name, isAdmin: role === "ADMIN", isInstructor: role === "INSTRUCTOR" || role === "ADMIN" }
    : null;
  return <NavbarClient user={user} />;
}
