"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Leaf, Menu, X, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";

type User = { name: string; isAdmin: boolean } | null;

const APP_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/poses", label: "Poses" },
  { href: "/questionnaire", label: "My Plan" },
  { href: "/pose-checker", label: "Pose Checker" },
  { href: "/meditation", label: "Meditation" },
  { href: "/group-session", label: "Group" },
  { href: "/reviews", label: "Reviews" },
];

export default function NavbarClient({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // the live video room uses the full screen, so hide the navbar there
  if (/^\/group-session\/[^/]+$/.test(pathname)) return null;

  const links = user
    ? [...APP_LINKS, ...(user.isAdmin ? [{ href: "/admin", label: "Admin" }] : [])]
    : [{ href: "/poses", label: "Poses" }];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  async function logout() {
    await signOut();
    setOpen(false);
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm">
            <Leaf size={20} />
          </span>
          <span className="hidden sm:inline">Yoga Wellness</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                isActive(l.href) ? "bg-brand-50 font-semibold text-brand-700" : "text-gray-600 hover:text-brand-700"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-gray-600 md:inline">Hi, {user.name.split(" ")[0]}</span>
              <button
                onClick={logout}
                className="hidden items-center gap-1.5 rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 lg:flex"
              >
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="rounded-full px-4 py-1.5 text-sm text-gray-700 hover:text-brand-700">
                Sign in
              </Link>
              <Link href="/sign-up" className="rounded-full bg-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-600">
                Join us
              </Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden" aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="space-y-1 border-t border-gray-100 bg-white px-4 py-3 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm ${isActive(l.href) ? "bg-brand-50 font-semibold text-brand-700" : "text-gray-700"}`}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <button onClick={logout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600">
              Sign out
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
