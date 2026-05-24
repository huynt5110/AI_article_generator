import { ParseDocumentStep } from './parse-document.step';
import { ExtractionContext } from '../extraction.context';

describe('ParseDocumentStep', () => {
  let step: ParseDocumentStep;
  let prismaServiceMock: any;
  let docxParserMock: any;

  beforeEach(() => {
    prismaServiceMock = {
      $transaction: jest.fn(),
      documentParagraph: { findMany: jest.fn() },
    };
    docxParserMock = {
      parse: jest.fn(),
    };
    step = new ParseDocumentStep(prismaServiceMock, docxParserMock);
  });

  afterEach(() => jest.clearAllMocks());

  it('should have the correct step name', () => {
    expect(step.name).toBe('parse-document');
  });

  it('should throw if fileBuffer is missing', async () => {
    const context = new ExtractionContext({ uploadId: 'upload-1', jobId: 'job-1' });
    // fileBuffer is undefined

    await expect(step.execute(context)).rejects.toThrow(
      'File buffer missing — run load-upload step first',
    );
  });

  it('should parse document, upsert, and store paragraphs', async () => {
    const mockParsed = {
      extractedText: 'Hello world.',
      paragraphs: [
        { paragraphKey: 'p1', text: 'Hello world.', orderIndex: 0 },
      ],
    };
    docxParserMock.parse.mockResolvedValue(mockParsed);

    const mockDoc = { id: 'doc-1' };
    prismaServiceMock.$transaction.mockImplementation(async (fn: Function) => {
      const tx = {
        document: {
          upsert: jest.fn().mockResolvedValue(mockDoc),
        },
        documentParagraph: {
          deleteMany: jest.fn().mockResolvedValue({}),
          createMany: jest.fn().mockResolvedValue({}),
        },
      };
      return fn(tx);
    });

    const mockDbParagraphs = [
      { id: 'dp-1', paragraphKey: 'p1', text: 'Hello world.', orderIndex: 0 },
    ];
    prismaServiceMock.documentParagraph.findMany.mockResolvedValue(mockDbParagraphs);

    const context = new ExtractionContext({ uploadId: 'upload-1', jobId: 'job-1' });
    context.fileBuffer = Buffer.from('fake');

    await step.execute(context);

    expect(docxParserMock.parse).toHaveBeenCalledWith(context.fileBuffer);
    expect(context.document).toEqual(mockDoc);
    expect(context.paragraphs).toEqual(mockDbParagraphs);
  });

  it('should handle document with zero paragraphs (no createMany call)', async () => {
    const mockParsed = {
      extractedText: '',
      paragraphs: [],
    };
    docxParserMock.parse.mockResolvedValue(mockParsed);

    const mockDoc = { id: 'doc-1' };
    let createManyCalled = false;
    prismaServiceMock.$transaction.mockImplementation(async (fn: Function) => {
      const tx = {
        document: { upsert: jest.fn().mockResolvedValue(mockDoc) },
        documentParagraph: {
          deleteMany: jest.fn().mockResolvedValue({}),
          createMany: jest.fn().mockImplementation(() => {
            createManyCalled = true;
            return {};
          }),
        },
      };
      return fn(tx);
    });
    prismaServiceMock.documentParagraph.findMany.mockResolvedValue([]);

    const context = new ExtractionContext({ uploadId: 'upload-1', jobId: 'job-1' });
    context.fileBuffer = Buffer.from('empty');

    await step.execute(context);

    expect(createManyCalled).toBe(false);
    expect(context.paragraphs).toEqual([]);
  });
});
