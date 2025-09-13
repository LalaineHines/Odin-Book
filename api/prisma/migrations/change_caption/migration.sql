/*
  Warnings:

  - You are about to drop the column `caption` on the `Post` table. All the data in the column will be lost.
  - Added the required column `content` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "caption",
ADD COLUMN     "content" VARCHAR(1000) NOT NULL,
ALTER COLUMN "likes" SET DEFAULT 0;