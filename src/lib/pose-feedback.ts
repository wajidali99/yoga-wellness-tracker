// Rule-based posture feedback using joint angles (degrees)
import type { Point } from "@/lib/pose-classifier";

function angle(a: Point, b: Point, c: Point) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const mag = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y);
  if (!mag) return 180;
  const cos = (ab.x * cb.x + ab.y * cb.y) / mag;
  return (Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI;
}

export function getFeedback(slug: string, p: Point[]): string[] {
  const kneeL = angle(p[23], p[25], p[27]);
  const kneeR = angle(p[24], p[26], p[28]);
  const elbowL = angle(p[11], p[13], p[15]);
  const elbowR = angle(p[12], p[14], p[16]);
  const hipL = angle(p[11], p[23], p[25]);
  const hipR = angle(p[12], p[24], p[26]);
  const shoulderL = angle(p[13], p[11], p[23]);
  const shoulderR = angle(p[14], p[12], p[24]);
  const bodyL = angle(p[11], p[23], p[27]);
  const bodyR = angle(p[12], p[24], p[28]);

  const tips: string[] = [];

  switch (slug) {
    case "downward-dog":
      if (Math.min(kneeL, kneeR) < 150) tips.push("Try to straighten your knees.");
      if (Math.min(elbowL, elbowR) < 150) tips.push("Straighten your arms and press into your palms.");
      if (Math.min(hipL, hipR) > 110) tips.push("Lift your hips higher to make an upside-down V.");
      break;

    case "plank":
      if (Math.min(bodyL, bodyR) < 160) tips.push("Keep your body in one straight line – don't let your hips sag or lift.");
      if (Math.min(elbowL, elbowR) < 150) tips.push("Keep your arms straight, wrists under shoulders.");
      break;

    case "tree": {
      const standing = Math.max(kneeL, kneeR);
      const lifted = Math.min(kneeL, kneeR);
      if (standing < 160) tips.push("Keep your standing leg straight.");
      if (lifted > 120) tips.push("Bend one knee and place that foot on your inner leg.");
      break;
    }

    case "warrior-2": {
      const front = Math.min(kneeL, kneeR);
      const back = Math.max(kneeL, kneeR);
      if (front > 120) tips.push("Bend your front knee more, towards 90°.");
      else if (front < 75) tips.push("Your front knee is bent too much – ease up a little.");
      if (back < 150) tips.push("Straighten your back leg.");
      if (shoulderL < 70 || shoulderR < 70) tips.push("Raise your arms to shoulder height.");
      else if (shoulderL > 120 || shoulderR > 120) tips.push("Lower your arms to shoulder height.");
      if (Math.min(elbowL, elbowR) < 150) tips.push("Stretch your arms out straight.");
      break;
    }

    case "goddess":
      if (kneeL > 135 || kneeR > 135) tips.push("Bend both knees deeper into the squat.");
      if (Math.abs(kneeL - kneeR) > 25) tips.push("Bend both knees evenly.");
      break;
  }

  return tips;
}
