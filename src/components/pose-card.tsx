import Link from "next/link";
import { Camera } from "lucide-react";
import { SUPPORTED_POSES } from "@/lib/pose-classifier";

type Pose = {
  slug: string;
  name: string;
  sanskritName: string | null;
  difficulty: string;
  focusArea: string;
  imageUrl?: string | null;
};

const levelColors: Record<string, string> = {
  BEGINNER: "bg-green-50 text-green-700",
  INTERMEDIATE: "bg-amber-50 text-amber-700",
  ADVANCED: "bg-red-50 text-red-700",
};

export default function PoseCard({ pose }: { pose: Pose }) {
  const aiSupported = SUPPORTED_POSES.includes(pose.slug);

  return (
    <Link
      href={`/poses/${pose.slug}`}
      className="group block overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-44 overflow-hidden bg-brand-50">
        {pose.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pose.imageUrl} alt={pose.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">🧘</div>
        )}
        {aiSupported && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-purple-700 shadow">
            <Camera size={12} /> AI check
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900">{pose.name}</h3>
        {pose.sanskritName && <p className="text-sm italic text-gray-500">{pose.sanskritName}</p>}
        <div className="mt-3 flex gap-2 text-xs">
          <span className={`rounded-full px-2.5 py-1 font-medium capitalize ${levelColors[pose.difficulty]}`}>
            {pose.difficulty.toLowerCase()}
          </span>
          <span className="rounded-full bg-sky-50 px-2.5 py-1 font-medium text-sky-700">{pose.focusArea}</span>
        </div>
      </div>
    </Link>
  );
}