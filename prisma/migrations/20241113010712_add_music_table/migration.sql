-- CreateTable
CREATE TABLE "musics" (
    "id" TEXT NOT NULL,
    "mood" "MusicMood" NOT NULL,
    "audio_url" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "duration" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "story_id" TEXT,

    CONSTRAINT "musics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "musics" ADD CONSTRAINT "musics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "musics" ADD CONSTRAINT "musics_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
