import { Injectable } from '@nestjs/common';
import { DocxParserService } from '../../services/docx-parser.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { ExtractionContext } from '../extraction.context';
import type { PipelineStep } from '../pipeline-step.interface';

@Injectable()
export class ParseDocumentStep implements PipelineStep {
  readonly name = 'parse-document';

  constructor(
    private readonly prisma: PrismaService,
    private readonly docxParser: DocxParserService,
  ) {}

  async execute(context: ExtractionContext): Promise<void> {
    if (!context.fileBuffer) {
      throw new Error('File buffer missing — run load-upload step first');
    }

    context.parsedDocument = await this.docxParser.parse(context.fileBuffer);

    const parsed = context.parsedDocument;

    context.document = await this.prisma.$transaction(async (tx) => {
      const doc = await tx.document.upsert({
        where: { uploadId: context.uploadId },
        create: {
          uploadId: context.uploadId,
          extractedText: parsed.extractedText,
        },
        update: { extractedText: parsed.extractedText },
      });

      await tx.documentParagraph.deleteMany({ where: { documentId: doc.id } });

      if (parsed.paragraphs.length > 0) {
        await tx.documentParagraph.createMany({
          data: parsed.paragraphs.map((p) => ({
            documentId: doc.id,
            paragraphKey: p.paragraphKey,
            text: p.text,
            orderIndex: p.orderIndex,
          })),
        });
      }

      return doc;
    });

    context.paragraphs = await this.prisma.documentParagraph.findMany({
      where: { documentId: context.document.id },
      orderBy: { orderIndex: 'asc' },
    });
  }
}
