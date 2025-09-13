/*
  Warnings:

  - You are about to drop the `Following` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Following" DROP CONSTRAINT "Following_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "following" TEXT[];

-- DropTable
DROP TABLE "Following";