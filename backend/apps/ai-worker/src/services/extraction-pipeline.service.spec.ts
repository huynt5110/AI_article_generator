import { Test, TestingModule } from '@nestjs/testing';
import { ExtractionPipelineService } from './extraction-pipeline.service';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { ExtractionPipelineBuilder } from '../pipeline/extraction-pipeline.builder';

describe('ExtractionPipelineService', () => {
  let service: ExtractionPipelineService;
  let prismaServiceMock: any;
  let pipelineBuilderMock: any;
  let pipelineRunnerMock: any;

  beforeEach(async () => {
    pipelineRunnerMock = {
      run: jest.fn(),
    };

    prismaServiceMock = {
      extractionJob: {
        update: jest.fn(),
      },
    };

    pipelineBuilderMock = {
      buildDefault: jest.fn().mockReturnValue(pipelineRunnerMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExtractionPipelineService,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: ExtractionPipelineBuilder, useValue: pipelineBuilderMock },
      ],
    }).compile();

    service = module.get<ExtractionPipelineService>(ExtractionPipelineService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('process', () => {
    it('should build and run the default pipeline', async () => {
      pipelineRunnerMock.run.mockResolvedValue(undefined);

      await service.process({ uploadId: 'upload-1', jobId: 'job-1' });

      expect(pipelineBuilderMock.buildDefault).toHaveBeenCalledTimes(1);
      expect(pipelineRunnerMock.run).toHaveBeenCalledTimes(1);

      // Verify the context has the correct payload
      const contextArg = pipelineRunnerMock.run.mock.calls[0][0];
      expect(contextArg.uploadId).toBe('upload-1');
      expect(contextArg.jobId).toBe('job-1');
    });

    it('should propagate pipeline errors', async () => {
      pipelineRunnerMock.run.mockRejectedValue(new Error('Step failed'));

      await expect(
        service.process({ uploadId: 'u-1', jobId: 'j-1' }),
      ).rejects.toThrow('Step failed');
    });
  });

  describe('markFailed', () => {
    it('should update extraction job with FAILED status', async () => {
      prismaServiceMock.extractionJob.update.mockResolvedValue({});
      const error = new Error('Some extraction failure');

      await service.markFailed('job-1', error);

      expect(prismaServiceMock.extractionJob.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: {
          status: 'FAILED',
          errorMessage: 'Some extraction failure',
          completedAt: expect.any(Date),
        },
      });
    });

    it('should truncate error messages longer than 2000 characters', async () => {
      prismaServiceMock.extractionJob.update.mockResolvedValue({});
      const longMessage = 'x'.repeat(3000);
      const error = new Error(longMessage);

      await service.markFailed('job-1', error);

      const updateData = prismaServiceMock.extractionJob.update.mock.calls[0][0].data;
      expect(updateData.errorMessage).toHaveLength(2000);
    });
  });
});
