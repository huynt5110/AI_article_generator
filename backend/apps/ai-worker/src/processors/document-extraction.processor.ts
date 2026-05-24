import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  DOCUMENT_EXTRACTION_QUEUE,
  type ExtractionJobPayload,
} from '@app/shared';
import { ExtractionPipelineService } from '../services/extraction-pipeline.service';
import { DeadLetterQueueService } from '../services/dead-letter-queue.service';

@Processor(DOCUMENT_EXTRACTION_QUEUE, {
  concurrency: parseInt(process.env.WORKER_CONCURRENCY ?? '5', 10),
})
export class DocumentExtractionProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentExtractionProcessor.name);

  constructor(
    private readonly pipeline: ExtractionPipelineService,
    private readonly deadLetterQueue: DeadLetterQueueService,
  ) {
    super();
  }

  async process(job: Job<ExtractionJobPayload>): Promise<void> {
    this.logger.log(
      `Processing extraction job ${job.id} (attempt ${job.attemptsMade + 1})`,
    );

    await this.pipeline.process(job.data);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<ExtractionJobPayload> | undefined, error: Error) {
    if (!job?.data?.jobId) {
      return;
    }

    const maxAttempts = job.opts.attempts ?? 1;
    const isFinalAttempt = job.attemptsMade >= maxAttempts;

    if (!isFinalAttempt) {
      return;
    }

    await this.pipeline.markFailed(job.data.jobId, error);
    await this.deadLetterQueue.enqueue(job.data, job, error);
  }
}
