-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "YogaPose" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sanskritName" TEXT,
    "description" TEXT NOT NULL,
    "benefits" TEXT[],
    "instructions" TEXT[],
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "focusArea" TEXT NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YogaPose_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YogaPose_slug_key" ON "YogaPose"("slug");
