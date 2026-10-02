import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import NavbarClient from "@/components/navbar-client";

export default async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session ? { name: session.user.name, isAdmin: session.user.role === "ADMIN" } : null;
  return <NavbarClient user={user} />;
}
