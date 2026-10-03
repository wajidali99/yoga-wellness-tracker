import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getQuestionnaireTexts } from "@/lib/questionnaire-texts";
import QuestionnaireFlow from "@/components/questionnaire-flow";

export const dynamic = "force-dynamic";

export default async function QuestionnairePage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // "Change my answers": load the user's previous answers
  const { from } = await searchParams;
  let initialGoal: string | null = null;
  let initialAnswers: Record<string, string> = {};

  if (from) {
    const previous = await prisma.questionnaireResponse.findFirst({ where: { id: from, userId: session.user.id } });
    if (previous) {
      initialGoal = previous.primaryGoal;
      initialAnswers = previous.answers as Record<string, string>;
    }
  }

  const texts = await getQuestionnaireTexts();

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-sand-50 p-6">
      <QuestionnaireFlow initialGoal={initialGoal} initialAnswers={initialAnswers} texts={texts} />
    </main>
  );
}
