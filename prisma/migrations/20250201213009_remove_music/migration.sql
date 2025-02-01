/*
  Warnings:

  - You are about to drop the column `music_mood` on the `stories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "stories" DROP COLUMN "music_mood";

-- DropEnum
DROP TYPE "MusicMood";
