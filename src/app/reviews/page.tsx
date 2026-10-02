import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReviewForm from "@/components/review-form";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const reviews = await prisma.review.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-200 to-sky-50 flex flex-col items-center gap-8 p-6">
      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-800">Reviews</h1>
        <p className="mt-1 text-sm text-gray-500">
          {reviews.length > 0
            ? `Average rating: ${average.toFixed(1)} / 5 from ${reviews.length} review${reviews.length > 1 ? "s" : ""}`
            : "No reviews yet – be the first!"}
        </p>
        <div className="mt-6">
          <ReviewForm />
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="w-full max-w-2xl space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl bg-white p-5 shadow">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-800">{r.user.name}</p>
                <p className="text-yellow-400">{"★".repeat(r.rating)}<span className="text-gray-300">{"★".repeat(5 - r.rating)}</span></p>
              </div>
              <p className="mt-2 text-gray-700">{r.content}</p>
              <p className="mt-2 text-xs text-gray-400">{r.createdAt.toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      <Link href="/dashboard" className="text-sm text-sky-700 hover:underline">← Dashboard</Link>
    </main>
  );
}
