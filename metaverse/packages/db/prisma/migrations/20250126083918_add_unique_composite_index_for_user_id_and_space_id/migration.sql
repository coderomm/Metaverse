/*
  Warnings:

  - A unique constraint covering the columns `[userId,spaceId]` on the table `RecentVisitedSpace` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RecentVisitedSpace_userId_spaceId_key" ON "RecentVisitedSpace"("userId", "spaceId");
