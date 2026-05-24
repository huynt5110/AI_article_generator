import { PersistDraftStep } from './persist-draft.step';
import { ExtractionContext } from '../extraction.context';

describe('PersistDraftStep', () => {
  let step: PersistDraftStep;
  let prismaServiceMock: any;

  beforeEach(() => {
    prismaServiceMock = {
      $transaction: jest.fn(),
    };
    step = new PersistDraftStep(prismaServiceMock);
  });

  afterEach(() => jest.clearAllMocks());

  it('should have the correct step name', () => {
    expect(step.name).toBe('persist-draft');
  });

  it('should throw if aiResult is missing', async () => {
    const context = new ExtractionContext({ uploadId: 'upload-1', jobId: 'job-1' });
    // aiResult is undefined

    await expect(step.execute(context)).rejects.toThrow(
      'AI result missing — run ai-extract step first',
    );
  });

  it('should upsert draft and create provenance rows', async () => {
    const mockDraft = { id: 'draft-1' };
    let capturedUpsertArgs: any;
    let capturedProvenanceData: any;

    prismaServiceMock.$transaction.mockImplementation(async (fn: Function) => {
      const tx = {
        articleDraft: {
          upsert: jest.fn().mockImplementation((args) => {
            capturedUpsertArgs = args;
            return mockDraft;
          }),
        },
        provenance: {
          deleteMany: jest.fn().mockResolvedValue({}),
          createMany: jest.fn().mockImplementation(({ data }) => {
            capturedProvenanceData = data;
            return {};
          }),
        },
      };
      return fn(tx);
    });

    const context = new ExtractionContext({ uploadId: 'upload-1', jobId: 'job-1' });
    context.paragraphs = [
      { id: '1', documentId: 'doc-1', paragraphKey: 'p1', text: 'Paris is great', orderIndex: 0 } as any,
      { id: '2', documentId: 'doc-1', paragraphKey: 'p2', text: 'Rome too', orderIndex: 1 } as any,
    ];
    context.aiResult = {
      extraction: {
        title: 'A Trip',
        hook: 'You will love it',
        sections: [{ heading: 'Day 1', body: 'Paris' }],
        bestFor: ['Couples'],
        notFor: ['Solo'],
        keyFacts: { duration: '3 days' },
        ethicsNotes: ['Be kind'],
        provenance: [
          { fieldPath: 'title', sourceParagraphKey: 'p1' },
          { fieldPath: 'hook', sourceParagraphKey: 'p2' },
        ],
      },
      model: 'gemini-1.5-flash',
      promptVersion: 'v1',
      tokenInput: 100,
      tokenOutput: 50,
      latencyMs: 1500,
    };

    await step.execute(context);

    // Verify upsert was called with correct structured content
    expect(capturedUpsertArgs.create.title).toBe('A Trip');
    expect(capturedUpsertArgs.create.hook).toBe('You will love it');
    expect(capturedUpsertArgs.create.structuredContent).toEqual(
      expect.objectContaining({
        title: 'A Trip',
        keyFacts: { duration: '3 days' },
      }),
    );

    // Verify provenance rows
    expect(capturedProvenanceData).toHaveLength(2);
    expect(capturedProvenanceData[0]).toEqual({
      articleDraftId: 'draft-1',
      fieldPath: 'title',
      sourceParagraphKey: 'p1',
      sourceText: 'Paris is great',
    });
  });

  it('should use fallback text for missing paragraph keys', async () => {
    let capturedProvenanceData: any;

    prismaServiceMock.$transaction.mockImplementation(async (fn: Function) => {
      const tx = {
        articleDraft: { upsert: jest.fn().mockResolvedValue({ id: 'draft-1' }) },
        provenance: {
          deleteMany: jest.fn().mockResolvedValue({}),
          createMany: jest.fn().mockImplementation(({ data }) => {
            capturedProvenanceData = data;
            return {};
          }),
        },
      };
      return fn(tx);
    });

    const context = new ExtractionContext({ uploadId: 'upload-1', jobId: 'job-1' });
    context.paragraphs = []; // No paragraphs available
    context.aiResult = {
      extraction: {
        title: 'Test',
        hook: 'Hook',
        sections: [],
        bestFor: [],
        notFor: [],
        keyFacts: {},
        ethicsNotes: [],
        provenance: [
          { fieldPath: 'title', sourceParagraphKey: 'p999' },
        ],
      },
      model: 'model',
      promptVersion: 'v1',
      tokenInput: 0,
      tokenOutput: 0,
      latencyMs: 0,
    };

    await step.execute(context);

    expect(capturedProvenanceData[0].sourceText).toBe('[missing paragraph p999]');
  });

  it('should skip createMany when provenance array is empty', async () => {
    let createManyCalled = false;

    prismaServiceMock.$transaction.mockImplementation(async (fn: Function) => {
      const tx = {
        articleDraft: { upsert: jest.fn().mockResolvedValue({ id: 'draft-1' }) },
        provenance: {
          deleteMany: jest.fn().mockResolvedValue({}),
          createMany: jest.fn().mockImplementation(() => {
            createManyCalled = true;
            return {};
          }),
        },
      };
      return fn(tx);
    });

    const context = new ExtractionContext({ uploadId: 'upload-1', jobId: 'job-1' });
    context.paragraphs = [];
    context.aiResult = {
      extraction: {
        title: 'Test',
        hook: 'Hook',
        sections: [],
        bestFor: [],
        notFor: [],
        keyFacts: {},
        ethicsNotes: [],
        provenance: [], // Empty provenance
      },
      model: 'model',
      promptVersion: 'v1',
      tokenInput: 0,
      tokenOutput: 0,
      latencyMs: 0,
    };

    await step.execute(context);

    expect(createManyCalled).toBe(false);
  });
});
