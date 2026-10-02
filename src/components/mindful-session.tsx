"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AmbientSound, TRACKS, formatTime, type Track } from "@/lib/ambient-sound";
import { saveMeditationSession } from "@/app/meditation/actions";

const DURATIONS = [
  { value: 60, label: "1 min" },
  { value: 180, label: "3 min" },
  { value: 300, label: "5 min" },
  { value: 600, label: "10 min" },
];

type Status = "idle" | "running" | "paused" | "done";

export default function MindfulSession() {
  const [duration, setDuration] = useState(60);
  const [track, setTrack] = useState<Track>("none");
  const [remaining, setRemaining] = useState(60);
  const [breaths, setBreaths] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const sound = useRef<AmbientSound | null>(null);
  const saved = useRef(false);

  const elapsed = duration - Math.max(remaining, 0);
  const active = status === "running" || status === "paused";

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status === "running" && remaining <= 0) finish(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, status]);

  // press Space to count a breath
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" && status === "running") {
        e.preventDefault();
        setBreaths((b) => b + 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  useEffect(() => () => sound.current?.stop(), []);

  function start() {
    saved.current = false;
    setRemaining(duration);
    setBreaths(0);
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
      saveMeditationSession({ type: "meditation", durationSeconds: elapsed, breaths, completed }).catch(() => {});
    }
  }

  // gentle guide: 5 seconds in, 5 seconds out
  const guide = status === "running" ? (elapsed % 10 < 5 ? "Breathe in..." : "Breathe out...") : status === "paused" ? "Paused" : "";

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
      <h1 className="text-center text-2xl font-semibold text-red-500">Mindful Meditation Session</h1>

      <label className="mt-6 block text-sm text-gray-600">Select Meditation Duration:</label>
      <select
        value={duration}
        disabled={active}
        onChange={(e) => {
          setDuration(Number(e.target.value));
          setRemaining(Number(e.target.value));
          setStatus("idle");
        }}
        className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-gray-800"
      >
        {DURATIONS.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>

      <p className="mt-8 text-center text-gray-700">
        Breaths Taken: <span className="font-semibold">{breaths}</span>
      </p>
      <p className="mt-4 text-center text-5xl font-semibold text-gray-800">{formatTime(remaining)}</p>
      <p className="mt-3 h-6 text-center text-sky-600">{guide}</p>

      {status === "running" && (
        <button
          onClick={() => setBreaths((b) => b + 1)}
          className="mx-auto mt-4 block rounded-full border-2 border-sky-400 px-6 py-3 text-sky-700 hover:bg-sky-50"
        >
          I took a breath (or press Space)
        </button>
      )}

      {status === "done" && (
        <p className="mt-4 text-center text-green-600">
          Session complete! {breaths} mindful breaths in {formatTime(duration)}. 🌿
        </p>
      )}

      <div className="mt-6 flex justify-center gap-3">
        {!active ? (
          <button onClick={start} className="rounded-md bg-green-500 px-6 py-2 text-white hover:bg-green-600">
            {status === "done" ? "Start again" : "Start"}
          </button>
        ) : (
          <>
            <button onClick={togglePause} className="rounded-md bg-yellow-500 px-5 py-2 text-white hover:bg-yellow-600">
              {status === "paused" ? "Resume" : "Pause"}
            </button>
            <button onClick={() => finish(false)} className="rounded-md bg-red-500 px-5 py-2 text-white hover:bg-red-600">
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
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-800"
      >
        {TRACKS.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <Link href="/meditation" className="mt-6 inline-block rounded-md bg-sky-500 px-4 py-2 text-sm text-white hover:bg-sky-600">
        ← Back
      </Link>
    </div>
  );
}
