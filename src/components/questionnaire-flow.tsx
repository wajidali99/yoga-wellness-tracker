"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GOALS, getQuestions } from "@/lib/questionnaire";
import { submitQuestionnaire } from "@/app/questionnaire/actions";

export default function QuestionnaireFlow({
  initialGoal,
  initialAnswers,
}: {
  initialGoal: string | null;
  initialAnswers: Record<string, string>;
}) {
  const router = useRouter();
  const [goalId, setGoalId] = useState<string | null>(initialGoal);
  const [onGoalScreen, setOnGoalScreen] = useState(initialGoal === null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const questions = goalId ? getQuestions(goalId) : [];
  const total = questions.length + 1; // +1 for choosing the goal
  const done = (goalId ? 1 : 0) + questions.filter((q) => answers[q.id]).length;
  const percent = Math.round((done / total) * 100);

  function chooseGoal(id: string) {
    if (id !== goalId) setAnswers({});
    setGoalId(id);
    setStep(0);
    setError("");
    setOnGoalScreen(false);
  }

  function selectAnswer(questionId: string, value: string) {
    setAnswers({ ...answers, [questionId]: value });
    setError("");
  }

  function next() {
    if (!answers[questions[step].id]) {
      setError("Please choose an answer to continue.");
      return;
    }
    setError("");
    setStep(step + 1);
  }

  function back() {
    setError("");
    if (step === 0) setOnGoalScreen(true);
    else setStep(step - 1);
  }

  async function submit() {
    const missing = questions.find((q) => !answers[q.id]);
    if (missing) {
      setError("Please answer all questions before submitting.");
      setStep(questions.indexOf(missing));
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitQuestionnaire(goalId!, answers);
      if (res.ok) router.push(`/result/${res.id}`);
      else setError(res.error);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const question = questions[step];
  const isLast = step === questions.length - 1;

  return (
    <div className="w-full max-w-2xl">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-1 flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{percent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/70">
          <div className="h-2 rounded-full bg-sky-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="rounded-xl bg-white p-8 shadow-lg">
        {onGoalScreen ? (
          <>
            <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800">What is your Primary Goal?</h1>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => chooseGoal(g.id)}
                  className={`rounded-xl border-2 p-4 text-center transition hover:border-sky-400 ${
                    goalId === g.id ? "border-sky-500 bg-sky-50" : "border-gray-200"
                  }`}
                >
                  <div className="text-4xl">{g.emoji}</div>
                  <div className="mt-2 font-medium text-gray-700">{g.label}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          question && (
            <>
              <p className="text-sm text-gray-500">
                Question {step + 1} of {questions.length}
              </p>
              <h2 className="mt-1 mb-6 text-xl font-semibold text-gray-800">{question.text}</h2>
              <div className="space-y-3">
                {question.options.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => selectAnswer(question.id, o.value)}
                    className={`w-full rounded-lg border-2 px-4 py-3 text-left transition hover:border-sky-400 ${
                      answers[question.id] === o.value ? "border-sky-500 bg-sky-50 text-sky-800" : "border-gray-200 text-gray-700"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>

              {error && <p className="mt-4 rounded-md bg-red-50 p-2 text-sm text-red-600">{error}</p>}

              <div className="mt-8 flex justify-between">
                <button onClick={back} className="rounded-md border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-50">
                  ← Back
                </button>
                {isLast ? (
                  <button
                    onClick={submit}
                    disabled={submitting}
                    className="rounded-md bg-green-500 px-5 py-2 font-medium text-white hover:bg-green-600 disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                ) : (
                  <button onClick={next} className="rounded-md bg-sky-500 px-5 py-2 font-medium text-white hover:bg-sky-600">
                    Next →
                  </button>
                )}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
