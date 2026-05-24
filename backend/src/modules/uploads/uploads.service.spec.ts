import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { S3Service } from './storage/s3.service';
import { ExtractionQueueService } from '../extraction/extraction-queue.service';

describe('UploadsService', () => {
  let service: UploadsService;
  let prismaServiceMock: any;
  let s3ServiceMock: any;
  let extractionQueueMock: any;

  beforeEach(async () => {
    prismaServiceMock = {
      $transaction: jest.fn(),
    };

    s3ServiceMock = {
      uploadFile: jest.fn(),
      bucket: 'test-bucket',
    };

    extractionQueueMock = {
      enqueueExtraction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: S3Service, useValue: s3ServiceMock },
        { provide: ExtractionQueueService, useValue: extractionQueueMock },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('uploadFileDirectly', () => {
    const mockFile = {
      originalname: 'travel-notes.docx',
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 1024,
      buffer: Buffer.from('fake-file-content'),
    } as Express.Multer.File;

    it('should upload to S3, create DB records, and enqueue extraction', async () => {
      s3ServiceMock.uploadFile.mockResolvedValue(undefined);
      prismaServiceMock.$transaction.mockImplementation(async (fn: Function) => {
        const tx = {
          upload: {
            create: jest.fn().mockResolvedValue({
              id: 'upload-1',
              userId: 'user-1',
            }),
          },
          extractionJob: {
            create: jest.fn().mockResolvedValue({
              id: 'job-1',
              uploadId: 'upload-1',
              status: 'QUEUED',
            }),
          },
        };
        return fn(tx);
      });
      extractionQueueMock.enqueueExtraction.mockResolvedValue(undefined);

      const result = await service.uploadFileDirectly(mockFile, 'user-1');

      expect(result).toEqual({
        uploadId: 'upload-1',
        jobId: 'job-1',
        status: 'QUEUED',
      });
      expect(s3ServiceMock.uploadFile).toHaveBeenCalledWith(
        mockFile.buffer,
        expect.stringContaining('uploads/user-1/'),
        mockFile.mimetype,
      );
      expect(extractionQueueMock.enqueueExtraction).toHaveBeenCalledWith({
        uploadId: 'upload-1',
        jobId: 'job-1',
      });
    });

    it('should propagate S3 upload errors before creating DB records', async () => {
      s3ServiceMock.uploadFile.mockRejectedValue(new Error('S3 connection timeout'));

      await expect(service.uploadFileDirectly(mockFile, 'user-1')).rejects.toThrow(
        'S3 connection timeout',
      );
      expect(prismaServiceMock.$transaction).not.toHaveBeenCalled();
      expect(extractionQueueMock.enqueueExtraction).not.toHaveBeenCalled();
    });

    it('should propagate transaction errors and not enqueue', async () => {
      s3ServiceMock.uploadFile.mockResolvedValue(undefined);
      prismaServiceMock.$transaction.mockRejectedValue(new Error('DB constraint violation'));

      await expect(service.uploadFileDirectly(mockFile, 'user-1')).rejects.toThrow(
        'DB constraint violation',
      );
      expect(extractionQueueMock.enqueueExtraction).not.toHaveBeenCalled();
    });

    it('should propagate queue enqueue errors', async () => {
      s3ServiceMock.uploadFile.mockResolvedValue(undefined);
      prismaServiceMock.$transaction.mockResolvedValue({
        upload: { id: 'upload-1' },
        extractionJob: { id: 'job-1', status: 'QUEUED' },
      });
      extractionQueueMock.enqueueExtraction.mockRejectedValue(
        new Error('Redis connection refused'),
      );

      await expect(service.uploadFileDirectly(mockFile, 'user-1')).rejects.toThrow(
        'Redis connection refused',
      );
    });
  });
});
