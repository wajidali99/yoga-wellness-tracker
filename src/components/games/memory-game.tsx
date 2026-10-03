"use client";

import { useEffect, useState } from "react";
import { saveGameScore } from "@/app/games/actions";

const SYMBOLS = ["🧘", "🤸", "🌿", "🌬️", "🧠", "☀️"];
type Card = { id: number; symbol: string; matched: boolean };

function shuffle<T>(items: T[]) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const newDeck = (): Card[] => shuffle([...SYMBOLS, ...SYMBOLS]).map((symbol, id) => ({ id, symbol, matched: false }));

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => setCards(newDeck()), []);

  useEffect(() => {
    if (!started || score !== null) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, score]);

  function flip(i: number) {
    if (score !== null || open.length === 2 || open.includes(i) || cards[i].matched) return;
    if (!started) setStarted(true);

    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;

    const totalMoves = moves + 1;
    setMoves(totalMoves);
    const [a, b] = next;

    if (cards[a].symbol === cards[b].symbol) {
      const updated = cards.map((c, k) => (k === a || k === b ? { ...c, matched: true } : c));
      setCards(updated);
      setOpen([]);
      if (updated.every((c) => c.matched)) {
        const points = Math.max(10, 200 - totalMoves * 5 - seconds);
        setScore(points);
        saveGameScore({ game: "memory", score: points, durationSeconds: seconds }).catch(() => {});
      }
    } else {
      setTimeout(() => setOpen([]), 800);
    }
  }

  function restart() {
    setCards(newDeck());
    setOpen([]);
    setMoves(0);
    setSeconds(0);
    setStarted(false);
    setScore(null);
  }

  return (
    <div>
      <div className="mb-4 flex justify-between text-sm text-gray-600">
        <span>Moves: <b>{moves}</b></span>
        <span>Time: <b>{seconds}s</b></span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((c, i) => {
          const visible = c.matched || open.includes(i);
          return (
            <button
              key={c.id}
              onClick={() => flip(i)}
              className={`flex aspect-square items-center justify-center rounded-2xl text-4xl transition ${
                c.matched ? "bg-brand-100" : visible ? "bg-white shadow-md" : "bg-gradient-to-br from-brand-400 to-brand-600 text-white hover:scale-105"
              }`}
            >
              {visible ? c.symbol : "?"}
            </button>
          );
        })}
      </div>

      {score !== null && (
        <div className="mt-6 rounded-2xl bg-brand-50 p-5 text-center">
          <p className="text-lg font-bold text-brand-800">All pairs found! 🎉</p>
          <p className="text-brand-700">{moves} moves in {seconds}s – <b>{score} points</b></p>
          <button onClick={restart} className="mt-3 rounded-full bg-brand-500 px-5 py-2 font-semibold text-white hover:bg-brand-600">Play again</button>
        </div>
      )}
    </div>
  );
}
