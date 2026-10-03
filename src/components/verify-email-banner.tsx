"use client";

import { useState } from "react";
import { MailWarning } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function VerifyEmailBanner({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function send() {
    setStatus("sending");
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: "/dashboard" });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="flex items-center gap-2 text-sm text-amber-800">
        <MailWarning size={18} />
        {status === "sent"
          ? <>Verification link sent to <b>{email}</b>. Please check your inbox.</>
          : <>Please verify your email address (<b>{email}</b>) to keep your account secure.</>}
      </p>
      {status !== "sent" && (
        <button
          onClick={send}
          disabled={status === "sending"}
          className="rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
        >
          {status === "sending" ? "Sending..." : status === "error" ? "Try again" : "Send verification email"}
        </button>
      )}
    </div>
  );
}
