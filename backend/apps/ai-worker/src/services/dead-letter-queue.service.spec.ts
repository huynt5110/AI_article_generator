import { DeadLetterQueueService } from './dead-letter-queue.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { DEAD_LETTER_JOB_NAME, DOCUMENT_EXTRACTION_DLQ } from '@app/shared';
import type { Job } from 'bullmq';

describe('DeadLetterQueueService', () => {
  let service: DeadLetterQueueService;
  let dlqMock: any;

  beforeEach(async () => {
    dlqMock = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeadLetterQueueService,
        {
          provide: getQueueToken(DOCUMENT_EXTRACTION_DLQ),
          useValue: dlqMock,
        },
      ],
    }).compile();

    service = module.get<DeadLetterQueueService>(DeadLetterQueueService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('enqueue', () => {
    const originalPayload = { uploadId: 'upload-1', jobId: 'job-1' };
    const mockJob = {
      id: 'queue-job-123',
      attemptsMade: 3,
    } as unknown as Job<any>;
    const mockError = new Error('Gemini API rate limit');
    mockError.stack = 'Error: Gemini API rate limit\n    at ...';

    it('should enqueue with correct DLQ payload and options', async () => {
      dlqMock.add.mockResolvedValue({});

      await service.enqueue(originalPayload, mockJob, mockError);

      expect(dlqMock.add).toHaveBeenCalledWith(
        DEAD_LETTER_JOB_NAME,
        {
          original: originalPayload,
          queueJobId: 'queue-job-123',
          errorMessage: 'Gemini API rate limit',
          errorStack: mockError.stack,
          attempts: 3,
          failedAt: expect.any(String),
        },
        {
          jobId: 'dlq-job-1',
          removeOnComplete: false,
          removeOnFail: false,
        },
      );
    });

    it('should handle null job.id gracefully', async () => {
      dlqMock.add.mockResolvedValue({});
      const jobWithNullId = { id: undefined, attemptsMade: 1 } as unknown as Job<any>;

      await service.enqueue(originalPayload, jobWithNullId, mockError);

      const callPayload = dlqMock.add.mock.calls[0][1];
      expect(callPayload.queueJobId).toBeNull();
    });

    it('should handle error without stack trace', async () => {
      dlqMock.add.mockResolvedValue({});
      const errorNoStack = new Error('No stack');
      errorNoStack.stack = undefined;

      await service.enqueue(originalPayload, mockJob, errorNoStack);

      const callPayload = dlqMock.add.mock.calls[0][1];
      expect(callPayload.errorStack).toBeNull();
    });

    it('should propagate DLQ queue errors', async () => {
      dlqMock.add.mockRejectedValue(new Error('DLQ Redis down'));

      await expect(
        service.enqueue(originalPayload, mockJob, mockError),
      ).rejects.toThrow('DLQ Redis down');
    });
  });
});
