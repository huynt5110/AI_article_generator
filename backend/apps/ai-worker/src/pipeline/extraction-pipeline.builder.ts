import { Injectable } from '@nestjs/common';
import { ExtractionPipelineRunner } from './extraction-pipeline.runner';
import type { PipelineStep } from './pipeline-step.interface';
import { LoadUploadStep } from './steps/load-upload.step';
import { ParseDocumentStep } from './steps/parse-document.step';
import { AiExtractStep } from './steps/ai-extract.step';
import { PersistDraftStep } from './steps/persist-draft.step';
import { CompleteJobStep } from './steps/complete-job.step';

@Injectable()
export class ExtractionPipelineBuilder {
  private readonly steps: PipelineStep[] = [];

  constructor(
    private readonly loadUploadStep: LoadUploadStep,
    private readonly parseDocumentStep: ParseDocumentStep,
    private readonly aiExtractStep: AiExtractStep,
    private readonly persistDraftStep: PersistDraftStep,
    private readonly completeJobStep: CompleteJobStep,
  ) {}

  /** Fluent API for custom pipeline ordering or optional steps. */
  addStep(step: PipelineStep): this {
    this.steps.push(step);
    return this;
  }

  reset(): this {
    this.steps.length = 0;
    return this;
  }

  build(): ExtractionPipelineRunner {
    if (this.steps.length === 0) {
      return this.buildDefault();
    }
    return new ExtractionPipelineRunner([...this.steps]);
  }

  buildDefault(): ExtractionPipelineRunner {
    return new ExtractionPipelineRunner([
      this.loadUploadStep,
      this.parseDocumentStep,
      this.aiExtractStep,
      this.persistDraftStep,
      this.completeJobStep,
    ]);
  }
}
