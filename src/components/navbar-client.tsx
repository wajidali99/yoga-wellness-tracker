"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Leaf, Menu, X, LogOut, ChevronDown } from "lucide-react";
import { signOut } from "@/lib/auth-client";

type User = { name: string; isAdmin: boolean } | null;

const MAIN_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/progress", label: "Progress" },
  { href: "/poses", label: "Poses" },
  { href: "/questionnaire", label: "My Plan" },
  { href: "/pose-checker", label: "Pose Checker" },
  { href: "/meditation", label: "Meditation" },
];

const MORE_LINKS = [
  { href: "/challenges", label: "Challenges" },
  { href: "/games", label: "Brain Games" },
  { href: "/group-session", label: "Group Session" },
  { href: "/reviews", label: "Reviews" },
];

export default function NavbarClient({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // close the "More" menu when clicking outside it
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // close menus when the page changes
  useEffect(() => {
    setMoreOpen(false);
    setOpen(false);
  }, [pathname]);

  // the live video room uses the full screen, so hide the navbar there
  if (/^\/group-session\/[^/]+$/.test(pathname)) return null;

  const main = user ? MAIN_LINKS : [{ href: "/poses", label: "Poses" }];
  const more = user ? [...MORE_LINKS, ...(user.isAdmin ? [{ href: "/admin", label: "Admin" }] : [])] : [];
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const moreActive = more.some((l) => isActive(l.href));

  async function logout() {
    await signOut();
    router.push("/sign-in");
    router.refresh();
  }

  const linkClass = (active: boolean) =>
    `whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${
      active ? "bg-brand-50 font-semibold text-brand-700" : "text-gray-600 hover:text-brand-700"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100/70 bg-white/80 backdrop-blur print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm">
            <Leaf size={20} />
          </span>
          <span className="hidden whitespace-nowrap sm:inline">Yoga Wellness</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {main.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(isActive(l.href))}>
              {l.label}
            </Link>
          ))}

          {more.length > 0 && (
            <div ref={moreRef} className="relative">
              <button onClick={() => setMoreOpen(!moreOpen)} className={`flex items-center gap-1 ${linkClass(moreActive)}`}>
                More <ChevronDown size={14} className={`transition ${moreOpen ? "rotate-180" : ""}`} />
              </button>
              {moreOpen && (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                  {more.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`block px-4 py-2 text-sm ${isActive(l.href) ? "bg-brand-50 font-semibold text-brand-700" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/profile"
                className="hidden items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm text-gray-700 hover:bg-brand-50 md:flex"
                title="Edit profile"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="whitespace-nowrap">{user.name.split(" ")[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 lg:flex"
              >
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="whitespace-nowrap rounded-full px-4 py-1.5 text-sm text-gray-700 hover:text-brand-700">
                Sign in
              </Link>
              <Link href="/sign-up" className="whitespace-nowrap rounded-full bg-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-600">
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
          {[...main, ...more, ...(user ? [{ href: "/profile", label: "Profile" }] : [])].map((l) => (
            <Link
              key={l.href}
              href={l.href}
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
