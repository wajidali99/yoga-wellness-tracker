import Link from "next/link";
import AuthShell from "@/components/auth-shell";
import ResetPasswordForm from "@/components/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  return (
    <AuthShell title="Choose a new password">
      {token && !error ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="space-y-4">
          <p className="rounded-lg bg-red-50 p-4 text-red-700">This reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="block text-center text-brand-600 hover:underline">
            Request a new link
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
