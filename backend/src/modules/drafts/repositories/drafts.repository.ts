import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ArticleDraft, DraftStatus, Prisma } from '@prisma/client';
import { IDraftsRepository } from './drafts.repository.interface';

@Injectable()
export class PrismaDraftsRepository implements IDraftsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const draft = await this.prisma.articleDraft.findUnique({
      where: { id },
      include: {
        provenances: true,
        upload: {
          include: {
            user: {
              include: {
                organizations: true
              }
            }
          }
        }
      },
    });
    
    if (!draft) throw new NotFoundException('Draft not found');

    return draft;
  }

  async list(params: {
    cursor?: string;
    limit: number;
    status?: DraftStatus;
    organizationIds: string[];
    userId: string;
  }) {
    const { cursor, limit, status, organizationIds, userId } = params;

    const where: Prisma.ArticleDraftWhereInput = {
      OR: [
        { upload: { userId: userId } },
        organizationIds.length > 0 ? {
          upload: {
            user: {
              organizations: {
                some: {
                  organizationId: { in: organizationIds }
                }
              }
            }
          }
        } : null,
      ].filter(Boolean) as Prisma.ArticleDraftWhereInput[],
      ...(status && { status }),
    };

    const drafts = await this.prisma.articleDraft.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { updatedAt: 'desc' },
      include: {
        upload: true
      }
    });

    let nextCursor: string | undefined = undefined;
    if (drafts.length > limit) {
      const nextItem = drafts.pop();
      nextCursor = nextItem?.id;
    }

    return { data: drafts, nextCursor };
  }

  async createRevision(draftId: string, userId: string, snapshot: any) {
    return this.prisma.articleRevision.create({
      data: {
        articleDraftId: draftId,
        editedByUserId: userId,
        snapshot,
      },
    });
  }

  async updatePartial(
    draftId: string, 
    structuredContent: any, 
    modifiedProvenanceIds: string[],
    updates?: { title?: string; hook?: string }
  ) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedDraft = await tx.articleDraft.update({
        where: { id: draftId },
        data: { 
          structuredContent,
          ...(updates?.title !== undefined && { title: updates.title }),
          ...(updates?.hook !== undefined && { hook: updates.hook }),
        },
      });

      if (modifiedProvenanceIds.length > 0) {
        await tx.provenance.updateMany({
          where: { id: { in: modifiedProvenanceIds } },
          data: { userModified: true },
        });
      }

      return updatedDraft;
    });
  }

  async listRevisions(draftId: string) {
    return this.prisma.articleRevision.findMany({
      where: { articleDraftId: draftId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
