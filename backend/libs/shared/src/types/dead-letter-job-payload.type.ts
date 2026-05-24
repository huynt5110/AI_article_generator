import type { ExtractionJobPayload } from './extraction-job-payload.type';

export interface DeadLetterJobPayload {
  original: ExtractionJobPayload;
  queueJobId: string | null;
  errorMessage: string;
  errorStack: string | null;
  attempts: number;
  failedAt: string;
}
