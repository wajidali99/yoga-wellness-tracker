import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { auth } from "@/lib/auth";
import { GAMES } from "@/lib/games";
import MemoryGame from "@/components/games/memory-game";
import FocusGame from "@/components/games/focus-game";
import StroopGame from "@/components/games/stroop-game";

const COMPONENTS: Record<string, React.ComponentType> = {
  memory: MemoryGame,
  focus: FocusGame,
  stroop: StroopGame,
};

export default async function GamePage({ params }: { params: Promise<{ game: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { game } = await params;
  const info = GAMES.find((g) => g.slug === game);
  const Game = COMPONENTS[game];
  if (!info || !Game) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/games" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
        <ArrowLeft size={16} /> All games
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-gray-900">{info.emoji} {info.title}</h1>
      <p className="mt-3 flex gap-2 rounded-xl bg-sky-50 p-3 text-sm text-sky-800">
        <Info size={18} className="shrink-0" /> {info.how}
      </p>

      <div className="mt-6 rounded-3xl border border-sand-200 bg-white p-6 shadow-sm">
        <Game />
      </div>
    </main>
  );
}
