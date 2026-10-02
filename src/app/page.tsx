import Link from "next/link";
import { headers } from "next/headers";
import { ArrowRight, Camera, ClipboardList, PersonStanding, Wind, Users, Star, Sparkles, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";

const FEATURES = [
  { icon: ClipboardList, title: "Personalized yoga plans", desc: "Answer a short questionnaire and get the yoga style that fits your goal, level and time." },
  { icon: Camera, title: "AI pose checker", desc: "Your camera and our trained AI model check your pose in real time and tell you what to fix." },
  { icon: PersonStanding, title: "Pose library", desc: "Clear step-by-step instructions, benefits and difficulty for every pose." },
  { icon: Wind, title: "Breathing & meditation", desc: "Guided breathing circles, mindful timers and calming background tones." },
  { icon: Users, title: "Live group sessions", desc: "Host or join live video classes with chat – practice together from anywhere." },
  { icon: Star, title: "Community reviews", desc: "Share your experience and see how yoga is helping others." },
];

const STEPS = [
  { n: "1", title: "Tell us your goal", desc: "Flexibility, strength, back pain, relaxation and more." },
  { n: "2", title: "Get your plan", desc: "We match you with a yoga style, frequency and poses." },
  { n: "3", title: "Practice with AI feedback", desc: "Hold each pose while the AI checks your form." },
];

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const loggedIn = !!session;

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-brand-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-sand-200/70 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
              <Sparkles size={16} /> AI-powered yoga & wellness
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl">
              Shape your body, <span className="text-brand-600">calm your mind.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-gray-600">
              Yoga Wellness Tracker builds a yoga plan around your goals, checks your poses with AI in real time,
              and keeps you motivated with meditation and live group classes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={loggedIn ? "/dashboard" : "/sign-up"}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
              >
                {loggedIn ? "Go to dashboard" : "Get started free"} <ArrowRight size={18} />
              </Link>
              <Link href="/poses" className="rounded-full border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">
                Explore poses
              </Link>
            </div>
          </div>

          {/* visual */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="aspect-square rounded-[2.5rem] bg-gradient-to-br from-brand-400 to-brand-700 shadow-2xl" />
            <div className="absolute inset-0 flex items-center justify-center text-[9rem]">🧘</div>
            <div className="absolute -left-6 top-10 rounded-2xl bg-white px-4 py-3 shadow-xl">
              <p className="text-xs text-gray-500">AI pose accuracy</p>
              <p className="text-xl font-bold text-brand-700">98%</p>
            </div>
            <div className="absolute -right-4 bottom-12 rounded-2xl bg-white px-4 py-3 shadow-xl">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                <ShieldCheck size={16} className="text-brand-600" /> Runs in your browser
              </p>
              <p className="text-xs text-gray-500">Your video never leaves your device</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-gray-900">Everything for your wellness journey</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">Physical practice, mental calm and a supportive community – in one place.</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon size={24} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-xl font-bold text-white">{s.n}</span>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 to-brand-800 px-8 py-12 text-center text-white shadow-xl">
          <h2 className="text-3xl font-bold">Ready to start your practice?</h2>
          <p className="mx-auto mt-3 max-w-lg text-brand-100">It takes less than two minutes to get your personalized yoga plan.</p>
          <Link
            href={loggedIn ? "/questionnaire" : "/sign-up"}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50"
          >
            {loggedIn ? "Get my plan" : "Create free account"} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-sand-200 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Yoga Wellness Tracker · SZABIST Islamabad Final Year Project
      </footer>
    </main>
  );
}
