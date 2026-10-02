"use client";

import { useState } from "react";
import PoseCard from "@/components/pose-card";

type Pose = {
  id: string;
  slug: string;
  name: string;
  sanskritName: string | null;
  difficulty: string;
  focusArea: string;
};

export default function PoseList({ poses }: { poses: Pose[] }) {
  const [search, setSearch] = useState("");

  const filtered = poses.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.sanskritName ?? "").toLowerCase().includes(q) ||
      p.focusArea.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="mx-auto mb-8 max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for a yoga pose..."
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-sky-500 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500">No poses found for &quot;{search}&quot;.</p>
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
