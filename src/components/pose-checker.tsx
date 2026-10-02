"use client";

import { useEffect, useRef, useState } from "react";
import type { PoseLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { loadPoseModel, predictProbs, LABEL_TO_SLUG, type PoseModel } from "@/lib/pose-classifier";
import { getFeedback } from "@/lib/pose-feedback";
import { savePoseCheck } from "@/app/pose-checker/actions";

type PoseOption = { slug: string; name: string };
type Connection = { start: number; end: number };

const KEY_POINTS = [11, 12, 23, 24, 25, 26, 27, 28]; // shoulders, hips, knees, ankles
const MIN_CONFIDENCE = 0.7;
const SMOOTHING_FRAMES = 10;

export default function PoseChecker({ poses }: { poses: PoseOption[] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const connectionsRef = useRef<Connection[]>([]);
  const modelRef = useRef<PoseModel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const historyRef = useRef<number[][]>([]);
  const statsRef = useRef({ held: 0, best: 0, last: 0 });
  const targetRef = useRef(poses[0]?.slug ?? "");

  const [target, setTarget] = useState(poses[0]?.slug ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "running" | "error">("idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [predicted, setPredicted] = useState<{ slug: string | null; confidence: number }>({ slug: null, confidence: 0 });
  const [tips, setTips] = useState<string[]>([]);
  const [held, setHeld] = useState(0);
  const [summary, setSummary] = useState("");

  const nameOf = (slug: string | null) => poses.find((p) => p.slug === slug)?.name ?? "Unknown";
  const isCorrect = predicted.slug === target && predicted.confidence >= MIN_CONFIDENCE;

  // stop camera when leaving the page
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function draw(ctx: CanvasRenderingContext2D, points: NormalizedLandmark[], good: boolean) {
    const w = ctx.canvas.width, h = ctx.canvas.height;
    ctx.lineWidth = 4;
    ctx.strokeStyle = good ? "#22c55e" : "#f87171";
    for (const { start, end } of connectionsRef.current) {
      ctx.beginPath();
      ctx.moveTo(points[start].x * w, points[start].y * h);
      ctx.lineTo(points[end].x * w, points[end].y * h);
      ctx.stroke();
    }
    ctx.fillStyle = "#ffffff";
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    const video = videoRef.current, canvas = canvasRef.current;
    const landmarker = landmarkerRef.current, model = modelRef.current;
    if (!video || !canvas || !landmarker || !model) return;

    if (video.readyState >= 2) {
      const now = performance.now();
      const dt = statsRef.current.last ? (now - statsRef.current.last) / 1000 : 0;
      statsRef.current.last = now;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const result = landmarker.detectForVideo(video, now);
      const points = result.landmarks[0];

      if (!points) {
        setMessage("No person detected. Step into the camera view.");
        setPredicted({ slug: null, confidence: 0 });
        setTips([]);
      } else if (!KEY_POINTS.every((i) => (points[i].visibility ?? 1) > 0.5)) {
        draw(ctx, points, false);
        setMessage("Step back so your full body is visible.");
        setPredicted({ slug: null, confidence: 0 });
        setTips([]);
      } else {
        const px = points.map((p) => ({ x: p.x * video.videoWidth, y: p.y * video.videoHeight }));
        const probs = predictProbs(model, px);

        if (probs) {
          // average the last few frames so the result does not flicker
          historyRef.current.push(probs);
          if (historyRef.current.length > SMOOTHING_FRAMES) historyRef.current.shift();
          const avg = probs.map((_, i) => historyRef.current.reduce((s, h) => s + h[i], 0) / historyRef.current.length);
          const best = avg.indexOf(Math.max(...avg));
          const slug = LABEL_TO_SLUG[model.labels[best]] ?? null;
          const confidence = avg[best];
          const good = slug === targetRef.current && confidence >= MIN_CONFIDENCE;

          if (slug === targetRef.current) statsRef.current.best = Math.max(statsRef.current.best, confidence);
          if (good) {
            statsRef.current.held += dt;
            setHeld(Math.floor(statsRef.current.held));
          }

          draw(ctx, points, good);
          setPredicted({ slug, confidence });
          setTips(getFeedback(targetRef.current, px));
          setMessage("");
        }
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  async function start() {
    setStatus("loading");
    setError("");
    setSummary("");
    try {
      if (!landmarkerRef.current) {
        const vision = await import("@mediapipe/tasks-vision");
        const fileset = await vision.FilesetResolver.forVisionTasks("/mediapipe-wasm");
        const create = (delegate: "GPU" | "CPU") =>
          vision.PoseLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: "/models/pose_landmarker_full.task", delegate },
            runningMode: "VIDEO",
            numPoses: 1,
          });
        landmarkerRef.current = await create("GPU").catch(() => create("CPU"));
        connectionsRef.current = vision.PoseLandmarker.POSE_CONNECTIONS;
      }
      if (!modelRef.current) modelRef.current = await loadPoseModel();

      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      streamRef.current = stream;
      videoRef.current!.srcObject = stream;
      await videoRef.current!.play();

      historyRef.current = [];
      statsRef.current = { held: 0, best: 0, last: 0 };
      setHeld(0);
      setStatus("running");
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      setStatus("error");
      setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "Camera permission was denied. Please allow camera access in your browser and try again."
          : "Could not start the pose checker. Make sure no other app is using the camera and try again."
      );
    }
  }

  async function stop() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStatus("idle");
    const c = canvasRef.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    if (videoRef.current) videoRef.current.srcObject = null;
    setPredicted({ slug: null, confidence: 0 });
    setTips([]);
    setMessage("");

    const { held: heldSec, best } = statsRef.current;
    setSummary(
      heldSec >= 3
        ? `Well done! You held ${nameOf(target)} correctly for ${Math.floor(heldSec)} seconds. ✅`
        : `Keep practicing ${nameOf(target)} – try to hold it correctly for at least 3 seconds.`
    );
    if (best > 0 || heldSec > 0) {
      await savePoseCheck({ poseSlug: target, bestConfidence: best, heldSeconds: heldSec }).catch(() => {});
    }
  }

  return (
    <div className="w-full max-w-5xl rounded-xl bg-white p-6 shadow-lg">
      <h1 className="text-2xl font-semibold text-gray-800">Yoga Pose Checker</h1>
      <p className="text-sm text-gray-500">Choose a pose, stand back so your whole body is in view, and hold the pose.</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={target}
          disabled={status === "running" || status === "loading"}
          onChange={(e) => {
            setTarget(e.target.value);
            targetRef.current = e.target.value;
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-gray-800"
        >
          {poses.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>

        {status === "running" ? (
          <button onClick={stop} className="rounded-md bg-red-500 px-5 py-2 text-white hover:bg-red-600">Stop</button>
        ) : (
          <button
            onClick={start}
            disabled={status === "loading"}
            className="rounded-md bg-green-500 px-5 py-2 text-white hover:bg-green-600 disabled:opacity-60"
          >
            {status === "loading" ? "Loading AI model..." : "Start camera"}
          </button>
        )}
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {summary && <p className="mt-4 rounded-md bg-sky-50 p-3 text-sm text-sky-800">{summary}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* camera (mirrored like a mirror) */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-900" style={{ transform: "scaleX(-1)" }}>
          <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />
          {status !== "running" && (
            <p className="absolute inset-0 flex items-center justify-center text-gray-400" style={{ transform: "scaleX(-1)" }}>
              Camera is off
            </p>
          )}
        </div>

        {/* result panel */}
        <div className="space-y-4">
          <div className={`rounded-lg p-4 text-center ${isCorrect ? "bg-green-50" : "bg-gray-50"}`}>
            <p className="text-sm text-gray-500">Status</p>
            <p className={`text-2xl font-semibold ${isCorrect ? "text-green-600" : "text-red-500"}`}>
              {status !== "running" ? "—" : isCorrect ? "✅ Correct" : "❌ Not yet"}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">AI sees</p>
            <p className="font-medium text-gray-800">
              {predicted.slug ? `${nameOf(predicted.slug)} (${Math.round(predicted.confidence * 100)}%)` : "—"}
            </p>
            <p className="mt-3 text-sm text-gray-500">Held correctly</p>
            <p className="font-medium text-gray-800">{held} sec</p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-2 text-sm text-gray-500">Tips</p>
            {message ? (
              <p className="text-sm text-amber-700">{message}</p>
            ) : tips.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                {tips.map((t) => <li key={t}>{t}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-green-700">{status === "running" ? "Great form! Keep holding. 🌟" : "—"}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
