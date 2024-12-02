/*
  Warnings:

  - You are about to drop the column `text_variations` on the `cards` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cards" DROP COLUMN "text_variations",
ADD COLUMN     "white_space_variations" JSONB;
