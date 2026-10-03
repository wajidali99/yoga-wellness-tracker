import { Leaf, Camera, ClipboardList, Wind } from "lucide-react";

const POINTS = [
  { icon: ClipboardList, text: "A yoga plan built around your goal" },
  { icon: Camera, text: "Real-time AI feedback on your poses" },
  { icon: Wind, text: "Breathing, meditation and live classes" },
];

export default function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-sand-50 p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-xl md:grid-cols-2">
        {/* left: brand panel */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-brand-500 to-brand-800 p-10 text-white md:flex">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="flex items-center gap-2 font-bold">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Leaf size={22} />
            </span>
            Yoga Wellness Tracker
          </div>
          <div>
            <h2 className="text-3xl font-bold leading-tight">Connect, grow and thrive on your journey to better health.</h2>
            <ul className="mt-8 space-y-4">
              {POINTS.map((p) => {
                const Icon = p.icon;
                return (
                  <li key={p.text} className="flex items-center gap-3 text-brand-50">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                      <Icon size={18} />
                    </span>
                    {p.text}
                  </li>
                );
              })}
            </ul>
          </div>
          <p className="text-sm text-brand-100">🧘 Practice anywhere, at your own pace.</p>
        </div>

        {/* right: form */}
        <div className="p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mb-8 mt-2 text-gray-500">
            {title === "Welcome Back" ? "Sign in to continue your practice." : "Create your free account in a few seconds."}
          </p>
          {children}
        </div>
      </div>
    </main>
  );
}
