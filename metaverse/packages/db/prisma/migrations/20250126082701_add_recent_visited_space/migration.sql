-- CreateTable
CREATE TABLE "RecentVisitedSpace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentVisitedSpace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecentVisitedSpace_id_key" ON "RecentVisitedSpace"("id");

-- CreateIndex
CREATE INDEX "RecentVisitedSpace_userId_visitedAt_idx" ON "RecentVisitedSpace"("userId", "visitedAt");

-- CreateIndex
CREATE INDEX "RecentVisitedSpace_spaceId_idx" ON "RecentVisitedSpace"("spaceId");

-- AddForeignKey
ALTER TABLE "RecentVisitedSpace" ADD CONSTRAINT "RecentVisitedSpace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentVisitedSpace" ADD CONSTRAINT "RecentVisitedSpace_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
