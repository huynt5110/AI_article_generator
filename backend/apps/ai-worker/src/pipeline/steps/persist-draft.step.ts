import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { ProvenanceItem } from '@app/shared';
import type { ExtractionContext } from '../extraction.context';
import type { PipelineStep } from '../pipeline-step.interface';

@Injectable()
export class PersistDraftStep implements PipelineStep {
  readonly name = 'persist-draft';

  constructor(private readonly prisma: PrismaService) {}

  async execute(context: ExtractionContext): Promise<void> {
    if (!context.aiResult) {
      throw new Error('AI result missing — run ai-extract step first');
    }

    const { extraction } = context.aiResult;
    const paragraphByKey = new Map(
      context.paragraphs.map((p) => [p.paragraphKey, p.text]),
    );

    const structuredContent: Prisma.InputJsonValue = {
      title: extraction.title,
      hook: extraction.hook,
      sections: extraction.sections,
      bestFor: extraction.bestFor,
      notFor: extraction.notFor,
      keyFacts: extraction.keyFacts as Prisma.InputJsonValue,
      ethicsNotes: extraction.ethicsNotes,
    };

    await this.prisma.$transaction(async (tx) => {
      const draft = await tx.articleDraft.upsert({
        where: { uploadId: context.uploadId },
        create: {
          uploadId: context.uploadId,
          title: extraction.title,
          hook: extraction.hook,
          structuredContent,
        },
        update: {
          title: extraction.title,
          hook: extraction.hook,
          structuredContent,
        },
      });

      await tx.provenance.deleteMany({ where: { articleDraftId: draft.id } });

      const provenanceRows = extraction.provenance.map((item: ProvenanceItem) => ({
        articleDraftId: draft.id,
        fieldPath: item.fieldPath,
        sourceParagraphKey: item.sourceParagraphKey,
        sourceText:
          paragraphByKey.get(item.sourceParagraphKey) ??
          `[missing paragraph ${item.sourceParagraphKey}]`,
      }));

      if (provenanceRows.length > 0) {
        await tx.provenance.createMany({ data: provenanceRows });
      }
    });
  }
}
