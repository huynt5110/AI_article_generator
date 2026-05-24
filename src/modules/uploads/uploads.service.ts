import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { S3Service } from './storage/s3.service';
import { ExtractionQueueService } from '../extraction/extraction-queue.service';
import * as crypto from 'crypto';
import { ExtractionJobStatus, UploadStatus } from '@prisma/client';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly extractionQueue: ExtractionQueueService,
  ) { }

  async uploadFileDirectly(file: Express.Multer.File, userId: string) {
    this.logger.debug(
      `Uploading file for user ${userId}: ${file.originalname}`,
    );

    const uploadId = crypto.randomUUID();
    const s3Key = `uploads/${userId}/${uploadId}/original.docx`;

    await this.s3Service.uploadFile(file.buffer, s3Key, file.mimetype);

    const result = await this.prisma.$transaction(async (tx) => {
      const upload = await tx.upload.create({
        data: {
          id: uploadId,
          userId,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          s3Key,
          bucket: this.s3Service.bucket,
          status: UploadStatus.UPLOADED,
        },
      });

      const extractionJob = await tx.extractionJob.create({
        data: {
          uploadId: upload.id,
          status: ExtractionJobStatus.QUEUED,
        },
      });

      return { upload, extractionJob };
    });

    await this.extractionQueue.enqueueExtraction({
      uploadId: result.upload.id,
      jobId: result.extractionJob.id,
    });

    return {
      uploadId: result.upload.id,
      jobId: result.extractionJob.id,
      status: result.extractionJob.status,
    };
  }
}
