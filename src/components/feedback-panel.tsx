import { MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function FeedbackPanel({ userId }: { userId: string }) {
  const items = await prisma.instructorFeedback.findMany({
    where: { studentId: userId },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { instructor: { select: { name: true } } },
  });
  if (items.length === 0) return null;

  return (
    <section className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-6">
      <h2 className="flex items-center gap-2 font-semibold text-sky-900"><MessageSquare size={18} /> Messages from your instructor</h2>
      <ul className="mt-3 space-y-3">
        {items.map((f) => (
          <li key={f.id} className="rounded-xl bg-white p-4 text-sm shadow-sm">
            <p className="text-gray-800">{f.message}</p>
            <p className="mt-1 text-xs text-gray-400">{f.instructor.name} · {f.createdAt.toLocaleDateString("en-GB", { timeZone: "Asia/Karachi" })}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
