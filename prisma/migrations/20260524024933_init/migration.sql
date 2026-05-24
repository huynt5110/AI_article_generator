/*
  Warnings:

  - You are about to drop the `provenance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "provenance" DROP CONSTRAINT "provenance_articleDraftId_fkey";

-- DropTable
DROP TABLE "provenance";

-- CreateTable
CREATE TABLE "provenances" (
    "id" TEXT NOT NULL,
    "articleDraftId" TEXT NOT NULL,
    "fieldPath" TEXT NOT NULL,
    "sourceParagraphKey" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "userModified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_revisions" (
    "id" TEXT NOT NULL,
    "articleDraftId" TEXT NOT NULL,
    "editedByUserId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provenances_articleDraftId_idx" ON "provenances"("articleDraftId");

-- CreateIndex
CREATE INDEX "article_revisions_articleDraftId_idx" ON "article_revisions"("articleDraftId");

-- CreateIndex
CREATE INDEX "article_drafts_status_idx" ON "article_drafts"("status");

-- CreateIndex
CREATE INDEX "article_drafts_updatedAt_idx" ON "article_drafts"("updatedAt");

-- CreateIndex
CREATE INDEX "article_drafts_createdAt_idx" ON "article_drafts"("createdAt");

-- CreateIndex
CREATE INDEX "article_drafts_uploadId_idx" ON "article_drafts"("uploadId");

-- AddForeignKey
ALTER TABLE "provenances" ADD CONSTRAINT "provenances_articleDraftId_fkey" FOREIGN KEY ("articleDraftId") REFERENCES "article_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_revisions" ADD CONSTRAINT "article_revisions_articleDraftId_fkey" FOREIGN KEY ("articleDraftId") REFERENCES "article_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
