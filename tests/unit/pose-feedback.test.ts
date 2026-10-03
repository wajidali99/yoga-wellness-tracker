import { describe, it, expect } from "vitest";
import { getFeedback } from "@/lib/pose-feedback";
import type { Point } from "@/lib/pose-classifier";

// build a body from just the joints we care about (left & right side the same)
function body(j: { shoulder: Point; elbow: Point; wrist: Point; hip: Point; knee: Point; ankle: Point }, right?: Partial<typeof j>): Point[] {
  const r = { ...j, ...right };
  const p: Point[] = Array.from({ length: 33 }, () => ({ x: 0, y: 0 }));
  [p[11], p[13], p[15], p[23], p[25], p[27]] = [j.shoulder, j.elbow, j.wrist, j.hip, j.knee, j.ankle];
  [p[12], p[14], p[16], p[24], p[26], p[28]] = [r.shoulder, r.elbow, r.wrist, r.hip, r.knee, r.ankle];
  return p;
}

describe("Plank feedback", () => {
  const straightArms = { shoulder: { x: 0, y: 0 }, elbow: { x: 0, y: 50 }, wrist: { x: 0, y: 100 } };

  it("gives no tips for a straight plank", () => {
    const pose = body({ ...straightArms, hip: { x: 100, y: 0 }, knee: { x: 150, y: 0 }, ankle: { x: 200, y: 0 } });
    expect(getFeedback("plank", pose)).toEqual([]);
  });

  it("warns when the hips sag", () => {
    const pose = body({ ...straightArms, hip: { x: 100, y: 40 }, knee: { x: 150, y: 20 }, ankle: { x: 200, y: 0 } });
    expect(getFeedback("plank", pose).join(" ")).toMatch(/straight line/i);
  });
});

describe("Tree pose feedback", () => {
  const arms = { shoulder: { x: 0, y: -100 }, elbow: { x: 0, y: -150 }, wrist: { x: 0, y: -200 } };
  const straightLeg = { hip: { x: 0, y: 0 }, knee: { x: 0, y: 100 }, ankle: { x: 0, y: 200 } };

  it("gives no leg tips when one leg is straight and the other knee is bent", () => {
    const pose = body({ ...arms, ...straightLeg }, { hip: { x: 20, y: 0 }, knee: { x: 80, y: 60 }, ankle: { x: 10, y: 100 } });
    expect(getFeedback("tree", pose)).toEqual([]);
  });

  it("asks to bend a knee when both legs are straight", () => {
    const pose = body({ ...arms, ...straightLeg });
    expect(getFeedback("tree", pose).join(" ")).toMatch(/bend one knee/i);
  });
});

describe("Unsupported pose", () => {
  it("returns no tips for a pose without rules", () => {
    const pose = body({
      shoulder: { x: 0, y: 0 }, elbow: { x: 0, y: 1 }, wrist: { x: 0, y: 2 },
      hip: { x: 0, y: 3 }, knee: { x: 0, y: 4 }, ankle: { x: 0, y: 5 },
    });
    expect(getFeedback("corpse", pose)).toEqual([]);
  });
});
