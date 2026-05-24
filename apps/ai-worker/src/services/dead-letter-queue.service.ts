import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import {
  DEAD_LETTER_JOB_NAME,
  DOCUMENT_EXTRACTION_DLQ,
  type DeadLetterJobPayload,
  type ExtractionJobPayload,
} from '@app/shared';

@Injectable()
export class DeadLetterQueueService {
  private readonly logger = new Logger(DeadLetterQueueService.name);

  constructor(
    @InjectQueue(DOCUMENT_EXTRACTION_DLQ)
    private readonly dlq: Queue<DeadLetterJobPayload>,
  ) {}

  async enqueue(
    original: ExtractionJobPayload,
    job: Job<ExtractionJobPayload>,
    error: Error,
  ): Promise<void> {
    const payload: DeadLetterJobPayload = {
      original,
      queueJobId: job.id ?? null,
      errorMessage: error.message,
      errorStack: error.stack ?? null,
      attempts: job.attemptsMade,
      failedAt: new Date().toISOString(),
    };

    const dlqJobId = `dlq-${original.jobId}`;

    await this.dlq.add(DEAD_LETTER_JOB_NAME, payload, {
      jobId: dlqJobId,
      removeOnComplete: false,
      removeOnFail: false,
    });

    this.logger.warn(
      `Routed extraction job ${original.jobId} to DLQ (queue job ${dlqJobId})`,
    );
  }
}
