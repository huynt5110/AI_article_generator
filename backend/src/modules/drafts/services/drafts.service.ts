import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { DRAFTS_REPOSITORY } from '../repositories/drafts.repository.interface';
import type { IDraftsRepository } from '../repositories/drafts.repository.interface';
import { UpdateDraftDto } from '../dto/update-draft.dto';
import { DraftStatus } from '@prisma/client';
import { DraftsAccessPolicy } from '../policies/drafts-access.policy';
import { JsonPatchApplicator } from '../strategies/json-patch/json-patch.applicator';
import { DraftMapper } from '../mappers/draft.mapper';

@Injectable()
export class DraftsService {
  constructor(
    @Inject(DRAFTS_REPOSITORY)
    private readonly repository: IDraftsRepository,
    private readonly accessPolicy: DraftsAccessPolicy,
    private readonly patchApplicator: JsonPatchApplicator,
    private readonly draftMapper: DraftMapper,
  ) {}

  async listDrafts(user: any, cursor?: string, limit = 20, status?: DraftStatus) {
    const organizationIds = this.accessPolicy.getUserOrgIds(user);
    if (organizationIds.length === 0) return { data: [], meta: { hasNextPage: false } };

    const { data, nextCursor } = await this.repository.list({
      cursor,
      limit,
      status,
      organizationIds,
    });

    return {
      data: this.draftMapper.toListResponseDto(data),
      meta: {
        cursor: nextCursor,
        hasNextPage: !!nextCursor,
      },
    };
  }

  async getDraftDetail(user: any, id: string) {
    const draft = await this.repository.findById(id);
    
    // Evaluate Access Policy
    this.accessPolicy.enforceCanView(user, draft);

    return this.draftMapper.toResponseDto(draft);
  }

  async updateDraft(user: any, id: string, dto: UpdateDraftDto) {
    const draft = await this.repository.findById(id);
    
    // Evaluate Access Policy
    this.accessPolicy.enforceCanEdit(user, draft);

    // 1. Create Revision snapshot
    await this.repository.createRevision(id, user.id, draft.structuredContent);

    // 2. Apply partial updates using Strategy Pattern (JsonPatchApplicator)
    const updatedContent = this.patchApplicator.apply(draft.structuredContent, dto.operations);
    
    const modifiedProvenanceIds: string[] = [];

    // Track provenance modifications
    for (const op of dto.operations) {
      const matchingProvenance = draft.provenances?.find((p: any) => p.fieldPath === op.path);
      if (matchingProvenance) {
        modifiedProvenanceIds.push(matchingProvenance.id);
      }
    }

    // 3. Save
    await this.repository.updatePartial(id, updatedContent, modifiedProvenanceIds);
    return this.getDraftDetail(user, id);
  }

  async listRevisions(user: any, id: string) {
    // Check access first
    const draft = await this.repository.findById(id);
    this.accessPolicy.enforceCanView(user, draft);
    
    return this.repository.listRevisions(id);
  }
}

