import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import AdminNav from "@/components/admin-panel/admin-nav";
import AdminAvatarMenu from "@/components/admin-panel/admin-avatar-menu";
import { gradientText } from "@/components/admin-panel/styles";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin(); // non-admins are sent back to /dashboard

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin/dashboard">
            <p className={`text-xl font-extrabold ${gradientText}`}>Admin Panel</p>
            <p className="text-xs text-slate-400">Signed in as {admin.name}</p>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <AdminNav />
            <AdminAvatarMenu name={admin.name} email={admin.email} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
