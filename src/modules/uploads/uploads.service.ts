import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { S3Service } from './storage/s3.service';
import * as crypto from 'crypto';
import { UploadStatus } from '@prisma/client';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) { }

  async uploadFileDirectly(file: Express.Multer.File, userId: string) {
    this.logger.debug(`Uploading file directly for user ${userId}: ${file.originalname}`);

    // Generate unique upload ID
    const uploadId = crypto.randomUUID();

    // Construct deterministic S3 Key
    const s3Key = `uploads/${userId}/${uploadId}/original.docx`;

    // Step 1: Upload the file directly to S3
    await this.s3Service.uploadFile(file.buffer, s3Key, file.mimetype);

    // Step 2: Create the database record with UPLOADED status
    const upload = await this.prisma.upload.create({
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

    return {
      data: {
        uploadId: upload.id,
        s3Key,
        status: upload.status,
      },
    };
  }
}
