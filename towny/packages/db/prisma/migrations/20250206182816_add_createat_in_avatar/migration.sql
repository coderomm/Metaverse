/*
  Warnings:

  - Added the required column `updatedAt` to the `Avatar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Avatar" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
