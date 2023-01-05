-- DropForeignKey
ALTER TABLE "RemoteNote" DROP CONSTRAINT "RemoteNote_authorId_fkey";

-- CreateTable
CREATE TABLE "RemoteNoteAuthor" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,

    CONSTRAINT "RemoteNoteAuthor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RemoteNoteAuthor" ADD CONSTRAINT "RemoteNoteAuthor_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "RemoteProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoteNoteAuthor" ADD CONSTRAINT "RemoteNoteAuthor_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "RemoteNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
