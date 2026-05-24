import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let prismaServiceMock: any;

  beforeEach(async () => {
    prismaServiceMock = {
      organization: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      organizationMember: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create an organization with the user as OWNER', async () => {
      prismaServiceMock.organization.findUnique.mockResolvedValue(null);
      const mockOrg = { id: 'org-1', name: 'My Org', slug: 'my-org' };
      prismaServiceMock.organization.create.mockResolvedValue(mockOrg);

      const result = await service.create('user-1', {
        name: 'My Org',
        slug: 'my-org',
      });

      expect(result).toEqual(mockOrg);
      expect(prismaServiceMock.organization.create).toHaveBeenCalledWith({
        data: {
          name: 'My Org',
          slug: 'my-org',
          members: {
            create: {
              userId: 'user-1',
              role: 'OWNER',
            },
          },
        },
      });
    });

    it('should throw ConflictException if slug already exists', async () => {
      prismaServiceMock.organization.findUnique.mockResolvedValue({
        id: 'existing',
        slug: 'my-org',
      });

      await expect(
        service.create('user-1', { name: 'My Org', slug: 'my-org' }),
      ).rejects.toThrow('Organization with this slug already exists');
    });
  });

  describe('findByUserId', () => {
    it('should return all organizations for a user', async () => {
      const mockMemberships = [
        { organization: { id: 'org-1', name: 'Org 1' } },
        { organization: { id: 'org-2', name: 'Org 2' } },
      ];
      prismaServiceMock.organizationMember.findMany.mockResolvedValue(mockMemberships);

      const result = await service.findByUserId('user-1');

      expect(result).toEqual([
        { id: 'org-1', name: 'Org 1' },
        { id: 'org-2', name: 'Org 2' },
      ]);
    });

    it('should return empty array when user has no organizations', async () => {
      prismaServiceMock.organizationMember.findMany.mockResolvedValue([]);

      const result = await service.findByUserId('lonely-user');

      expect(result).toEqual([]);
    });
  });

  describe('verifyMembership', () => {
    it('should return isMember true and role when membership exists', async () => {
      prismaServiceMock.organizationMember.findUnique.mockResolvedValue({
        role: 'ADMIN',
      });

      const result = await service.verifyMembership('user-1', 'org-1');

      expect(result).toEqual({ isMember: true, role: 'ADMIN' });
    });

    it('should return isMember false when no membership found', async () => {
      prismaServiceMock.organizationMember.findUnique.mockResolvedValue(null);

      const result = await service.verifyMembership('user-1', 'org-2');

      expect(result).toEqual({ isMember: false, role: undefined });
    });
  });
});
