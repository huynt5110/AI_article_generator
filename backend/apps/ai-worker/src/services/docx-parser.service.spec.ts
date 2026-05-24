import { DocxParserService } from './docx-parser.service';
import mammoth from 'mammoth';

jest.mock('mammoth');

describe('DocxParserService', () => {
  let service: DocxParserService;

  beforeEach(() => {
    service = new DocxParserService();
  });

  afterEach(() => jest.clearAllMocks());

  describe('parse', () => {
    it('should parse a buffer with multiple paragraphs', async () => {
      (mammoth.extractRawText as jest.Mock).mockResolvedValue({
        value: 'First paragraph about Paris.\n\nSecond paragraph about Rome.\n\nThird paragraph about Tokyo.',
      });

      const result = await service.parse(Buffer.from('fake'));

      expect(result.extractedText).toBe(
        'First paragraph about Paris.\n\nSecond paragraph about Rome.\n\nThird paragraph about Tokyo.',
      );
      expect(result.paragraphs).toHaveLength(3);
      expect(result.paragraphs[0]).toEqual({
        paragraphKey: 'p1',
        text: 'First paragraph about Paris.',
        orderIndex: 0,
      });
      expect(result.paragraphs[2].paragraphKey).toBe('p3');
    });

    it('should handle single paragraph document', async () => {
      (mammoth.extractRawText as jest.Mock).mockResolvedValue({
        value: 'Only one paragraph here.',
      });

      const result = await service.parse(Buffer.from('fake'));

      expect(result.paragraphs).toHaveLength(1);
      expect(result.paragraphs[0]).toEqual({
        paragraphKey: 'p1',
        text: 'Only one paragraph here.',
        orderIndex: 0,
      });
    });

    it('should filter out empty/whitespace-only paragraphs', async () => {
      (mammoth.extractRawText as jest.Mock).mockResolvedValue({
        value: 'Real content.\n\n   \n\n\n\nMore real content.',
      });

      const result = await service.parse(Buffer.from('fake'));

      expect(result.paragraphs).toHaveLength(2);
      expect(result.paragraphs[0].text).toBe('Real content.');
      expect(result.paragraphs[1].text).toBe('More real content.');
    });

    it('should collapse multiple whitespace within paragraphs', async () => {
      (mammoth.extractRawText as jest.Mock).mockResolvedValue({
        value: 'Hello    world   with   extra    spaces.',
      });

      const result = await service.parse(Buffer.from('fake'));

      expect(result.paragraphs[0].text).toBe('Hello world with extra spaces.');
    });

    it('should return empty paragraphs for empty document', async () => {
      (mammoth.extractRawText as jest.Mock).mockResolvedValue({
        value: '   \n\n   ',
      });

      const result = await service.parse(Buffer.from('fake'));

      expect(result.paragraphs).toHaveLength(0);
      expect(result.extractedText).toBe('');
    });

    it('should propagate mammoth errors', async () => {
      (mammoth.extractRawText as jest.Mock).mockRejectedValue(
        new Error('Corrupt DOCX file'),
      );

      await expect(service.parse(Buffer.from('corrupt'))).rejects.toThrow(
        'Corrupt DOCX file',
      );
    });
  });
});
