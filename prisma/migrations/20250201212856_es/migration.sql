/*
  Warnings:

  - You are about to drop the `musics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "musics" DROP CONSTRAINT "musics_script_id_fkey";

-- DropForeignKey
ALTER TABLE "musics" DROP CONSTRAINT "musics_user_id_fkey";

-- DropTable
DROP TABLE "musics";
