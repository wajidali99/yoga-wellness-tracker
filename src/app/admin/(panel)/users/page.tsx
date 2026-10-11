import { Search, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { card, input } from "@/components/admin-panel/styles";
import ConfirmSubmit from "@/components/admin-panel/confirm-submit";
import { changeRole, deleteUser } from "../actions";

export const dynamic = "force-dynamic";

const ROLES = ["USER", "INSTRUCTOR", "ADMIN"];
const badge: Record<string, string> = {
  ADMIN: "bg-emerald-400/15 text-emerald-300",
  INSTRUCTOR: "bg-violet-400/15 text-violet-300",
  USER: "bg-white/10 text-slate-300",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const admin = await requireAdmin();
  const { q = "", role = "" } = await searchParams;
  const roleFilter = ROLES.includes(role) ? role : "";

  const users = await prisma.user.findMany({
    where: {
      AND: [
        q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {},
        roleFilter ? { role: roleFilter } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true },
  });

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Users</h1>
      <p className="mt-1 text-slate-400">{users.length} user{users.length === 1 ? "" : "s"} found</p>

      {/* search + filter (a normal GET form, so the URL can be shared) */}
      <form className="mt-6 flex flex-wrap gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input name="q" defaultValue={q} placeholder="Search by name or email" className={`${input} w-full pl-9`} />
        </div>
        <select name="role" defaultValue={roleFilter} className={input}>
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button className="rounded-lg bg-gradient-to-r from-emerald-400 to-sky-500 px-4 py-2 text-sm font-semibold text-slate-900">Search</button>
      </form>

      <div className={`${card} mt-6 overflow-x-auto p-0`}>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Verified</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isMe = u.id === admin.id;
              return (
                <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 font-bold text-slate-900">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-slate-100">{u.name} {isMe && <span className="text-xs text-sky-300">(you)</span>}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {isMe ? (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge[u.role] ?? badge.USER}`}>{u.role}</span>
                    ) : (
                      <form action={changeRole} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={u.id} />
                        <select name="role" defaultValue={u.role} className={`${input} py-1 text-xs`}>
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button className="rounded-lg bg-sky-500/80 px-2.5 py-1 text-xs font-semibold text-slate-900 hover:bg-sky-400">Save</button>
                      </form>
                    )}
                  </td>
                  <td className="px-5 py-3">{u.emailVerified ? <span className="text-emerald-300">✓ Yes</span> : <span className="text-slate-500">No</span>}</td>
                  <td className="px-5 py-3 text-slate-400">{u.createdAt.toLocaleDateString("en-GB", { timeZone: "Asia/Karachi" })}</td>
                  <td className="px-5 py-3 text-right">
                    {!isMe && (
                      <form action={deleteUser} className="inline">
                        <input type="hidden" name="userId" value={u.id} />
                        <ConfirmSubmit
                          message={`Delete ${u.email} and all of their data? This cannot be undone.`}
                          className="rounded-lg p-2 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </ConfirmSubmit>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No users match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
