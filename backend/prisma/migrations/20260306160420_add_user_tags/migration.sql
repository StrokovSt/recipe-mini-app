/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Tag_name_key";

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'dev-user';
ALTER TABLE "Tag" ALTER COLUMN "userId" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");