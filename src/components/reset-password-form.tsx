"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const inputClass = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-brand-500 focus:outline-none";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!strongPassword.test(password)) {
      setError("Password must be at least 8 characters and include a letter, a number and a special character.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    setLoading(false);
    if (error) setError("This reset link is invalid or has expired. Please request a new one.");
    else setDone(true);
  }

  if (done) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-brand-50 p-4 text-brand-800">Your password has been changed. 🎉</p>
        <Link href="/sign-in" className="block w-full rounded-lg bg-brand-500 py-2 text-center font-medium text-white hover:bg-brand-600">
          Sign in with your new password
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">New password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
        <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
      </div>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-lg bg-brand-500 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-60">
        {loading ? "Saving..." : "Set new password"}
      </button>
    </form>
  );
}
