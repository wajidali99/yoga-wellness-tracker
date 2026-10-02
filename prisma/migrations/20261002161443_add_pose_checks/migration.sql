-- CreateTable
CREATE TABLE "PoseCheck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "poseSlug" TEXT NOT NULL,
    "bestConfidence" DOUBLE PRECISION NOT NULL,
    "heldSeconds" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoseCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PoseCheck_userId_idx" ON "PoseCheck"("userId");

-- AddForeignKey
ALTER TABLE "PoseCheck" ADD CONSTRAINT "PoseCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
