import { Injectable, Logger } from '@nestjs/common';
import { ExtractionJobStatus } from '@prisma/client';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { ExtractionContext } from '../pipeline/extraction.context';
import { ExtractionPipelineBuilder } from '../pipeline/extraction-pipeline.builder';
import type { ExtractionJobPayload } from '@app/shared';
import { updateExtractionJob } from '../pipeline/steps/job-status.helper';

@Injectable()
export class ExtractionPipelineService {
  private readonly logger = new Logger(ExtractionPipelineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pipelineBuilder: ExtractionPipelineBuilder,
  ) {}

  async process(payload: ExtractionJobPayload): Promise<void> {
    const context = new ExtractionContext(payload);
    const pipeline = this.pipelineBuilder.buildDefault();

    await pipeline.run(context);
  }

  async markFailed(jobId: string, error: Error): Promise<void> {
    this.logger.error(`Extraction failed for job ${jobId}: ${error.message}`);

    await updateExtractionJob(this.prisma, jobId, {
      status: ExtractionJobStatus.FAILED,
      errorMessage: error.message.slice(0, 2000),
      completedAt: new Date(),
    });
  }
}
