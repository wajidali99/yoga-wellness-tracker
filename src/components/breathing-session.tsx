"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AmbientSound, TRACKS, formatTime, type Track } from "@/lib/ambient-sound";
import { saveMeditationSession } from "@/app/meditation/actions";

const DURATIONS = [
  { value: 20, label: "20 sec" },
  { value: 60, label: "1 min" },
  { value: 180, label: "3 min" },
  { value: 300, label: "5 min" },
];
const PHASE = 4; // seconds for inhale, hold and exhale
const CYCLE = PHASE * 3;

type Status = "idle" | "running" | "paused" | "done";

export default function BreathingSession() {
  const [duration, setDuration] = useState(60);
  const [track, setTrack] = useState<Track>("none");
  const [remaining, setRemaining] = useState(60);
  const [status, setStatus] = useState<Status>("idle");
  const sound = useRef<AmbientSound | null>(null);
  const saved = useRef(false);

  const elapsed = duration - Math.max(remaining, 0);
  const active = status === "running" || status === "paused";

  // countdown
  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  // time is up
  useEffect(() => {
    if (status === "running" && remaining <= 0) finish(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, status]);

  // stop sound when leaving the page
  useEffect(() => () => sound.current?.stop(), []);

  function start() {
    saved.current = false;
    setRemaining(duration);
    setStatus("running");
    sound.current = new AmbientSound();
    sound.current.start(track);
  }

  function togglePause() {
    if (status === "running") {
      setStatus("paused");
      sound.current?.pause();
    } else if (status === "paused") {
      setStatus("running");
      sound.current?.resume();
    }
  }

  function finish(completed: boolean) {
    sound.current?.stop();
    setStatus(completed ? "done" : "idle");
    if (!saved.current && elapsed > 0) {
      saved.current = true;
      saveMeditationSession({
        type: "breathing",
        durationSeconds: elapsed,
        breaths: Math.floor(elapsed / CYCLE),
        completed,
      }).catch(() => {});
    }
  }

  // which phase are we in?
  const pos = elapsed % CYCLE;
  const phase = !active ? (status === "done" ? "Done" : "Ready") : pos < PHASE ? "Inhale" : pos < PHASE * 2 ? "Hold" : "Exhale";
  const phaseSecondsLeft = PHASE - (pos % PHASE);
  const scale = phase === "Inhale" || phase === "Hold" ? 1.5 : 1;

  return (
    <div className="w-full max-w-md rounded-2xl border border-sand-200 bg-white p-8 shadow-sm">
      <h1 className="text-center text-2xl font-bold text-gray-900">Deep Breathing Session</h1>

      <label className="mt-6 block text-sm text-gray-600">Select Time Duration:</label>
      <select
        value={duration}
        disabled={active}
        onChange={(e) => {
          setDuration(Number(e.target.value));
          setRemaining(Number(e.target.value));
          setStatus("idle");
        }}
        className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
      >
        {DURATIONS.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>

      {/* breathing circle */}
      <div className="my-10 flex h-56 items-center justify-center">
        <div
          className="flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-brand-400 bg-brand-50"
          style={{ transform: `scale(${scale})`, transition: `transform ${PHASE}s ease-in-out` }}
        >
          <div className="text-center" style={{ transform: `scale(${1 / scale})`, transition: `transform ${PHASE}s ease-in-out` }}>
            <p className="font-semibold text-gray-800">{phase}</p>
            {active && <p className="text-xs text-gray-500">{phaseSecondsLeft}s</p>}
          </div>
        </div>
      </div>

      <p className="text-center text-3xl font-semibold text-gray-800">{formatTime(remaining)}</p>
      {status === "done" && (
        <p className="mt-2 text-center text-brand-600">Well done! You completed {Math.floor(duration / CYCLE)} breathing cycles. 🌿</p>
      )}

      <div className="mt-6 flex justify-center gap-3">
        {!active ? (
          <button onClick={start} className="rounded-lg bg-brand-500 px-6 py-2 text-white hover:bg-brand-600">
            {status === "done" ? "Start again" : "Start"}
          </button>
        ) : (
          <>
            <button onClick={togglePause} className="rounded-lg bg-yellow-500 px-5 py-2 text-white hover:bg-yellow-600">
              {status === "paused" ? "Resume" : "Pause"}
            </button>
            <button onClick={() => finish(false)} className="rounded-lg bg-red-500 px-5 py-2 text-white hover:bg-red-600">
              Stop
            </button>
          </>
        )}
      </div>

      <label className="mt-8 block text-sm text-gray-600">Select Audio Track:</label>
      <select
        value={track}
        disabled={active}
        onChange={(e) => setTrack(e.target.value as Track)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
      >
        {TRACKS.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <Link href="/meditation" className="mt-6 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600">
        ← Back
      </Link>
    </div>
  );
}
