import { Injectable, Logger } from '@nestjs/common';
import { ExtractionJobStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { ExtractionContext } from '../extraction.context';
import type { PipelineStep } from '../pipeline-step.interface';
import { updateExtractionJob } from './job-status.helper';

@Injectable()
export class CompleteJobStep implements PipelineStep {
  readonly name = 'complete-job';
  private readonly logger = new Logger(CompleteJobStep.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(context: ExtractionContext): Promise<void> {
    if (!context.aiResult) {
      throw new Error('AI result missing — run ai-extract step first');
    }

    const aiResult = context.aiResult;

    await updateExtractionJob(this.prisma, context.jobId, {
      status: ExtractionJobStatus.COMPLETED,
      model: aiResult.model,
      promptVersion: aiResult.promptVersion,
      tokenInput: aiResult.tokenInput,
      tokenOutput: aiResult.tokenOutput,
      latencyMs: aiResult.latencyMs,
      completedAt: new Date(),
      errorMessage: null,
    });

    this.logger.log(
      `Extraction completed for upload ${context.uploadId}, job ${context.jobId}`,
    );
  }
}
