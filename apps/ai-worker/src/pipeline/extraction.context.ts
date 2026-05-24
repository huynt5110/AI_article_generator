import type { Upload, Document, DocumentParagraph } from '@prisma/client';
import type { ExtractionJobPayload } from '@app/shared';
import type { ParsedDocument } from '../services/docx-parser.service';
import type { ExtractionResult } from '../services/gemini-extraction.service';

export class ExtractionContext {
  readonly payload: ExtractionJobPayload;

  upload?: Upload;
  fileBuffer?: Buffer;
  parsedDocument?: ParsedDocument;
  document?: Document;
  paragraphs: DocumentParagraph[] = [];
  aiResult?: ExtractionResult;

  constructor(payload: ExtractionJobPayload) {
    this.payload = payload;
  }

  get uploadId(): string {
    return this.payload.uploadId;
  }

  get jobId(): string {
    return this.payload.jobId;
  }
}
