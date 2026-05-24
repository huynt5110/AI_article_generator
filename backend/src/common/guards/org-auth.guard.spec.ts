import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrgAuthGuard } from './org-auth.guard';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

describe('OrgAuthGuard', () => {
  let guard: OrgAuthGuard;
  let reflectorMock: any;
  let prismaServiceMock: any;

  beforeEach(() => {
    reflectorMock = {
      getAllAndOverride: jest.fn(),
    };
    prismaServiceMock = {
      organizationMember: {
        findUnique: jest.fn(),
      },
    };
    guard = new OrgAuthGuard(reflectorMock, prismaServiceMock);
  });

  afterEach(() => jest.clearAllMocks());

  function createMockContext(overrides?: {
    user?: any;
    headers?: Record<string, string>;
    hasUser?: boolean;
  }): ExecutionContext {
    const request: any = {
      headers: overrides?.headers ?? { 'x-organization-id': 'org-1' },
    };
    // Only set user if hasUser is not explicitly false
    if (overrides?.hasUser !== false) {
      request.user = overrides?.user ?? { sub: 'user-1' };
    }
    // If hasUser is false, don't set request.user at all (undefined)
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
      }),
    } as any;
  }

  describe('canActivate', () => {
    it('should return true for public routes', async () => {
      reflectorMock.getAllAndOverride.mockReturnValue(true);
      const context = createMockContext();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(prismaServiceMock.organizationMember.findUnique).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if no user on request', async () => {
      reflectorMock.getAllAndOverride.mockReturnValue(false);
      const context = createMockContext({ hasUser: false });

      await expect(guard.canActivate(context)).rejects.toThrow('User not authenticated');
    });

    it('should throw ForbiddenException if x-organization-id header is missing', async () => {
      reflectorMock.getAllAndOverride.mockReturnValue(false);
      const context = createMockContext({ headers: {} });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'x-organization-id header is required',
      );
    });

    it('should throw ForbiddenException if user is not a member of the org', async () => {
      reflectorMock.getAllAndOverride.mockReturnValue(false);
      prismaServiceMock.organizationMember.findUnique.mockResolvedValue(null);
      const context = createMockContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        'You do not have access to this organization',
      );
    });

    it('should return true and attach orgContext when membership is found', async () => {
      reflectorMock.getAllAndOverride.mockReturnValue(false);
      const mockMembership = {
        role: 'ADMIN',
        organization: { id: 'org-1', name: 'Test Org' },
      };
      prismaServiceMock.organizationMember.findUnique.mockResolvedValue(mockMembership);
      const context = createMockContext();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);

      // Verify orgContext was attached to request
      const request = context.switchToHttp().getRequest();
      expect(request.orgContext).toEqual({
        organization: mockMembership.organization,
        role: 'ADMIN',
      });
    });

    it('should query membership with correct composite key', async () => {
      reflectorMock.getAllAndOverride.mockReturnValue(false);
      prismaServiceMock.organizationMember.findUnique.mockResolvedValue({
        role: 'MEMBER',
        organization: { id: 'org-1' },
      });
      const context = createMockContext();

      await guard.canActivate(context);

      expect(prismaServiceMock.organizationMember.findUnique).toHaveBeenCalledWith({
        where: {
          userId_organizationId: {
            userId: 'user-1',
            organizationId: 'org-1',
          },
        },
        include: { organization: true },
      });
    });
  });
});
