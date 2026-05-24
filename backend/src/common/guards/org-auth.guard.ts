import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ForbiddenException, UnauthorizedException } from '../exceptions/application.exception';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class OrgAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Set by JwtAuthGuard

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const orgId = request.headers['x-organization-id'];

    if (!orgId) {
      throw new ForbiddenException('x-organization-id header is required');
    }

    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.sub,
          organizationId: orgId as string,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this organization');
    }

    // Attach orgContext to the request so @CurrentOrg can extract it
    request.orgContext = {
      organization: membership.organization,
      role: membership.role,
    };

    return true;
  }
}
