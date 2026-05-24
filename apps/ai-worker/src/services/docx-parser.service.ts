import { Injectable } from '@nestjs/common';
import mammoth from 'mammoth';

export interface ParsedParagraph {
  paragraphKey: string;
  text: string;
  orderIndex: number;
}

export interface ParsedDocument {
  extractedText: string;
  paragraphs: ParsedParagraph[];
}

@Injectable()
export class DocxParserService {
  async parse(buffer: Buffer): Promise<ParsedDocument> {
    const result = await mammoth.extractRawText({ buffer });
    const rawText = result.value.trim();

    const chunks = rawText
      .split(/\n\s*\n/)
      .map((chunk) => chunk.replace(/\s+/g, ' ').trim())
      .filter((chunk) => chunk.length > 0);

    const paragraphs: ParsedParagraph[] = chunks.map((text, index) => ({
      paragraphKey: `p${index + 1}`,
      text,
      orderIndex: index,
    }));

    return {
      extractedText: rawText,
      paragraphs,
    };
  }
}
