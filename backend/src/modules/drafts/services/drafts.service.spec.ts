import { Test, TestingModule } from '@nestjs/testing';
import { DraftsService } from './drafts.service';
import { DRAFTS_REPOSITORY } from '../repositories/drafts.repository.interface';
import { DraftsAccessPolicy } from '../policies/drafts-access.policy';
import { JsonPatchApplicator } from '../strategies/json-patch/json-patch.applicator';
import { DraftMapper } from '../mappers/draft.mapper';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

describe('DraftsService', () => {
  let service: DraftsService;
  let repositoryMock: any;
  let accessPolicyMock: any;
  let patchApplicatorMock: any;
  let draftMapperMock: any;
  let prismaServiceMock: any;

  beforeEach(async () => {
    repositoryMock = {
      list: jest.fn(),
      findById: jest.fn(),
      createRevision: jest.fn(),
      updatePartial: jest.fn(),
      listRevisions: jest.fn(),
    };

    accessPolicyMock = {
      getUserOrgIds: jest.fn(),
      enforceCanView: jest.fn(),
      enforceCanEdit: jest.fn(),
    };

    patchApplicatorMock = {
      apply: jest.fn(),
    };

    draftMapperMock = {
      toListResponseDto: jest.fn(),
      toResponseDto: jest.fn(),
    };

    prismaServiceMock = {
      extractionJob: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DraftsService,
        { provide: DRAFTS_REPOSITORY, useValue: repositoryMock },
        { provide: DraftsAccessPolicy, useValue: accessPolicyMock },
        { provide: JsonPatchApplicator, useValue: patchApplicatorMock },
        { provide: DraftMapper, useValue: draftMapperMock },
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<DraftsService>(DraftsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listDrafts', () => {
    const mockUser = { sub: 'user-123' };

    it('should return a list of drafts and set isProcessing to false if no active jobs', async () => {
      accessPolicyMock.getUserOrgIds.mockResolvedValue(['org-1']);
      repositoryMock.list.mockResolvedValue({
        data: [{ id: 'draft-1' }],
        nextCursor: 'draft-2',
      });
      draftMapperMock.toListResponseDto.mockReturnValue([{ id: 'draft-1', mapped: true }]);
      prismaServiceMock.extractionJob.count.mockResolvedValue(0);

      const result = await service.listDrafts(mockUser, 'cursor-1', 10);

      expect(accessPolicyMock.getUserOrgIds).toHaveBeenCalledWith(mockUser);
      expect(repositoryMock.list).toHaveBeenCalledWith({
        cursor: 'cursor-1',
        limit: 10,
        status: undefined,
        organizationIds: ['org-1'],
        userId: 'user-123',
      });
      expect(prismaServiceMock.extractionJob.count).toHaveBeenCalledWith({
        where: {
          upload: { userId: 'user-123' },
          status: { notIn: ['COMPLETED', 'FAILED'] },
        },
      });
      expect(result.data).toEqual([{ id: 'draft-1', mapped: true }]);
      expect(result.meta).toEqual({
        cursor: 'draft-2',
        hasNextPage: true,
        isProcessing: false,
      });
    });

    it('should set isProcessing to true if there are active jobs', async () => {
      accessPolicyMock.getUserOrgIds.mockResolvedValue([]);
      repositoryMock.list.mockResolvedValue({
        data: [],
        nextCursor: undefined,
      });
      draftMapperMock.toListResponseDto.mockReturnValue([]);
      prismaServiceMock.extractionJob.count.mockResolvedValue(2); // 2 active jobs

      const result = await service.listDrafts(mockUser, undefined, 20);

      expect(result.meta.isProcessing).toBe(true);
      expect(result.meta.hasNextPage).toBe(false);
    });
  });

  describe('getDraftDetail', () => {
    const mockUser = { sub: 'user-123' };

    it('should return draft detail if access is allowed', async () => {
      const mockDraft = { id: 'draft-1' };
      repositoryMock.findById.mockResolvedValue(mockDraft);
      accessPolicyMock.enforceCanView.mockResolvedValue(undefined);
      draftMapperMock.toResponseDto.mockReturnValue({ id: 'draft-1', mapped: true });

      const result = await service.getDraftDetail(mockUser, 'draft-1');

      expect(repositoryMock.findById).toHaveBeenCalledWith('draft-1');
      expect(accessPolicyMock.enforceCanView).toHaveBeenCalledWith(mockUser, mockDraft);
      expect(result).toEqual({ id: 'draft-1', mapped: true });
    });

    it('should throw if access policy denies view', async () => {
      const mockDraft = { id: 'draft-1' };
      repositoryMock.findById.mockResolvedValue(mockDraft);
      const error = new Error('Forbidden');
      accessPolicyMock.enforceCanView.mockRejectedValue(error);

      await expect(service.getDraftDetail(mockUser, 'draft-1')).rejects.toThrow('Forbidden');
    });
  });

  describe('updateDraft', () => {
    const mockUser = { sub: 'user-123' };

    it('should update draft and sync top-level fields', async () => {
      const mockDraft = {
        id: 'draft-1',
        structuredContent: { title: 'Old Title', hook: 'Old Hook' },
        provenances: [{ id: 'prov-1', fieldPath: '/title' }],
      };
      const updateDto = {
        title: 'New Title',
        hook: 'New Hook',
        operations: [{ op: 'replace' as any, path: '/title', value: 'New Title' }],
      };

      repositoryMock.findById.mockResolvedValue(mockDraft);
      accessPolicyMock.enforceCanEdit.mockReturnValue(undefined);
      patchApplicatorMock.apply.mockReturnValue({ title: 'New Title', hook: 'New Hook' });
      
      // getDraftDetail is called at the end
      accessPolicyMock.enforceCanView.mockResolvedValue(undefined);
      draftMapperMock.toResponseDto.mockReturnValue({ id: 'draft-1', updated: true });

      const result = await service.updateDraft(mockUser, 'draft-1', updateDto);

      expect(accessPolicyMock.enforceCanEdit).toHaveBeenCalledWith(mockUser, mockDraft);
      expect(repositoryMock.createRevision).toHaveBeenCalledWith('draft-1', 'user-123', mockDraft.structuredContent);
      expect(patchApplicatorMock.apply).toHaveBeenCalledWith(mockDraft.structuredContent, updateDto.operations);
      
      expect(repositoryMock.updatePartial).toHaveBeenCalledWith(
        'draft-1',
        { title: 'New Title', hook: 'New Hook' },
        ['prov-1'], // because path '/title' matched provenances
        { title: 'New Title', hook: 'New Hook' }
      );

      expect(result).toEqual({ id: 'draft-1', updated: true });
    });
  });
});
