import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { S3Service } from './storage/s3.service';
import { ExtractionQueueService } from '../extraction/extraction-queue.service';

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        { provide: PrismaService, useValue: {} },
        { provide: S3Service, useValue: { bucket: 'test-bucket' } },
        { provide: ExtractionQueueService, useValue: { enqueueExtraction: jest.fn() } },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
