import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { card } from "@/components/admin-panel/styles";
import ConfirmSubmit from "@/components/admin-panel/confirm-submit";
import { removeReview } from "../actions";

export const dynamic = "force-dynamic";

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const perStar = [5, 4, 3, 2, 1].map((star) => ({ star, n: reviews.filter((r) => r.rating === star).length }));
  const maxStar = Math.max(1, ...perStar.map((p) => p.n));

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Reviews</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className={card}>
          <p className="text-5xl font-extrabold">{average.toFixed(1)}</p>
          <p className="mt-1 text-xl text-amber-300">{stars(Math.round(average))}</p>
          <p className="mt-1 text-sm text-slate-400">{count} review{count === 1 ? "" : "s"}</p>
        </section>

        <section className={`${card} lg:col-span-2`}>
          <h2 className="text-lg font-bold">Rating breakdown</h2>
          <ul className="mt-4 space-y-3">
            {perStar.map((p) => (
              <li key={p.star} className="flex items-center gap-3 text-sm">
                <span className="w-10 text-amber-300">{p.star} ★</span>
                <div className="h-2.5 flex-1 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400" style={{ width: `${(p.n / maxStar) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-slate-400">{p.n}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6 space-y-3">
        {reviews.length === 0 && <p className={`${card} text-center text-slate-400`}>No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r.id} className={`${card} flex items-start justify-between gap-4`}>
            <div>
              <p className="text-amber-300">{stars(r.rating)}</p>
              <p className="mt-2 text-slate-200">{r.content}</p>
              <p className="mt-2 text-xs text-slate-500">
                {r.user.name} · {r.user.email} · {r.createdAt.toLocaleDateString("en-GB", { timeZone: "Asia/Karachi" })}
              </p>
            </div>
            <form action={removeReview}>
              <input type="hidden" name="reviewId" value={r.id} />
              <ConfirmSubmit message="Delete this review?" className="rounded-lg p-2 text-red-300 hover:bg-red-500/10">
                <Trash2 size={16} />
              </ConfirmSubmit>
            </form>
          </div>
        ))}
      </section>
    </div>
  );
}
