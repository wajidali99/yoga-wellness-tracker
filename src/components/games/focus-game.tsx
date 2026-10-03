"use client";

import { useEffect, useState } from "react";
import { saveGameScore } from "@/app/games/actions";

const DURATION = 30;
const randomPos = () => ({ x: 8 + Math.random() * 84, y: 10 + Math.random() * 80 });

export default function FocusGame() {
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const score = Math.max(0, hits * 10 - misses * 2);

  // countdown
  useEffect(() => {
    if (status !== "running") return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  // the dot also moves by itself every 1.5s
  useEffect(() => {
    if (status !== "running") return;
    const t = setInterval(() => setPos(randomPos()), 1500);
    return () => clearInterval(t);
  }, [status]);

  // time is up
  useEffect(() => {
    if (status === "running" && timeLeft <= 0) {
      setStatus("done");
      saveGameScore({ game: "focus", score, durationSeconds: DURATION }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, status]);

  function start() {
    setHits(0);
    setMisses(0);
    setTimeLeft(DURATION);
    setPos(randomPos());
    setStatus("running");
  }

  return (
    <div>
      <div className="mb-4 flex justify-between text-sm text-gray-600">
        <span>Hits: <b>{hits}</b> · Misses: <b>{misses}</b></span>
        <span>Time left: <b>{Math.max(timeLeft, 0)}s</b></span>
      </div>

      <div
        onClick={() => status === "running" && setMisses((m) => m + 1)}
        className="relative h-80 w-full overflow-hidden rounded-2xl border border-sand-200 bg-sand-50"
      >
        {status === "running" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setHits((h) => h + 1);
              setPos(randomPos());
            }}
            className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500 shadow-lg shadow-brand-500/40 transition-all duration-200 hover:bg-brand-600"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            aria-label="dot"
          />
        )}

        {status !== "running" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            {status === "done" && (
              <p className="text-lg font-bold text-gray-900">Time&apos;s up! You scored {score} points 🎯</p>
            )}
            <button onClick={start} className="rounded-full bg-brand-500 px-6 py-2.5 font-semibold text-white hover:bg-brand-600">
              {status === "done" ? "Play again" : "Start"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
