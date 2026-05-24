import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Organization, Role } from '@prisma/client';

export interface OrgContext {
  organization: Organization;
  role: Role;
}

export const CurrentOrg = createParamDecorator(
  (data: keyof OrgContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const orgContext = request.orgContext as OrgContext;

    if (!orgContext) {
      return null;
    }

    return data ? orgContext[data] : orgContext;
  },
);
