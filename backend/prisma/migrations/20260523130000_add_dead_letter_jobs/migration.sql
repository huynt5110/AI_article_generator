-- CreateTable
CREATE TABLE "dead_letter_jobs" (
    "id" TEXT NOT NULL,
    "extractionJobId" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "queueJobId" TEXT,
    "payload" JSONB NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "errorStack" TEXT,
    "attempts" INTEGER NOT NULL,
    "failedAt" TIMESTAMP(3) NOT NULL,
    "reprocessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dead_letter_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dead_letter_jobs_extractionJobId_key" ON "dead_letter_jobs"("extractionJobId");
CREATE INDEX "dead_letter_jobs_uploadId_idx" ON "dead_letter_jobs"("uploadId");
CREATE INDEX "dead_letter_jobs_failedAt_idx" ON "dead_letter_jobs"("failedAt");

-- AddForeignKey
ALTER TABLE "dead_letter_jobs" ADD CONSTRAINT "dead_letter_jobs_extractionJobId_fkey" FOREIGN KEY ("extractionJobId") REFERENCES "extraction_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
