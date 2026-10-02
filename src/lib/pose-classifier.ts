// Runs the MLP trained on Kaggle, inside the browser.
// Normalization MUST match the training notebook exactly.

export type PoseModel = {
  labels: string[];
  scaler: { mean: number[]; scale: number[] };
  layers: { W: number[][]; b: number[]; activation: "relu" | "softmax" }[];
};

export type Point = { x: number; y: number }; // in pixels

// dataset folder name -> pose slug in our database
export const LABEL_TO_SLUG: Record<string, string> = {
  downdog: "downward-dog",
  goddess: "goddess",
  plank: "plank",
  tree: "tree",
  warrior2: "warrior-2",
};
export const SUPPORTED_POSES = Object.values(LABEL_TO_SLUG);

const L_SH = 11, R_SH = 12, L_HIP = 23, R_HIP = 24;

export async function loadPoseModel(): Promise<PoseModel> {
  const res = await fetch("/models/pose_model.json");
  if (!res.ok) throw new Error("Could not load pose model");
  return res.json();
}

// center on mid-hip, divide by torso length -> 66 numbers
export function normalize(points: Point[]): number[] | null {
  const hip = { x: (points[L_HIP].x + points[R_HIP].x) / 2, y: (points[L_HIP].y + points[R_HIP].y) / 2 };
  const sh = { x: (points[L_SH].x + points[R_SH].x) / 2, y: (points[L_SH].y + points[R_SH].y) / 2 };
  const torso = Math.hypot(sh.x - hip.x, sh.y - hip.y);
  if (torso < 1e-6) return null;
  return points.flatMap((p) => [(p.x - hip.x) / torso, (p.y - hip.y) / torso]);
}

// forward pass: scaler -> dense+relu layers -> dense+softmax
export function predictProbs(model: PoseModel, points: Point[]): number[] | null {
  const features = normalize(points);
  if (!features) return null;

  let x = features.map((v, i) => (v - model.scaler.mean[i]) / model.scaler.scale[i]);

  for (const layer of model.layers) {
    const out = layer.b.slice();
    for (let i = 0; i < x.length; i++) {
      const xi = x[i];
      const row = layer.W[i];
      for (let j = 0; j < out.length; j++) out[j] += xi * row[j];
    }
    if (layer.activation === "relu") {
      x = out.map((v) => Math.max(0, v));
    } else {
      const max = Math.max(...out);
      const exps = out.map((v) => Math.exp(v - max));
      const sum = exps.reduce((a, b) => a + b, 0);
      x = exps.map((v) => v / sum);
    }
  }
  return x;
}
