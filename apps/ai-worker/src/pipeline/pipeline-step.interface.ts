import type { ExtractionContext } from './extraction.context';

export interface PipelineStep {
  readonly name: string;
  execute(context: ExtractionContext): Promise<void>;
}
