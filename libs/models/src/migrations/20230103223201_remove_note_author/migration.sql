/*
  Warnings:

  - You are about to drop the column `authorId` on the `RemoteNote` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "RemoteNote_authorId_postId_idx";

-- AlterTable
ALTER TABLE "RemoteNote" DROP COLUMN "authorId";
