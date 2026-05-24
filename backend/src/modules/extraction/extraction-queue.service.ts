import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  DEFAULT_JOB_ATTEMPTS,
  DEFAULT_JOB_BACKOFF_DELAY_MS,
  DOCUMENT_EXTRACTION_QUEUE,
  EXTRACTION_JOB_NAME,
  type ExtractionJobPayload,
} from '@app/shared';

@Injectable()
export class ExtractionQueueService {
  private readonly logger = new Logger(ExtractionQueueService.name);

  constructor(
    @InjectQueue(DOCUMENT_EXTRACTION_QUEUE)
    private readonly extractionQueue: Queue<ExtractionJobPayload>,
  ) {}

  async enqueueExtraction(payload: ExtractionJobPayload): Promise<void> {
    await this.extractionQueue.add(EXTRACTION_JOB_NAME, payload, {
      jobId: payload.jobId,
      attempts: DEFAULT_JOB_ATTEMPTS,
      backoff: {
        type: 'exponential',
        delay: DEFAULT_JOB_BACKOFF_DELAY_MS,
      },
    });

    this.logger.log(
      `Enqueued extraction job ${payload.jobId} for upload ${payload.uploadId}`,
    );
  }
}
