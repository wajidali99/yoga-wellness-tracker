"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, ArrowLeft, Wrench, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";

export default function AdminAvatarMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // close when clicking outside
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
    router.refresh();
  }

  const item = "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-lg"
        aria-label="Account menu"
      >
        <User size={20} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
          <div className="border-b border-white/10 px-3 pb-2 pt-1">
            <p className="truncate font-semibold text-slate-100">{name}</p>
            <p className="truncate text-xs text-slate-400">{email}</p>
          </div>
          <Link href="/dashboard" className={`${item} mt-1`}><ArrowLeft size={16} /> Back to app</Link>
          <Link href="/admin" className={item}><Wrench size={16} /> Advanced tools</Link>
          <button onClick={handleSignOut} className={`${item} text-red-300`}><LogOut size={16} /> Sign out</button>
        </div>
      )}
    </div>
  );
}
