"use client";

import { useState } from "react";
import { Search, Camera } from "lucide-react";
import PoseCard from "@/components/pose-card";
import { SUPPORTED_POSES } from "@/lib/pose-classifier";

type Pose = {
  id: string;
  slug: string;
  name: string;
  sanskritName: string | null;
  difficulty: string;
  focusArea: string;
  imageUrl: string | null;
};

export default function PoseList({ poses }: { poses: Pose[] }) {
  const [search, setSearch] = useState("");
  const [aiOnly, setAiOnly] = useState(false);

  const q = search.toLowerCase();
  const filtered = poses.filter((p) => {
    const matches =
      p.name.toLowerCase().includes(q) ||
      (p.sanskritName ?? "").toLowerCase().includes(q) ||
      p.focusArea.toLowerCase().includes(q);
    return matches && (!aiOnly || SUPPORTED_POSES.includes(p.slug));
  });

  return (
    <>
      <div className="mx-auto mb-10 flex max-w-xl flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or body area..."
            className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <button
          onClick={() => setAiOnly(!aiOnly)}
          className={aiOnly
            ? "inline-flex items-center justify-center gap-2 rounded-full border border-purple-500 bg-purple-50 px-4 py-2.5 text-sm font-medium text-purple-700"
            : "inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"}
        >
          <Camera size={16} /> AI check only
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500">No poses found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pose) => (
            <PoseCard key={pose.id} pose={pose} />
          ))}
        </div>
      )}
    </>
  );
}
