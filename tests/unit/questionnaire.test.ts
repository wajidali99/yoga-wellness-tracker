import { describe, it, expect } from "vitest";
import { GOALS, YOGA_TYPES, getGoal, getQuestions, validateAnswers, recommend } from "@/lib/questionnaire";

describe("Questionnaire structure (UT-11, UT-15)", () => {
  it("has 7 primary goals", () => {
    expect(GOALS).toHaveLength(7);
  });

  it("shows goal-specific questions first, then the 3 common questions", () => {
    const ids = getQuestions("back-pain").map((q) => q.id);
    expect(ids).toEqual(["pain-area", "severity", "experience", "time", "intensity"]);
  });

  it("shows different secondary questions for different goals", () => {
    expect(getQuestions("strength")[0].id).toBe("strength-area");
    expect(getQuestions("mindfulness")[0].id).toBe("mind-goal");
  });

  it("returns no questions for an unknown goal", () => {
    expect(getGoal("flying")).toBeUndefined();
    expect(getQuestions("flying")).toEqual([]);
  });
});

describe("Answer validation (UT-16, UT-17)", () => {
  const complete = { "pain-area": "lower", severity: "mild", experience: "beginner", time: "short", intensity: "gentle" };

  it("accepts a complete set of valid answers", () => {
    expect(validateAnswers("back-pain", complete)).toBe(true);
  });

  it("rejects submission when an answer is missing", () => {
    const { severity, ...missing } = complete;
    void severity;
    expect(validateAnswers("back-pain", missing)).toBe(false);
  });

  it("rejects an answer that is not one of the options", () => {
    expect(validateAnswers("back-pain", { ...complete, time: "all-day" })).toBe(false);
  });

  it("rejects answers for an unknown goal", () => {
    expect(validateAnswers("flying", complete)).toBe(false);
  });
});

describe("Recommendation engine (UT-21 to UT-25)", () => {
  it("recommends Therapeutic Yoga for mild lower back pain", () => {
    const answers = { "pain-area": "lower", severity: "mild", experience: "beginner", time: "short", intensity: "gentle" };
    expect(recommend("back-pain", answers)).toBe("therapeutic");
  });

  it("shifts to Restorative Yoga when back pain is severe (safety)", () => {
    const answers = { "pain-area": "lower", severity: "severe", experience: "beginner", time: "short", intensity: "gentle" };
    expect(recommend("back-pain", answers)).toBe("restorative");
  });

  it("recommends Power Yoga for strength with regular, intense practice", () => {
    const answers = { "strength-area": "core", experience: "regular", time: "long", intensity: "intense" };
    expect(recommend("strength", answers)).toBe("power");
  });

  it("recommends Restorative Yoga for relaxation with gentle practice", () => {
    const answers = { "stress-time": "night", experience: "beginner", time: "short", intensity: "gentle" };
    expect(recommend("relaxation", answers)).toBe("restorative");
  });

  it("recommends Hatha Yoga for mindfulness and focus", () => {
    const answers = { "mind-goal": "focus", experience: "beginner", time: "medium", intensity: "moderate" };
    expect(recommend("mindfulness", answers)).toBe("hatha");
  });

  it("recommends Yin Yoga for tight hips with gentle practice", () => {
    const answers = { "tight-area": "hips-legs", experience: "beginner", time: "medium", intensity: "gentle" };
    expect(recommend("flexibility", answers)).toBe("yin");
  });

  it("gives different recommendations for different answers", () => {
    const a = recommend("strength", { "strength-area": "core", experience: "regular", time: "long", intensity: "intense" });
    const b = recommend("relaxation", { "stress-time": "night", experience: "beginner", time: "short", intensity: "gentle" });
    expect(a).not.toBe(b);
  });

  it("always returns a valid yoga type for every goal", () => {
    for (const goal of GOALS) {
      const answers = Object.fromEntries(getQuestions(goal.id).map((q) => [q.id, q.options[0].value]));
      expect(YOGA_TYPES).toContain(recommend(goal.id, answers));
    }
  });
});
