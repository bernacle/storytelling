/*
  Warnings:

  - You are about to drop the column `story_id` on the `musics` table. All the data in the column will be lost.
  - Added the required column `script_id` to the `musics` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "musics" DROP CONSTRAINT "musics_story_id_fkey";

-- AlterTable
ALTER TABLE "musics" DROP COLUMN "story_id",
ADD COLUMN     "script_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "musics" ADD CONSTRAINT "musics_script_id_fkey" FOREIGN KEY ("script_id") REFERENCES "scripts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
