-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MOD', 'ADMIN', 'OWNER');

-- AlterTable
ALTER TABLE "Identity" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
