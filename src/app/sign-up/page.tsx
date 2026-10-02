"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import AuthShell from "@/components/auth-shell";

// at least 8 chars, with a letter, a number and a special character
const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!strongPassword.test(password)) {
      setError("Password must be at least 8 characters and include a letter, a number and a special character.");
      return;
    }

    setLoading(true);
    const { error } = await signUp.email({ name, email, password });
    setLoading(false);

    if (error) {
      setError(error.message ?? "Could not create account. Please try again.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <AuthShell title="Create an Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-sky-500 focus:outline-none"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-sky-500 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 pr-16 text-gray-900 focus:border-sky-500 focus:outline-none"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && <p className="rounded-md bg-red-50 p-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-sky-500 py-2 font-medium text-white hover:bg-sky-600 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create an account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-sky-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
