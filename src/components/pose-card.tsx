import Link from "next/link";

type Pose = {
  slug: string;
  name: string;
  sanskritName: string | null;
  difficulty: string;
  focusArea: string;
};

const levelColors: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700",
  INTERMEDIATE: "bg-yellow-100 text-yellow-700",
  ADVANCED: "bg-red-100 text-red-700",
};

export default function PoseCard({ pose }: { pose: Pose }) {
  return (
    <Link
      href={`/poses/${pose.slug}`}
      className="block rounded-xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex h-32 items-center justify-center rounded-lg bg-sky-50 text-5xl">🧘</div>
      <h3 className="mt-4 text-lg font-semibold text-gray-800">{pose.name}</h3>
      {pose.sanskritName && <p className="text-sm italic text-gray-500">{pose.sanskritName}</p>}
      <div className="mt-3 flex gap-2 text-xs">
        <span className={`rounded-full px-2 py-1 ${levelColors[pose.difficulty]}`}>
          {pose.difficulty.toLowerCase()}
        </span>
        <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-700">{pose.focusArea}</span>
      </div>
    </Link>
  );
}
