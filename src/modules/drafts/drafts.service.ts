import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class DraftsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDraft(draftId: string, userId: string) {
    const draft = await this.prisma.articleDraft.findFirst({
      where: {
        id: draftId,
        upload: { userId },
      },
      include: {
        provenance: {
          orderBy: { createdAt: 'asc' },
        },
        upload: {
          select: { id: true, originalName: true },
        },
      },
    });

    if (!draft) {
      throw new NotFoundException('Article draft not found');
    }

    return {
      draftId: draft.id,
      uploadId: draft.uploadId,
      title: draft.title,
      hook: draft.hook,
      structuredContent: draft.structuredContent,
      status: draft.status,
      provenance: draft.provenance.map((p) => ({
        fieldPath: p.fieldPath,
        sourceParagraphKey: p.sourceParagraphKey,
        sourceText: p.sourceText,
      })),
      upload: draft.upload,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
  }
}
