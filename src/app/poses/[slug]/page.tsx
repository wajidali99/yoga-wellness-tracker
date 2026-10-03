import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera, CheckCircle2, PlayCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SUPPORTED_POSES } from "@/lib/pose-classifier";
import { toYouTubeEmbed } from "@/lib/youtube";

const levelColors: Record<string, string> = {
  BEGINNER: "bg-green-50 text-green-700",
  INTERMEDIATE: "bg-amber-50 text-amber-700",
  ADVANCED: "bg-red-50 text-red-700",
};

export default async function PoseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pose = await prisma.yogaPose.findUnique({ where: { slug } });
  if (!pose) notFound();

  const aiSupported = SUPPORTED_POSES.includes(pose.slug);
  const video = toYouTubeEmbed(pose.videoUrl);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/poses" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
        <ArrowLeft size={16} /> All poses
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl bg-brand-50 shadow-sm">
          {pose.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pose.imageUrl} alt={pose.name} className="h-full max-h-[28rem] w-full object-cover" />
          ) : (
            <div className="flex h-80 items-center justify-center text-8xl">🧘</div>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-bold text-gray-900">{pose.name}</h1>
          {pose.sanskritName && <p className="mt-1 text-lg italic text-gray-500">{pose.sanskritName}</p>}
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className={`rounded-full px-3 py-1 font-medium capitalize ${levelColors[pose.difficulty]}`}>{pose.difficulty.toLowerCase()}</span>
            <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">{pose.focusArea}</span>
            {aiSupported && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 font-medium text-purple-700">
                <Camera size={14} /> AI check available
              </span>
            )}
          </div>
          <p className="mt-6 text-gray-700">{pose.description}</p>

          {aiSupported && (
            <Link
              href={`/pose-checker?pose=${pose.slug}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-600/20 hover:bg-purple-700"
            >
              <Camera size={18} /> Practice with AI feedback
            </Link>
          )}
        </div>
      </div>

      {video && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <PlayCircle size={22} className="text-brand-600" /> Video tutorial
          </h2>
          <div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-black shadow">
            <iframe
              src={video}
              title={`${pose.name} tutorial`}
              className="h-full w-full"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Benefits</h2>
          <ul className="mt-4 space-y-3">
            {pose.benefits.map((b) => (
              <li key={b} className="flex gap-3 text-gray-700">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-brand-500" /> {b}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">How to do it</h2>
          <ol className="mt-4 space-y-3">
            {pose.instructions.map((step, i) => (
              <li key={step} className="flex gap-3 text-gray-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
