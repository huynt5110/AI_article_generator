import { DraftStatus } from '@prisma/client';

export const DRAFTS_REPOSITORY = Symbol('DRAFTS_REPOSITORY');

export interface IDraftsRepository {
  findById(id: string): Promise<any>;
  list(params: { cursor?: string; limit: number; status?: DraftStatus; organizationIds: string[]; userId: string }): Promise<{ data: any[]; nextCursor?: string }>;
  createRevision(draftId: string, userId: string, snapshot: any): Promise<any>;
  updatePartial(draftId: string, structuredContent: any, modifiedProvenanceIds: string[], updates?: { title?: string; hook?: string }): Promise<any>;
  listRevisions(draftId: string): Promise<any[]>;
}
