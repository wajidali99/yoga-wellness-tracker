import { prisma } from "@/lib/prisma";
import { GOALS, getQuestions } from "@/lib/questionnaire";

// every editable text with its default value, e.g. { "q:experience": "How much yoga experience..." }
export function allTextDefaults(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const g of GOALS) {
    map[`g:${g.id}`] = g.label;
    for (const q of getQuestions(g.id)) {
      map[`q:${q.id}`] = q.text;
      for (const o of q.options) map[`o:${q.id}:${o.value}`] = o.label;
    }
  }
  return map;
}

// admin's custom wording (only the texts that were changed)
export async function getQuestionnaireTexts(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.questionText.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.text]));
  } catch {
    return {}; // fall back to the default wording
  }
}
