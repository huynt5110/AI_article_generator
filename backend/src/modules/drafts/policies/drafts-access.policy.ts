import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

@Injectable()
export class DraftsAccessPolicy {
  constructor(private readonly prisma: PrismaService) {}

  private async extractOrgIds(user: any): Promise<string[]> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: { organizations: true }
    });
    return dbUser?.organizations?.map((org: any) => org.organizationId) || [];
  }

  async canView(user: any, draft: any): Promise<boolean> {
    const userOrgIds = await this.extractOrgIds(user);
    const uploaderOrgIds = draft.upload?.user?.organizations?.map((org: any) => org.organizationId) || [];
    
    const hasOrgAccess = uploaderOrgIds.some((orgId: string) => userOrgIds.includes(orgId));
    const isOwner = draft.upload?.userId === user.sub;

    return hasOrgAccess || isOwner;
  }

  canEdit(user: any, draft: any): boolean {
    // Only the original uploader (owner) can edit the draft
    return draft.upload?.userId === user.sub;
  }

  async enforceCanView(user: any, draft: any): Promise<void> {
    const can = await this.canView(user, draft);
    if (!can) {
      throw new ForbiddenException('You do not have access to view this draft');
    }
  }

  enforceCanEdit(user: any, draft: any): void {
    if (!this.canEdit(user, draft)) {
      throw new ForbiddenException('Only the owner can edit this draft');
    }
  }

  async getUserOrgIds(user: any): Promise<string[]> {
    return this.extractOrgIds(user);
  }
}
