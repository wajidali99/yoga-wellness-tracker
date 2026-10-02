import { prisma } from "@/lib/prisma";
import PoseList from "@/components/pose-list";

export const dynamic = "force-dynamic";

export default async function PosesPage() {
  const poses = await prisma.yogaPose.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true, sanskritName: true, difficulty: true, focusArea: true },
  });

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-center text-3xl font-light text-gray-800">Yoga Poses</h1>
        <p className="mb-8 mt-2 text-center text-gray-500">
          Explore different yoga poses and improve your practice.
        </p>
        <PoseList poses={poses} />
      </div>
    </main>
  );
}
