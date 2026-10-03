import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGoal } from "@/lib/questionnaire";
import PoseCard from "@/components/pose-card";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { id } = await params;
  const response = await prisma.questionnaireResponse.findFirst({
    where: { id, userId: session.user.id },
    include: { yogaType: true },
  });
  if (!response) notFound();

  const { yogaType } = response;
  const answers = response.answers as Record<string, string>;
  const goal = getGoal(response.primaryGoal);

  const poses = await prisma.yogaPose.findMany({ where: { slug: { in: yogaType.poseSlugs } } });
  const orderedPoses = yogaType.poseSlugs
    .map((slug) => poses.find((p) => p.slug === slug))
    .filter((p) => p !== undefined);

  const details = [
    { label: "Primary benefit", value: yogaType.primaryBenefit },
    { label: "How often", value: yogaType.frequency },
    { label: "Focus area", value: yogaType.focusArea },
    { label: "Session length", value: `${yogaType.durationMinutes} minutes` },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-sand-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-sand-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-gray-500">
            Your goal: {goal?.emoji} {goal?.label}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-800">
            We recommend: <span className="text-brand-600">{yogaType.name}</span>
          </h1>
          <p className="mt-4 text-gray-700">{yogaType.description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {details.map((d) => (
              <div key={d.label} className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">{d.label}</p>
                <p className="mt-1 font-medium text-gray-800">{d.value}</p>
              </div>
            ))}
          </div>

          {answers.severity === "severe" && (
            <p className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              ⚠️ You mentioned severe pain or a recent injury. Please check with a doctor or physiotherapist
              before starting, and stop any pose that causes pain.
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/questionnaire?from=${response.id}`}
              className="rounded-lg border border-brand-500 px-5 py-2 text-brand-600 hover:bg-brand-50"
            >
              ← Change my answers
            </Link>
            <Link href="/dashboard" className="rounded-lg bg-brand-500 px-5 py-2 text-white hover:bg-brand-600">
              Go to dashboard
            </Link>
          </div>
        </div>

        <h2 className="mt-10 mb-4 text-2xl font-semibold text-gray-800">Poses for your routine</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {orderedPoses.map((pose) => (
            <PoseCard key={pose.id} pose={pose} />
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-gray-500">
          This recommendation is general wellness guidance, not medical advice.
        </p>
      </div>
    </main>
  );
}
