-- CreateTable
CREATE TABLE "NoteAuthor" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "NoteAuthor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NoteAuthor" ADD CONSTRAINT "NoteAuthor_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteAuthor" ADD CONSTRAINT "NoteAuthor_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Identity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
