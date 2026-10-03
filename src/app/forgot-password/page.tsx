"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import AuthShell from "@/components/auth-shell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setLoading(false);
    if (error) setError("Something went wrong. Please try again.");
    else setSent(true); // same message whether or not the email exists (privacy)
  }

  return (
    <AuthShell title="Forgot password">
      {sent ? (
        <div className="rounded-lg bg-brand-50 p-4 text-brand-800">
          If an account exists for <b>{email}</b>, we&apos;ve sent a link to reset your password. Please check your inbox (and spam folder).
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">Enter your email and we&apos;ll send you a link to choose a new password.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-brand-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-500 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-gray-500">
        Remembered it? <Link href="/sign-in" className="text-brand-600 hover:underline">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}
