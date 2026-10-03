import { prisma } from "@/lib/prisma";
import PoseList from "@/components/pose-list";

export const dynamic = "force-dynamic";

export default async function PosesPage() {
  const poses = await prisma.yogaPose.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true, sanskritName: true, difficulty: true, focusArea: true, imageUrl: true },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-center text-4xl font-bold text-gray-900">Yoga Poses</h1>
      <p className="mx-auto mb-8 mt-3 max-w-xl text-center text-gray-600">
        Explore poses with step-by-step guides. Poses marked <span className="font-semibold text-purple-700">AI check</span> can be practiced with live feedback.
      </p>
      <PoseList poses={poses} />
    </main>
  );
}
