/*
  Warnings:

  - You are about to drop the column `category` on the `Recipe` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Recipe_userId_category_idx";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Category_userId_idx" ON "Category"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_userId_name_key" ON "Category"("userId", "name");

-- Перенос существующих категорий из Recipe в Category
INSERT INTO "Category" ("id", "userId", "name", "createdAt")
SELECT DISTINCT
    gen_random_uuid()::text,
    "userId",
    "category",
    NOW()
FROM "Recipe"
WHERE "category" IS NOT NULL AND "category" != 'Без категории';

-- Привязка рецептов к новым категориям
ALTER TABLE "Recipe" ADD COLUMN "categoryId" TEXT;

UPDATE "Recipe" r
SET "categoryId" = c.id
FROM "Category" c
WHERE r."userId" = c."userId" AND r."category" = c."name";

-- Теперь дропаем старую колонку
ALTER TABLE "Recipe" DROP COLUMN "category";

-- CreateIndex
CREATE INDEX "Recipe_userId_categoryId_idx" ON "Recipe"("userId", "categoryId");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;