import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeminiExtractionService } from './gemini-extraction.service';
import { GoogleGenAI } from '@google/genai';

jest.mock('@google/genai');

describe('GeminiExtractionService', () => {
  let service: GeminiExtractionService;
  let configService: ConfigService;
  let generateContentMock: jest.Mock;

  beforeEach(async () => {
    generateContentMock = jest.fn();

    // Mock GoogleGenAI implementation
    (GoogleGenAI as jest.Mock).mockImplementation(() => ({
      models: {
        generateContent: generateContentMock,
      },
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiExtractionService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockImplementation((key) => {
              if (key === 'gemini.apiKey') return 'test-api-key';
              if (key === 'gemini.model') return 'gemini-1.5-flash';
              throw new Error(`Unexpected config key: ${key}`);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<GeminiExtractionService>(GeminiExtractionService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractStructuredArticle', () => {
    const validJsonString = JSON.stringify({
      title: 'A trip to Paris',
      hook: 'You will love it.',
      sections: [{ heading: 'Day 1', body: 'We went to the Eiffel Tower.' }],
      bestFor: ['Couples'],
      notFor: ['Solo'],
      keyFacts: { duration: '3 days' },
      ethicsNotes: ['Be respectful'],
      provenance: [{ fieldPath: 'title', sourceParagraphKey: 'P1' }]
    });

    const mockParagraphs = [
      { paragraphKey: 'P1', text: 'Paris is great for couples. Duration was 3 days. We went to the Eiffel Tower.' }
    ];

    it('should successfully extract structured article and track token usage', async () => {
      generateContentMock.mockResolvedValue({
        text: validJsonString,
        usageMetadata: {
          promptTokenCount: 100,
          candidatesTokenCount: 50,
        },
      });

      const result = await service.extractStructuredArticle(mockParagraphs);

      expect(result).toBeDefined();
      expect(result.extraction.title).toBe('A trip to Paris');
      expect(result.tokenInput).toBe(100);
      expect(result.tokenOutput).toBe(50);
      expect(result.model).toBe('gemini-1.5-flash');
      expect(typeof result.latencyMs).toBe('number');
      
      expect(generateContentMock).toHaveBeenCalledTimes(1);
      const callArgs = generateContentMock.mock.calls[0][0];
      expect(callArgs.contents).toContain('[P1] Paris is great');
      expect(callArgs.config.systemInstruction).toContain('keyFacts (a flat key-value object');
    });

    it('should throw an error if Gemini returns empty content', async () => {
      generateContentMock.mockResolvedValue({
        text: '',
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 0 },
      });

      await expect(service.extractStructuredArticle(mockParagraphs)).rejects.toThrow('Gemini returned empty content');
    });

    it('should throw an error if Gemini returns non-JSON content', async () => {
      generateContentMock.mockResolvedValue({
        text: 'This is not JSON content.',
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
      });

      await expect(service.extractStructuredArticle(mockParagraphs)).rejects.toThrow('Gemini returned invalid JSON');
    });

    it('should throw a validation error if Gemini returns invalid schema (nested keyFacts)', async () => {
      const invalidJsonString = JSON.stringify({
        title: 'A trip to Paris',
        hook: 'You will love it.',
        sections: [{ heading: 'Day 1', body: 'We went to the Eiffel Tower.' }],
        bestFor: ['Couples'],
        notFor: ['Solo'],
        keyFacts: { duration: { days: 3 } }, // Nested object!
        ethicsNotes: ['Be respectful'],
        provenance: [{ fieldPath: 'title', sourceParagraphKey: 'P1' }]
      });

      generateContentMock.mockResolvedValue({
        text: invalidJsonString,
        usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 50 },
      });

      await expect(service.extractStructuredArticle(mockParagraphs)).rejects.toThrow();
    });

    it('should default token usage to 0 if usageMetadata is missing', async () => {
      generateContentMock.mockResolvedValue({
        text: validJsonString,
        // usageMetadata intentionally missing
      });

      const result = await service.extractStructuredArticle(mockParagraphs);
      expect(result.tokenInput).toBe(0);
      expect(result.tokenOutput).toBe(0);
    });
  });
});
