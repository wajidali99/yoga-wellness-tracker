"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.1v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}

export default function SocialButtons() {
  const [loading, setLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState("");

  async function go(provider: "google" | "github") {
    setError("");
    setLoading(provider);
    const { error } = await signIn.social({ provider, callbackURL: "/dashboard" });
    // on success the browser leaves this page, so we only get here on error
    if (error) {
      setError(`${provider === "google" ? "Google" : "GitHub"} sign-in is not available right now.`);
      setLoading(null);
    }
  }

  const btn =
    "flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60";

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" /> or continue with <span className="h-px flex-1 bg-gray-200" />
      </div>
      <div className="mt-4 grid grid-flow-col auto-cols-fr gap-3">
        {process.env.NEXT_PUBLIC_GOOGLE_LOGIN === "on" && (
          <button type="button" onClick={() => go("google")} disabled={loading !== null} className={btn}>
          <GoogleIcon /> {loading === "google" ? "Opening..." : "Google"}
        </button>
        )}
        <button type="button" onClick={() => go("github")} disabled={loading !== null} className={btn}>
          <GitHubIcon /> {loading === "github" ? "Opening..." : "GitHub"}
        </button>
      </div>
      {error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
