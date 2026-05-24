import { CompleteJobStep } from './complete-job.step';
import { ExtractionContext } from '../extraction.context';

describe('CompleteJobStep', () => {
  let step: CompleteJobStep;
  let prismaServiceMock: any;

  beforeEach(() => {
    prismaServiceMock = {
      extractionJob: { update: jest.fn() },
    };
    step = new CompleteJobStep(prismaServiceMock);
  });

  afterEach(() => jest.clearAllMocks());

  it('should have the correct step name', () => {
    expect(step.name).toBe('complete-job');
  });

  it('should throw if aiResult is missing', async () => {
    const context = new ExtractionContext({ uploadId: 'upload-1', jobId: 'job-1' });
    // aiResult undefined

    await expect(step.execute(context)).rejects.toThrow(
      'AI result missing — run ai-extract step first',
    );
  });

  it('should update extraction job with COMPLETED status and AI metrics', async () => {
    prismaServiceMock.extractionJob.update.mockResolvedValue({});

    const context = new ExtractionContext({ uploadId: 'upload-1', jobId: 'job-1' });
    context.aiResult = {
      extraction: { title: 'Test' } as any,
      model: 'gemini-1.5-flash',
      promptVersion: 'v1',
      tokenInput: 200,
      tokenOutput: 80,
      latencyMs: 3200,
    };

    await step.execute(context);

    expect(prismaServiceMock.extractionJob.update).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: {
        status: 'COMPLETED',
        model: 'gemini-1.5-flash',
        promptVersion: 'v1',
        tokenInput: 200,
        tokenOutput: 80,
        latencyMs: 3200,
        completedAt: expect.any(Date),
        errorMessage: null,
      },
    });
  });

  it('should set errorMessage to null to clear any previous errors', async () => {
    prismaServiceMock.extractionJob.update.mockResolvedValue({});

    const context = new ExtractionContext({ uploadId: 'upload-1', jobId: 'job-1' });
    context.aiResult = {
      extraction: { title: 'Test' } as any,
      model: 'model',
      promptVersion: 'v1',
      tokenInput: 0,
      tokenOutput: 0,
      latencyMs: 0,
    };

    await step.execute(context);

    const updateData = prismaServiceMock.extractionJob.update.mock.calls[0][0].data;
    expect(updateData.errorMessage).toBeNull();
  });
});
