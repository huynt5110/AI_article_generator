import { Test, TestingModule } from '@nestjs/testing';
import { ExtractionQueueService } from './extraction-queue.service';
import { getQueueToken } from '@nestjs/bullmq';
import {
  DEFAULT_JOB_ATTEMPTS,
  DEFAULT_JOB_BACKOFF_DELAY_MS,
  DOCUMENT_EXTRACTION_QUEUE,
  EXTRACTION_JOB_NAME,
} from '@app/shared';

describe('ExtractionQueueService', () => {
  let service: ExtractionQueueService;
  let queueMock: any;

  beforeEach(async () => {
    queueMock = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExtractionQueueService,
        {
          provide: getQueueToken(DOCUMENT_EXTRACTION_QUEUE),
          useValue: queueMock,
        },
      ],
    }).compile();

    service = module.get<ExtractionQueueService>(ExtractionQueueService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('enqueueExtraction', () => {
    const payload = {
      uploadId: 'upload-1',
      jobId: 'job-1',
    };

    it('should enqueue with correct job name, ID, and retry config', async () => {
      queueMock.add.mockResolvedValue({});

      await service.enqueueExtraction(payload);

      expect(queueMock.add).toHaveBeenCalledWith(EXTRACTION_JOB_NAME, payload, {
        jobId: 'job-1',
        attempts: DEFAULT_JOB_ATTEMPTS,
        backoff: {
          type: 'exponential',
          delay: DEFAULT_JOB_BACKOFF_DELAY_MS,
        },
      });
    });

    it('should propagate queue errors', async () => {
      queueMock.add.mockRejectedValue(new Error('Redis unavailable'));

      await expect(service.enqueueExtraction(payload)).rejects.toThrow('Redis unavailable');
    });
  });
});
