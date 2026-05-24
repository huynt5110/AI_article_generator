import { Injectable, ForbiddenException } from '@nestjs/common';
import { ArticleDraft } from '@prisma/client';

@Injectable()
export class DraftsAccessPolicy {
  private extractOrgIds(user: any): string[] {
    return user.organizations?.map((org: any) => org.organizationId) || [];
  }

  canView(user: any, draft: any): boolean {
    const userOrgIds = this.extractOrgIds(user);
    const uploaderOrgIds = draft.upload?.user?.organizations?.map((org: any) => org.organizationId) || [];
    
    const hasOrgAccess = uploaderOrgIds.some((orgId: string) => userOrgIds.includes(orgId));
    const isOwner = draft.upload?.userId === user.id;

    return hasOrgAccess || isOwner;
  }

  canEdit(user: any, draft: any): boolean {
    // Only the original uploader (owner) can edit the draft
    return draft.upload?.userId === user.id;
  }

  enforceCanView(user: any, draft: any): void {
    if (!this.canView(user, draft)) {
      throw new ForbiddenException('You do not have access to view this draft');
    }
  }

  enforceCanEdit(user: any, draft: any): void {
    if (!this.canEdit(user, draft)) {
      throw new ForbiddenException('Only the owner can edit this draft');
    }
  }

  getUserOrgIds(user: any): string[] {
    return this.extractOrgIds(user);
  }
}
