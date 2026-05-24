import { Logger } from '@nestjs/common';
import type { ExtractionContext } from './extraction.context';
import type { PipelineStep } from './pipeline-step.interface';

export class ExtractionPipelineRunner {
  private readonly logger = new Logger(ExtractionPipelineRunner.name);

  constructor(private readonly steps: PipelineStep[]) {}

  async run(context: ExtractionContext): Promise<void> {
    for (const step of this.steps) {
      this.logger.debug(
        `Running step "${step.name}" for job ${context.jobId}`,
      );
      await step.execute(context);
    }
  }
}
