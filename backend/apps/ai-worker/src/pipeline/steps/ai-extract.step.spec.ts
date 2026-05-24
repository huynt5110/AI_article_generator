import { AiExtractStep } from './ai-extract.step';
import { ExtractionContext } from '../extraction.context';

describe('AiExtractStep', () => {
  let step: AiExtractStep;
  let prismaServiceMock: any;
  let geminiServiceMock: any;

  beforeEach(() => {
    prismaServiceMock = {
      extractionJob: { update: jest.fn() },
    };
    geminiServiceMock = {
      extractStructuredArticle: jest.fn(),
    };
    step = new AiExtractStep(prismaServiceMock, geminiServiceMock);
  });

  afterEach(() => jest.clearAllMocks());

  it('should have the correct step name', () => {
    expect(step.name).toBe('ai-extract');
  });

  it('should throw if paragraphs are empty', async () => {
    const context = new ExtractionContext({ uploadId: 'upload-1', jobId: 'job-1' });
    context.paragraphs = [];

    await expect(step.execute(context)).rejects.toThrow('No paragraphs to extract from');
  });

  it('should set status to EXTRACTING, call Gemini, then set VALIDATING', async () => {
    const mockResult = {
      extraction: { title: 'Test' },
      model: 'gemini-1.5-flash',
      promptVersion: 'v1',
      tokenInput: 100,
      tokenOutput: 50,
      latencyMs: 1500,
    };
    geminiServiceMock.extractStructuredArticle.mockResolvedValue(mockResult);
    prismaServiceMock.extractionJob.update.mockResolvedValue({});

    const context = new ExtractionContext({ uploadId: 'upload-1', jobId: 'job-1' });
    context.paragraphs = [
      { id: '1', documentId: 'doc-1', paragraphKey: 'p1', text: 'Paris trip', orderIndex: 0 } as any,
    ];

    await step.execute(context);

    // First call: EXTRACTING, second call: VALIDATING
    expect(prismaServiceMock.extractionJob.update).toHaveBeenCalledTimes(2);
    expect(prismaServiceMock.extractionJob.update.mock.calls[0][0]).toEqual({
      where: { id: 'job-1' },
      data: { status: 'EXTRACTING' },
    });
    expect(prismaServiceMock.extractionJob.update.mock.calls[1][0]).toEqual({
      where: { id: 'job-1' },
      data: { status: 'VALIDATING' },
    });

    expect(context.aiResult).toEqual(mockResult);
    expect(geminiServiceMock.extractStructuredArticle).toHaveBeenCalledWith([
      { paragraphKey: 'p1', text: 'Paris trip' },
    ]);
  });

  it('should propagate Gemini service errors', async () => {
    prismaServiceMock.extractionJob.update.mockResolvedValue({});
    geminiServiceMock.extractStructuredArticle.mockRejectedValue(
      new Error('Gemini rate limited'),
    );

    const context = new ExtractionContext({ uploadId: 'upload-1', jobId: 'job-1' });
    context.paragraphs = [
      { id: '1', documentId: 'doc-1', paragraphKey: 'p1', text: 'content', orderIndex: 0 } as any,
    ];

    await expect(step.execute(context)).rejects.toThrow('Gemini rate limited');
  });
});
