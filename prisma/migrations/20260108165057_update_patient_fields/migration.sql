/*
  Warnings:

  - You are about to drop the column `bio` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "bio",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "condition" TEXT DEFAULT '',
ALTER COLUMN "email" DROP NOT NULL;
