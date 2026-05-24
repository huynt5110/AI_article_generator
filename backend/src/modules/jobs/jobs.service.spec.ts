import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('JobsService', () => {
  let service: JobsService;
  let prismaServiceMock: any;

  beforeEach(async () => {
    prismaServiceMock = {
      extractionJob: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getJobStatus', () => {
    const mockJob = {
      id: 'job-1',
      uploadId: 'upload-1',
      status: 'COMPLETED',
      model: 'gemini-1.5-flash',
      promptVersion: 'v1',
      tokenInput: 100,
      tokenOutput: 50,
      latencyMs: 2500,
      errorMessage: null,
      startedAt: new Date('2024-01-01T10:00:00Z'),
      completedAt: new Date('2024-01-01T10:00:03Z'),
      createdAt: new Date('2024-01-01T09:59:00Z'),
      updatedAt: new Date('2024-01-01T10:00:03Z'),
      upload: { id: 'upload-1', originalName: 'test.docx', status: 'UPLOADED' },
    };

    it('should return the job status with all fields mapped', async () => {
      prismaServiceMock.extractionJob.findFirst.mockResolvedValue(mockJob);

      const result = await service.getJobStatus('job-1', 'user-1');

      expect(result).toEqual({
        jobId: 'job-1',
        uploadId: 'upload-1',
        status: 'COMPLETED',
        model: 'gemini-1.5-flash',
        promptVersion: 'v1',
        tokenInput: 100,
        tokenOutput: 50,
        latencyMs: 2500,
        errorMessage: null,
        startedAt: mockJob.startedAt,
        completedAt: mockJob.completedAt,
        createdAt: mockJob.createdAt,
        updatedAt: mockJob.updatedAt,
        upload: mockJob.upload,
      });

      expect(prismaServiceMock.extractionJob.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'job-1',
          upload: { userId: 'user-1' },
        },
        include: {
          upload: {
            select: { id: true, originalName: true, status: true },
          },
        },
      });
    });

    it('should throw NotFoundException if job does not exist', async () => {
      prismaServiceMock.extractionJob.findFirst.mockResolvedValue(null);

      await expect(service.getJobStatus('bad-id', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if job belongs to another user', async () => {
      // Prisma findFirst with upload.userId filter returns null for other users
      prismaServiceMock.extractionJob.findFirst.mockResolvedValue(null);

      await expect(service.getJobStatus('job-1', 'other-user')).rejects.toThrow(
        'Extraction job not found',
      );
    });
  });
});
