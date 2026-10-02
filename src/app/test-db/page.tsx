import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TestDbPage() {
  const count = await prisma.yogaPose.count();

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Database connected ✅</h1>
      <p className="mt-2">Yoga poses in database: {count}</p>
    </main>
  );
}
