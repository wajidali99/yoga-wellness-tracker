import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ProfileForms from "@/components/profile-forms";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { user } = session;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500">
            {user.email} · <span className="font-medium text-gray-700">{user.role}</span> · joined {user.createdAt.toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <ProfileForms name={user.name} email={user.email} />
      </div>
    </main>
  );
}
