import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import {
  articleExtractionSchema,
  PROMPT_VERSION,
  type ArticleExtraction,
} from '@app/shared';

export interface ExtractionResult {
  extraction: ArticleExtraction;
  model: string;
  promptVersion: string;
  tokenInput: number;
  tokenOutput: number;
  latencyMs: number;
}

const SYSTEM_INSTRUCTION = `You extract structured travel article data from travel notes.
Return JSON only with keys: title, hook, sections (array of {heading, body}),
bestFor, notFor, keyFacts (a flat key-value object with no nested objects, e.g. {"duration": "3 days"}), ethicsNotes, provenance.
provenance is an array of {fieldPath, sourceParagraphKey} linking claims to paragraph keys.
Use only paragraph keys that appear in the source. Do not invent paragraph keys.`;

@Injectable()
export class GeminiExtractionService {
  private readonly logger = new Logger(GeminiExtractionService.name);
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new GoogleGenAI({
      apiKey: this.configService.getOrThrow<string>('gemini.apiKey'),
    });
    this.model = this.configService.getOrThrow<string>('gemini.model');
  }

  async extractStructuredArticle(
    paragraphs: { paragraphKey: string; text: string }[],
  ): Promise<ExtractionResult> {
    const startedAt = Date.now();

    const paragraphContext = paragraphs
      .map((p) => `[${p.paragraphKey}] ${p.text}`)
      .join('\n\n');

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: `Extract a structured travel article from these paragraphs:\n\n${paragraphContext}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        maxOutputTokens: 14000,
      },
    });

    const latencyMs = Date.now() - startedAt;
    const content = response.text;

    if (!content) {
      throw new Error('Gemini returned empty content');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      this.logger.error(`Gemini returned non-JSON content: ${content.slice(0, 200)}`);
      throw new Error('Gemini returned invalid JSON');
    }

    const extraction = articleExtractionSchema.parse(parsed);

    return {
      extraction,
      model: this.model,
      promptVersion: PROMPT_VERSION,
      tokenInput: response.usageMetadata?.promptTokenCount ?? 0,
      tokenOutput: response.usageMetadata?.candidatesTokenCount ?? 0,
      latencyMs,
    };
  }
}
