// Questionnaire data + rule-based weighted scoring recommendation

export const YOGA_TYPES = ["hatha", "vinyasa", "power", "yin", "restorative", "therapeutic"] as const;
export type YogaTypeSlug = (typeof YOGA_TYPES)[number];
type Scores = Partial<Record<YogaTypeSlug, number>>;

export type Option = { value: string; label: string; scores: Scores };
export type Question = { id: string; text: string; options: Option[] };
export type Goal = { id: string; label: string; emoji: string; scores: Scores; questions: Question[] };

const severityQuestion: Question = {
  id: "severity",
  text: "How strong is the pain?",
  options: [
    { value: "mild", label: "Mild, comes and goes", scores: {} },
    { value: "moderate", label: "Moderate, bothers me often", scores: { restorative: 1, therapeutic: 1 } },
    { value: "severe", label: "Severe, or from a recent injury", scores: { restorative: 3 } },
  ],
};

const commonQuestions: Question[] = [
  {
    id: "experience",
    text: "How much yoga experience do you have?",
    options: [
      { value: "beginner", label: "I'm a complete beginner", scores: { hatha: 2, restorative: 1, yin: 1, therapeutic: 1 } },
      { value: "some", label: "I've practiced a few times", scores: { hatha: 1, vinyasa: 1, yin: 1 } },
      { value: "regular", label: "I practice regularly", scores: { vinyasa: 2, power: 2 } },
    ],
  },
  {
    id: "time",
    text: "How much time can you give per session?",
    options: [
      { value: "short", label: "10–15 minutes", scores: { restorative: 1, therapeutic: 1, hatha: 1 } },
      { value: "medium", label: "20–30 minutes", scores: { hatha: 1, yin: 1, vinyasa: 1 } },
      { value: "long", label: "45 minutes or more", scores: { vinyasa: 1, power: 1, yin: 1 } },
    ],
  },
  {
    id: "intensity",
    text: "What kind of practice do you enjoy?",
    options: [
      { value: "gentle", label: "Gentle and slow", scores: { restorative: 2, yin: 2, therapeutic: 1 } },
      { value: "moderate", label: "Moderate, steady pace", scores: { hatha: 2, vinyasa: 1 } },
      { value: "intense", label: "Challenging and energetic", scores: { power: 2, vinyasa: 2 } },
    ],
  },
];

export const GOALS: Goal[] = [
  {
    id: "flexibility",
    label: "Flexibility",
    emoji: "🤸",
    scores: { yin: 2, hatha: 2, vinyasa: 1 },
    questions: [
      {
        id: "tight-area",
        text: "Which area feels the tightest?",
        options: [
          { value: "hips-legs", label: "Hips and legs", scores: { yin: 1, hatha: 1 } },
          { value: "back", label: "Back and spine", scores: { therapeutic: 1, yin: 1 } },
          { value: "whole", label: "My whole body", scores: { vinyasa: 1, hatha: 1 } },
        ],
      },
    ],
  },
  {
    id: "strength",
    label: "Strength",
    emoji: "💪",
    scores: { power: 3, vinyasa: 2 },
    questions: [
      {
        id: "strength-area",
        text: "What do you want to strengthen most?",
        options: [
          { value: "core", label: "Core / stomach", scores: { power: 1, vinyasa: 1 } },
          { value: "legs", label: "Legs", scores: { power: 1, hatha: 1 } },
          { value: "upper", label: "Arms and upper body", scores: { power: 1, vinyasa: 1 } },
        ],
      },
    ],
  },
  {
    id: "mindfulness",
    label: "Mindfulness",
    emoji: "🧠",
    scores: { hatha: 3, yin: 1, restorative: 1 },
    questions: [
      {
        id: "mind-goal",
        text: "What would you like to improve?",
        options: [
          { value: "focus", label: "Focus and concentration", scores: { hatha: 1 } },
          { value: "calm", label: "Feeling calm", scores: { yin: 1, restorative: 1 } },
          { value: "sleep", label: "Better sleep", scores: { restorative: 2 } },
        ],
      },
    ],
  },
  {
    id: "relaxation",
    label: "Relaxation",
    emoji: "😌",
    scores: { restorative: 3, yin: 2 },
    questions: [
      {
        id: "stress-time",
        text: "When do you feel most stressed?",
        options: [
          { value: "morning", label: "In the morning", scores: { hatha: 1 } },
          { value: "work", label: "During work or study", scores: { yin: 1 } },
          { value: "night", label: "At night", scores: { restorative: 1 } },
        ],
      },
    ],
  },
  {
    id: "back-pain",
    label: "Back Pain",
    emoji: "🧍",
    scores: { therapeutic: 4, restorative: 1 },
    questions: [
      {
        id: "pain-area",
        text: "Where do you feel the pain?",
        options: [
          { value: "lower", label: "Lower back", scores: { therapeutic: 1 } },
          { value: "upper", label: "Upper back", scores: { therapeutic: 1, yin: 1 } },
          { value: "both", label: "Both", scores: { therapeutic: 1 } },
        ],
      },
      severityQuestion,
    ],
  },
  {
    id: "joint-pain",
    label: "Joint Pain",
    emoji: "🦵",
    scores: { yin: 2, restorative: 2, therapeutic: 2 },
    questions: [
      {
        id: "joint-area",
        text: "Which joints bother you most?",
        options: [
          { value: "knees", label: "Knees", scores: { restorative: 1 } },
          { value: "hips", label: "Hips", scores: { yin: 1 } },
          { value: "shoulders", label: "Shoulders or wrists", scores: { therapeutic: 1 } },
        ],
      },
      severityQuestion,
    ],
  },
  {
    id: "neck-pain",
    label: "Neck Pain",
    emoji: "🙆",
    scores: { therapeutic: 4, restorative: 1 },
    questions: [
      {
        id: "neck-cause",
        text: "What usually causes your neck pain?",
        options: [
          { value: "desk", label: "Desk or phone use", scores: { therapeutic: 1 } },
          { value: "stress", label: "Stress", scores: { restorative: 1, yin: 1 } },
          { value: "sleep", label: "Sleeping position", scores: { yin: 1 } },
        ],
      },
      severityQuestion,
    ],
  },
];

export function getGoal(goalId: string) {
  return GOALS.find((g) => g.id === goalId);
}

export function getQuestions(goalId: string): Question[] {
  const goal = getGoal(goalId);
  return goal ? [...goal.questions, ...commonQuestions] : [];
}

export function validateAnswers(goalId: string, answers: Record<string, string>) {
  const questions = getQuestions(goalId);
  if (questions.length === 0) return false;
  return questions.every((q) => q.options.some((o) => o.value === answers[q.id]));
}

export function recommend(goalId: string, answers: Record<string, string>): YogaTypeSlug {
  const goal = getGoal(goalId);
  const totals = Object.fromEntries(YOGA_TYPES.map((t) => [t, 0])) as Record<YogaTypeSlug, number>;

  const add = (scores: Scores) => {
    for (const [type, points] of Object.entries(scores)) totals[type as YogaTypeSlug] += points ?? 0;
  };

  if (goal) add(goal.scores);
  for (const q of getQuestions(goalId)) {
    const option = q.options.find((o) => o.value === answers[q.id]);
    if (option) add(option.scores);
  }

  // highest score wins; on a tie, the earlier type in YOGA_TYPES wins
  return YOGA_TYPES.reduce((best, t) => (totals[t] > totals[best] ? t : best), YOGA_TYPES[0]);
}
