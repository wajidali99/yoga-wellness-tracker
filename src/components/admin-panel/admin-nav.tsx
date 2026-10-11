"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, ClipboardList, Star } from "lucide-react";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/questionnaire", label: "Questionnaire", icon: ClipboardList },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {LINKS.map((l) => {
        const active = pathname.startsWith(l.href);
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              active
                ? "border-transparent bg-gradient-to-r from-emerald-400 to-sky-500 text-slate-900 shadow-lg shadow-sky-500/20"
                : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            <Icon size={16} /> {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
