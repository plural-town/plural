-- AlterTable
ALTER TABLE "DisplayName" ADD COLUMN     "bio" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "bioVisibility" "Visibility" NOT NULL DEFAULT 'PRIVATE';
