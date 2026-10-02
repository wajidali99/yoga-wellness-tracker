"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock } from "lucide-react";
import { updateName, updateEmail, changePassword } from "@/app/profile/actions";

type Feedback = { type: "success" | "error"; text: string } | null;

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Message({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <p className={`mt-3 rounded-md p-2 text-sm ${feedback.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
      {feedback.text}
    </p>
  );
}

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const buttonClass =
  "mt-4 rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60";

export default function ProfileForms({ name, email }: { name: string; email: string }) {
  const router = useRouter();

  const [newName, setNewName] = useState(name);
  const [nameFb, setNameFb] = useState<Feedback>(null);
  const [nameBusy, setNameBusy] = useState(false);

  const [newEmail, setNewEmail] = useState(email);
  const [emailFb, setEmailFb] = useState<Feedback>(null);
  const [emailBusy, setEmailBusy] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwFb, setPwFb] = useState<Feedback>(null);
  const [pwBusy, setPwBusy] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setNameBusy(true);
    const res = await updateName(newName).catch(() => ({ ok: false as const, error: "Network error. Please try again." }));
    setNameBusy(false);
    setNameFb(res.ok ? { type: "success", text: res.message } : { type: "error", text: res.error });
    if (res.ok) router.refresh();
  }

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailBusy(true);
    const res = await updateEmail(newEmail).catch(() => ({ ok: false as const, error: "Network error. Please try again." }));
    setEmailBusy(false);
    setEmailFb(res.ok ? { type: "success", text: res.message } : { type: "error", text: res.error });
    if (res.ok) router.refresh();
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setPwFb({ type: "error", text: "New passwords do not match." });
      return;
    }
    setPwBusy(true);
    const res = await changePassword(currentPw, newPw).catch(() => ({ ok: false as const, error: "Network error. Please try again." }));
    setPwBusy(false);
    setPwFb(res.ok ? { type: "success", text: res.message } : { type: "error", text: res.error });
    if (res.ok) {
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card icon={<User size={18} />} title="Your name">
        <form onSubmit={saveName}>
          <label className="text-sm text-gray-600">Name</label>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} className={inputClass} required />
          <button disabled={nameBusy || newName.trim() === name} className={buttonClass}>
            {nameBusy ? "Saving..." : "Save name"}
          </button>
          <Message feedback={nameFb} />
        </form>
      </Card>

      <Card icon={<Mail size={18} />} title="Email address">
        <form onSubmit={saveEmail} noValidate>
          <label className="text-sm text-gray-600">Email</label>
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={inputClass} required />
          <button disabled={emailBusy || newEmail.trim().toLowerCase() === email} className={buttonClass}>
            {emailBusy ? "Saving..." : "Save email"}
          </button>
          <Message feedback={emailFb} />
        </form>
      </Card>

      <div className="lg:col-span-2">
        <Card icon={<Lock size={18} />} title="Change password">
          <form onSubmit={savePassword} className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm text-gray-600">Current password</label>
              <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className="text-sm text-gray-600">New password</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className="text-sm text-gray-600">Confirm new password</label>
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className={inputClass} required />
            </div>
            <div className="sm:col-span-3">
              <p className="text-xs text-gray-500">At least 8 characters, with a letter, a number and a special character.</p>
              <button disabled={pwBusy} className={buttonClass}>
                {pwBusy ? "Changing..." : "Change password"}
              </button>
              <Message feedback={pwFb} />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
