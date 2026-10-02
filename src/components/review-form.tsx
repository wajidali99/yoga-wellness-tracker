"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitReview } from "@/app/reviews/actions";

export default function ReviewForm() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (rating === 0) {
      setError("Please choose a star rating.");
      return;
    }
    setLoading(true);
    try {
      const res = await submitReview({ rating, content });
      if (res.ok) {
        setSuccess(true);
        setRating(0);
        setContent("");
        router.refresh();
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className={`text-3xl ${n <= (hover || rating) ? "text-yellow-400" : "text-gray-300"}`}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        maxLength={1000}
        placeholder="Tell us about your experience with Yoga Wellness Tracker..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-sky-500 focus:outline-none"
      />

      {error && <p className="rounded-md bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      {success && <p className="rounded-md bg-green-50 p-2 text-sm text-green-700">Thank you for your review! 🙏</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-sky-500 px-5 py-2 text-white hover:bg-sky-600 disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
