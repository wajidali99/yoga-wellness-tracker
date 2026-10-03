"use client";

import { useEffect, useState } from "react";
import { saveGameScore } from "@/app/games/actions";

const DURATION = 30;
const COLORS = [
  { name: "RED", text: "text-red-500", bg: "bg-red-500" },
  { name: "BLUE", text: "text-blue-500", bg: "bg-blue-500" },
  { name: "GREEN", text: "text-emerald-500", bg: "bg-emerald-500" },
  { name: "YELLOW", text: "text-amber-400", bg: "bg-amber-400" },
  { name: "PURPLE", text: "text-purple-500", bg: "bg-purple-500" },
];

const pick = () => Math.floor(Math.random() * COLORS.length);
function newRound() {
  const word = pick();
  let ink = pick();
  // most of the time, make the word and the ink different (that's the challenge)
  if (Math.random() < 0.75) while (ink === word) ink = pick();
  return { word, ink };
}

export default function StroopGame() {
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [round, setRound] = useState({ word: 0, ink: 1 });
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);

  const score = Math.max(0, correct * 10 - wrong * 5);

  useEffect(() => {
    if (status !== "running") return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (status === "running" && timeLeft <= 0) {
      setStatus("done");
      saveGameScore({ game: "stroop", score, durationSeconds: DURATION }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, status]);

  function start() {
    setCorrect(0);
    setWrong(0);
    setTimeLeft(DURATION);
    setRound(newRound());
    setStatus("running");
  }

  function answer(i: number) {
    if (status !== "running") return;
    if (i === round.ink) {
      setCorrect((c) => c + 1);
      setFlash("good");
    } else {
      setWrong((w) => w + 1);
      setFlash("bad");
    }
    setTimeout(() => setFlash(null), 200);
    setRound(newRound());
  }

  return (
    <div>
      <div className="mb-4 flex justify-between text-sm text-gray-600">
        <span>Correct: <b>{correct}</b> · Wrong: <b>{wrong}</b></span>
        <span>Time left: <b>{Math.max(timeLeft, 0)}s</b></span>
      </div>

      <div
        className={`flex h-48 items-center justify-center rounded-2xl border-2 bg-white transition ${
          flash === "good" ? "border-emerald-400" : flash === "bad" ? "border-red-400" : "border-sand-200"
        }`}
      >
        {status === "running" ? (
          <span className={`text-6xl font-extrabold tracking-wide ${COLORS[round.ink].text}`}>{COLORS[round.word].name}</span>
        ) : (
          <div className="text-center">
            {status === "done" && <p className="mb-3 text-lg font-bold text-gray-900">Time&apos;s up! You scored {score} points 🎨</p>}
            <button onClick={start} className="rounded-full bg-brand-500 px-6 py-2.5 font-semibold text-white hover:bg-brand-600">
              {status === "done" ? "Play again" : "Start"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {COLORS.map((c, i) => (
          <button
            key={c.name}
            onClick={() => answer(i)}
            disabled={status !== "running"}
            className={`rounded-xl py-3 text-xs font-bold text-white ${c.bg} disabled:opacity-40`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
