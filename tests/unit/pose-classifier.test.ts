import { describe, it, expect } from "vitest";
import { normalize, predictProbs, LABEL_TO_SLUG, SUPPORTED_POSES, type Point, type PoseModel } from "@/lib/pose-classifier";

// 33 MediaPipe points; shoulders (11,12) and hips (23,24) set, everything else at the mid-hip
function makePose(): Point[] {
  const pts: Point[] = Array.from({ length: 33 }, () => ({ x: 120, y: 200 }));
  pts[11] = { x: 100, y: 100 };
  pts[12] = { x: 140, y: 100 };
  pts[23] = { x: 100, y: 200 };
  pts[24] = { x: 140, y: 200 };
  return pts;
}

describe("Landmark normalization (same as the Kaggle notebook)", () => {
  it("produces 66 features (33 points × x,y)", () => {
    expect(normalize(makePose())).toHaveLength(66);
  });

  it("centres on the mid-hip and divides by torso length", () => {
    const f = normalize(makePose())!;
    // left hip (100,200): mid-hip is (120,200), torso length is 100 → (-0.2, 0)
    expect(f[23 * 2]).toBeCloseTo(-0.2);
    expect(f[23 * 2 + 1]).toBeCloseTo(0);
    // left shoulder (100,100) → (-0.2, -1)
    expect(f[11 * 2 + 1]).toBeCloseTo(-1);
  });

  it("gives the same features when the person is further away or elsewhere in the frame", () => {
    const near = normalize(makePose())!;
    const far = normalize(makePose().map((p) => ({ x: p.x * 0.5 + 300, y: p.y * 0.5 + 50 })))!;
    near.forEach((v, i) => expect(far[i]).toBeCloseTo(v));
  });

  it("returns null when the body cannot be measured (torso length 0)", () => {
    const flat = Array.from({ length: 33 }, () => ({ x: 5, y: 5 }));
    expect(normalize(flat)).toBeNull();
  });
});

describe("MLP forward pass", () => {
  // tiny fake model: 66 inputs → softmax over 2 classes, biased towards class 1
  const model: PoseModel = {
    labels: ["a", "b"],
    scaler: { mean: Array(66).fill(0), scale: Array(66).fill(1) },
    layers: [{ W: Array.from({ length: 66 }, () => [0, 0]), b: [0, Math.log(3)], activation: "softmax" }],
  };

  it("returns probabilities that add up to 1", () => {
    const probs = predictProbs(model, makePose())!;
    expect(probs.reduce((s, p) => s + p, 0)).toBeCloseTo(1);
  });

  it("computes softmax correctly", () => {
    const probs = predictProbs(model, makePose())!;
    expect(probs[0]).toBeCloseTo(0.25);
    expect(probs[1]).toBeCloseTo(0.75);
  });
});

describe("Supported poses", () => {
  it("maps all 5 dataset labels to pose slugs", () => {
    expect(SUPPORTED_POSES).toHaveLength(5);
    expect(LABEL_TO_SLUG.downdog).toBe("downward-dog");
    expect(LABEL_TO_SLUG.warrior2).toBe("warrior-2");
  });
});
