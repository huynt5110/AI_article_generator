import { Injectable } from '@nestjs/common';
import { ExtractionJobStatus } from '@prisma/client';
import { GeminiExtractionService } from '../../services/gemini-extraction.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { ExtractionContext } from '../extraction.context';
import type { PipelineStep } from '../pipeline-step.interface';
import { setJobStatus } from './job-status.helper';

@Injectable()
export class AiExtractStep implements PipelineStep {
  readonly name = 'ai-extract';

  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiExtractionService,
  ) { }

  async execute(context: ExtractionContext): Promise<void> {
    if (context.paragraphs.length === 0) {
      throw new Error('No paragraphs to extract from');
    }

    await setJobStatus(this.prisma, context.jobId, ExtractionJobStatus.EXTRACTING);

    context.aiResult = await this.gemini.extractStructuredArticle(
      context.paragraphs.map((p) => ({
        paragraphKey: p.paragraphKey,
        text: p.text,
      })),
    );

    await setJobStatus(this.prisma, context.jobId, ExtractionJobStatus.VALIDATING);
  }
}
