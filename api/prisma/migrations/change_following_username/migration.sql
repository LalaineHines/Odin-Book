/*
  Warnings:

  - You are about to drop the column `usernames` on the `Following` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Following" DROP COLUMN "usernames",
ADD COLUMN     "followList" TEXT[];