-- CreateTable
CREATE TABLE "YogaType" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "primaryBenefit" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "focusArea" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "poseSlugs" TEXT[],

    CONSTRAINT "YogaType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "primaryGoal" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "yogaTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionnaireResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YogaType_slug_key" ON "YogaType"("slug");

-- CreateIndex
CREATE INDEX "QuestionnaireResponse_userId_idx" ON "QuestionnaireResponse"("userId");

-- AddForeignKey
ALTER TABLE "QuestionnaireResponse" ADD CONSTRAINT "QuestionnaireResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireResponse" ADD CONSTRAINT "QuestionnaireResponse_yogaTypeId_fkey" FOREIGN KEY ("yogaTypeId") REFERENCES "YogaType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
