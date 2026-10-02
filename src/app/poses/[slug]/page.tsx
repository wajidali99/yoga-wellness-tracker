import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function PoseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pose = await prisma.yogaPose.findUnique({ where: { slug } });

  if (!pose) notFound();

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/poses" className="text-sm text-sky-600 hover:underline">
          ← All poses
        </Link>

        <div className="mt-4 rounded-xl bg-white p-8 shadow-md">
          <div className="flex h-48 items-center justify-center rounded-lg bg-sky-50 text-7xl">🧘</div>

          <h1 className="mt-6 text-3xl font-semibold text-gray-800">{pose.name}</h1>
          {pose.sanskritName && <p className="italic text-gray-500">{pose.sanskritName}</p>}

          <div className="mt-3 flex gap-2 text-sm">
            <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
              {pose.difficulty.toLowerCase()}
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700">{pose.focusArea}</span>
          </div>

          <p className="mt-6 text-gray-700">{pose.description}</p>

          <h2 className="mt-8 text-xl font-semibold text-gray-800">Benefits</h2>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-gray-700">
            {pose.benefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>

          <h2 className="mt-8 text-xl font-semibold text-gray-800">How to do it</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-gray-700">
            {pose.instructions.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}
