-- AlterEnum: migrate UploadStatus (remove PENDING)
BEGIN;
CREATE TYPE "UploadStatus_new" AS ENUM ('UPLOADING', 'UPLOADED', 'FAILED');
ALTER TABLE "uploads" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "uploads" ALTER COLUMN "status" TYPE "UploadStatus_new" USING (
  CASE
    WHEN "status"::text = 'PENDING' THEN 'UPLOADED'::"UploadStatus_new"
    ELSE "status"::text::"UploadStatus_new"
  END
);
ALTER TYPE "UploadStatus" RENAME TO "UploadStatus_old";
ALTER TYPE "UploadStatus_new" RENAME TO "UploadStatus";
DROP TYPE "UploadStatus_old";
ALTER TABLE "uploads" ALTER COLUMN "status" SET DEFAULT 'UPLOADING';
COMMIT;

-- Make size required
UPDATE "uploads" SET "size" = 0 WHERE "size" IS NULL;
ALTER TABLE "uploads" ALTER COLUMN "size" SET NOT NULL;

-- CreateEnum
CREATE TYPE "ExtractionJobStatus" AS ENUM ('QUEUED', 'PARSING', 'EXTRACTING', 'VALIDATING', 'COMPLETED', 'FAILED');
CREATE TYPE "DraftStatus" AS ENUM ('DRAFT', 'REVIEW_REQUIRED', 'READY', 'PUBLISHED');

-- CreateTable
CREATE TABLE "extraction_jobs" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "status" "ExtractionJobStatus" NOT NULL DEFAULT 'QUEUED',
    "model" TEXT,
    "promptVersion" TEXT,
    "tokenInput" INTEGER,
    "tokenOutput" INTEGER,
    "latencyMs" INTEGER,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extraction_jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "extractedText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "document_paragraphs" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "paragraphKey" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_paragraphs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "article_drafts" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "title" TEXT,
    "hook" TEXT,
    "structuredContent" JSONB NOT NULL,
    "status" "DraftStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_drafts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provenance" (
    "id" TEXT NOT NULL,
    "articleDraftId" TEXT NOT NULL,
    "fieldPath" TEXT NOT NULL,
    "sourceParagraphKey" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provenance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "uploads_userId_idx" ON "uploads"("userId");
CREATE INDEX "extraction_jobs_uploadId_idx" ON "extraction_jobs"("uploadId");
CREATE INDEX "extraction_jobs_status_idx" ON "extraction_jobs"("status");
CREATE UNIQUE INDEX "documents_uploadId_key" ON "documents"("uploadId");
CREATE INDEX "document_paragraphs_documentId_idx" ON "document_paragraphs"("documentId");
CREATE UNIQUE INDEX "document_paragraphs_documentId_paragraphKey_key" ON "document_paragraphs"("documentId", "paragraphKey");
CREATE UNIQUE INDEX "article_drafts_uploadId_key" ON "article_drafts"("uploadId");
CREATE INDEX "provenance_articleDraftId_idx" ON "provenance"("articleDraftId");

-- AddForeignKey
ALTER TABLE "extraction_jobs" ADD CONSTRAINT "extraction_jobs_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_paragraphs" ADD CONSTRAINT "document_paragraphs_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "article_drafts" ADD CONSTRAINT "article_drafts_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "provenance" ADD CONSTRAINT "provenance_articleDraftId_fkey" FOREIGN KEY ("articleDraftId") REFERENCES "article_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
