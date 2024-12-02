-- CreateEnum
CREATE TYPE "ScriptType" AS ENUM ('STORY', 'CARD');

-- AlterTable
ALTER TABLE "scripts" ADD COLUMN     "type" "ScriptType" NOT NULL DEFAULT 'STORY';

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "script_id" TEXT NOT NULL,
    "color_palette" JSONB NOT NULL,
    "font_style" TEXT NOT NULL,
    "layout" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_script_id_fkey" FOREIGN KEY ("script_id") REFERENCES "scripts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
