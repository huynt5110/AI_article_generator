import { ExtractionPipelineRunner } from './extraction-pipeline.runner';
import { ExtractionContext } from './extraction.context';
import type { PipelineStep } from './pipeline-step.interface';

describe('ExtractionPipelineRunner', () => {
  function createMockStep(name: string, fn?: (ctx: ExtractionContext) => Promise<void>): PipelineStep {
    return {
      name,
      execute: jest.fn(fn ?? (async () => {})),
    };
  }

  const payload = { uploadId: 'upload-1', jobId: 'job-1' };

  it('should execute all steps in sequence', async () => {
    const executionOrder: string[] = [];
    const step1 = createMockStep('step-1', async () => { executionOrder.push('step-1'); });
    const step2 = createMockStep('step-2', async () => { executionOrder.push('step-2'); });
    const step3 = createMockStep('step-3', async () => { executionOrder.push('step-3'); });

    const runner = new ExtractionPipelineRunner([step1, step2, step3]);
    const context = new ExtractionContext(payload);

    await runner.run(context);

    expect(executionOrder).toEqual(['step-1', 'step-2', 'step-3']);
    expect(step1.execute).toHaveBeenCalledWith(context);
    expect(step2.execute).toHaveBeenCalledWith(context);
    expect(step3.execute).toHaveBeenCalledWith(context);
  });

  it('should stop at the first failing step and propagate the error', async () => {
    const step1 = createMockStep('step-1');
    const step2 = createMockStep('step-2', async () => {
      throw new Error('Step 2 exploded');
    });
    const step3 = createMockStep('step-3');

    const runner = new ExtractionPipelineRunner([step1, step2, step3]);
    const context = new ExtractionContext(payload);

    await expect(runner.run(context)).rejects.toThrow('Step 2 exploded');

    expect(step1.execute).toHaveBeenCalled();
    expect(step2.execute).toHaveBeenCalled();
    expect(step3.execute).not.toHaveBeenCalled();
  });

  it('should handle an empty steps array without error', async () => {
    const runner = new ExtractionPipelineRunner([]);
    const context = new ExtractionContext(payload);

    await expect(runner.run(context)).resolves.toBeUndefined();
  });

  it('should pass the same context instance to all steps', async () => {
    const receivedContexts: ExtractionContext[] = [];
    const step1 = createMockStep('step-1', async (ctx) => { receivedContexts.push(ctx); });
    const step2 = createMockStep('step-2', async (ctx) => { receivedContexts.push(ctx); });

    const runner = new ExtractionPipelineRunner([step1, step2]);
    const context = new ExtractionContext(payload);

    await runner.run(context);

    expect(receivedContexts[0]).toBe(receivedContexts[1]);
    expect(receivedContexts[0]).toBe(context);
  });
});
