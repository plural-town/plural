-- CreateEnum
CREATE TYPE "Protocol" AS ENUM ('ACTIVITYSTREAMS', 'MASTODON');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "RemoteEntityType" AS ENUM ('PERSON', 'NOTE', 'HASHTAG');

-- CreateEnum
CREATE TYPE "RemoteField" AS ENUM ('NAME');

-- CreateEnum
CREATE TYPE "FieldLanguage" AS ENUM ('EN');

-- CreateTable
CREATE TABLE "RemoteEntity" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "protocol" "Protocol" NOT NULL,
    "type" "RemoteEntityType" NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RemoteEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "REField" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" "RemoteField" NOT NULL,
    "lang" "FieldLanguage",
    "verified" BOOLEAN NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "REField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemoteQuery" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "authoritative" BOOLEAN,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "successAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),

    CONSTRAINT "RemoteQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemoteProfile" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "server" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "RemoteProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemoteNote" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "RemoteNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RemoteEntity_url_key" ON "RemoteEntity"("url");

-- CreateIndex
CREATE INDEX "REField_entityId_field_lang_idx" ON "REField"("entityId", "field", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "RemoteProfile_entityId_key" ON "RemoteProfile"("entityId");

-- CreateIndex
CREATE INDEX "RemoteProfile_server_username_idx" ON "RemoteProfile"("server", "username");

-- CreateIndex
CREATE UNIQUE INDEX "RemoteNote_entityId_key" ON "RemoteNote"("entityId");

-- CreateIndex
CREATE INDEX "RemoteNote_authorId_postId_idx" ON "RemoteNote"("authorId", "postId");

-- AddForeignKey
ALTER TABLE "REField" ADD CONSTRAINT "REField_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "RemoteEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoteQuery" ADD CONSTRAINT "RemoteQuery_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "RemoteEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoteProfile" ADD CONSTRAINT "RemoteProfile_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "RemoteEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoteNote" ADD CONSTRAINT "RemoteNote_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "RemoteEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoteNote" ADD CONSTRAINT "RemoteNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "RemoteProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
