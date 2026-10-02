import Link from "next/link";

export default function AuthShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-200 to-sky-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-10 items-center">
        <div className="text-center md:text-left">
          <div className="text-6xl mb-4">🧘</div>
          <h1 className="text-4xl font-bold text-sky-700">Yoga Wellness Tracker</h1>
          <p className="mt-3 text-orange-500">
            helps you connect, grow, and thrive in your journey to better health!
          </p>
          <Link
            href="/"
            className="inline-block mt-6 rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
          >
            ← Back
          </Link>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg">
          <h2 className="text-center text-gray-500 mb-6">{title}</h2>
          {children}
        </div>
      </div>
    </main>
  );
}
